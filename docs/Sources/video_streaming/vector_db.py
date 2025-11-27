import numpy as np
import pickle
from datetime import datetime
class VectorDB:
    def __init__(self):
        self.entries = []

    def add(self, embedding, meta):
        self.entries.append({'embedding': np.array(embedding), 'meta': meta})

    def save(self, path="vectordb.pkl"):
        with open(path, "wb") as f:
            pickle.dump(self.entries, f)

    def load(self, path="vectordb.pkl"):
        try:
            with open(path, "rb") as f:
                self.entries = pickle.load(f)
        except FileNotFoundError:
            self.entries = []

    def search(self, query_vec, top_k=3):
        query_vec = np.array(query_vec)
        sims = []
        for entry in self.entries:
            v = entry['embedding']
            sim = np.dot(query_vec, v) / (np.linalg.norm(query_vec) * np.linalg.norm(v) + 1e-6)
            sims.append((sim, entry))
        sims.sort(reverse=True)
        return [e for _, e in sims[:top_k]]