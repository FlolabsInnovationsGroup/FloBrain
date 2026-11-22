import os
import json
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
from memory.mongo_client import db

MODEL_NAME = "all-MiniLM-L6-v2"
INDEX_PATH = "memory/faiss_memory.index"
METADATA_PATH = "memory/faiss_metadata.json"

model = SentenceTransformer(MODEL_NAME)


def build_message_index():
    messages = list(db.messages.find({}))

    if not messages:
        if os.path.exists(INDEX_PATH):
            os.remove(INDEX_PATH)

        if os.path.exists(METADATA_PATH):
            os.remove(METADATA_PATH)

        print("No messages found. Existing FAISS index cleared.")
        return

    texts = [msg["content"] for msg in messages]
    ids = [str(msg["_id"]) for msg in messages]

    embeddings = model.encode(texts)
    embeddings = np.array(embeddings).astype("float32")

    index = faiss.IndexFlatL2(embeddings.shape[1])
    index.add(embeddings)

    faiss.write_index(index, INDEX_PATH)

    with open(METADATA_PATH, "w") as f:
        json.dump(ids, f)

    print(f"Indexed {len(texts)} messages successfully.")


def search_messages(query, top_k=3, max_distance=None):
    if not os.path.exists(INDEX_PATH) or not os.path.exists(METADATA_PATH):
        print("FAISS index not found. Run build_message_index() first.")
        return []

    index = faiss.read_index(INDEX_PATH)

    with open(METADATA_PATH, "r") as f:
        ids = json.load(f)

    query_embedding = model.encode([query])
    query_embedding = np.array(query_embedding).astype("float32")

    distances, indices = index.search(query_embedding, top_k)

    results = []

    for distance, idx in zip(distances[0], indices[0]):
        if idx == -1:
            continue

        if max_distance is not None and distance > max_distance:
            continue

        mongo_id = ids[idx]

        message = db.messages.find_one(
            {"_id": __import__("bson").ObjectId(mongo_id)}
        )

        if message:
            message["_id"] = str(message["_id"])
            message["semantic_distance"] = float(distance)
            results.append(message)

    return results