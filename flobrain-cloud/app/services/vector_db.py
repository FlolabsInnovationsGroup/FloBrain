import os
import faiss  # type: ignore
import numpy as np
from openai import OpenAI
from app.core.config import settings
import logging


class VectorDBService:
    def __init__(self, index_path="faiss.index"):
        self.index_path = index_path
        self.dimension = 1536  # OpenAI text-embedding-ada-002 dimension
        self.client = (
            OpenAI(api_key=settings.OPENAI_API_KEY) if settings.OPENAI_API_KEY else None
        )
        self.index = self._load_or_create_index()

    def _load_or_create_index(self):
        if os.path.exists(self.index_path):
            try:
                return faiss.read_index(self.index_path)
            except Exception as e:
                logging.error(f"Failed to load index: {e}. Creating new one.")

        return faiss.IndexFlatIP(self.dimension)

    def _get_embedding(self, text: str):
        if not self.client:
            raise ValueError("OpenAI client not initialized")

        resp = self.client.embeddings.create(model="text-embedding-ada-002", input=text)
        vec = np.array(resp.data[0].embedding, dtype="float32")
        faiss.normalize_L2(vec.reshape(1, -1))
        return vec

    def add_text(self, text: str):
        vec = self._get_embedding(text)
        self.index.add(vec.reshape(1, self.dimension))
        faiss.write_index(self.index, self.index_path)
        return self.index.ntotal

    def search_similar(self, text: str, k=1):
        vec = self._get_embedding(text)
        D, indices = self.index.search(vec.reshape(1, self.dimension), k)
        return D[0], indices[0]


vector_db = VectorDBService()
