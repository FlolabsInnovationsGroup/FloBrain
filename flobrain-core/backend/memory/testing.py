"""Shared helpers that keep memory tests away from real storage and services."""

import hashlib
import io
import re
import shutil
import tempfile

import numpy as np
from chromadb.api.types import EmbeddingFunction
from django.test import override_settings


class FakeEmbeddingFunction(EmbeddingFunction):
    """Deterministic hashed bag-of-words embedding; never downloads a model.

    Texts that share words get similar vectors, texts with no shared words are
    orthogonal, so tests can reason about which memories are related.
    """

    DIMENSIONS = 256

    def __init__(self):
        pass

    def __call__(self, input):
        return [self._embed(text) for text in input]

    def _embed(self, text):
        vector = np.zeros(self.DIMENSIONS, dtype=np.float32)
        for word in re.findall(r"\w+", (text or "").lower()):
            bucket = int(hashlib.sha256(word.encode("utf-8")).hexdigest(), 16) % self.DIMENSIONS
            vector[bucket] += 1.0
        norm = np.linalg.norm(vector)
        if norm > 0:
            vector /= norm
        else:
            vector[0] = 1.0
        return vector

    @staticmethod
    def name():
        return "flobrain-test-fake"

    def get_config(self):
        return {}

    @staticmethod
    def build_from_config(config):
        return FakeEmbeddingFunction()


class FailingEmbeddingFunction(FakeEmbeddingFunction):
    """Raises on every call, to exercise index failure handling."""

    def __call__(self, input):
        raise RuntimeError("synthetic embedding failure")

    @staticmethod
    def name():
        return "flobrain-test-failing"

    @staticmethod
    def build_from_config(config):
        return FailingEmbeddingFunction()


class FakeS3Client:
    """In-memory stand-in for a boto3 S3 client (put_object/get_object only)."""

    def __init__(self):
        self.objects = {}
        self.calls = []

    def put_object(self, Bucket, Key, Body):
        self.calls.append(("put_object", Bucket, Key))
        self.objects[(Bucket, Key)] = Body
        return {}

    def get_object(self, Bucket, Key):
        self.calls.append(("get_object", Bucket, Key))
        return {"Body": io.BytesIO(self.objects[(Bucket, Key)])}

    def delete_object(self, Bucket, Key):
        self.calls.append(("delete_object", Bucket, Key))
        self.objects.pop((Bucket, Key), None)
        return {}

    def list_objects_v2(self, Bucket, Prefix="", ContinuationToken=None, MaxKeys=2):
        """Paginates with a tiny page size so callers must follow continuation tokens."""
        self.calls.append(("list_objects_v2", Bucket, Prefix))
        keys = sorted(k for b, k in self.objects if b == Bucket and k.startswith(Prefix))
        start = int(ContinuationToken or 0)
        page = keys[start:start + MaxKeys]
        response = {"Contents": [{"Key": k} for k in page], "IsTruncated": start + MaxKeys < len(keys)}
        if response["IsTruncated"]:
            response["NextContinuationToken"] = str(start + MaxKeys)
        return response


class IsolatedVectorStoreMixin:
    """Point the Chroma store at a fresh temp directory and a fake embedder."""

    vector_collection_name = "test_memory"
    embedding_function_path = "memory.testing.FakeEmbeddingFunction"

    @classmethod
    def setUpClass(cls):
        cls.vector_db_path = tempfile.mkdtemp(prefix="memory-vector-db-")
        cls._vector_settings = override_settings(
            MEMORY_VECTOR_DB_PATH=cls.vector_db_path,
            MEMORY_VECTOR_COLLECTION=cls.vector_collection_name,
            MEMORY_EMBEDDING_FUNCTION=cls.embedding_function_path,
        )
        cls._vector_settings.enable()
        super().setUpClass()

    @classmethod
    def tearDownClass(cls):
        super().tearDownClass()
        cls._vector_settings.disable()
        shutil.rmtree(cls.vector_db_path, ignore_errors=True)

    def setUp(self):
        super().setUp()
        from . import tier_2

        # Chroma is not rolled back with the test DB, so start every test empty
        tier_2.reset_vector_store()
        self.addCleanup(tier_2.reset_vector_store)
        collection = tier_2.get_collection()
        existing_ids = collection.get()["ids"]
        if existing_ids:
            collection.delete(ids=existing_ids)
