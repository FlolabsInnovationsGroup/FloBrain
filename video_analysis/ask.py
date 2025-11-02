#ask.py

import faiss
import json
import numpy as np
from sentence_transformers import SentenceTransformer
from transformers import pipeline

INDEX_FILE = "faiss.index"
METADATA_FILE = "metadata.json"
EMBED_MODEL = "all-MiniLM-L6-v2"
TOP_K = 3

# --- Embed the user’s question ---
def embed_question(question, model):
    return model.encode([question])[0]

# --- Load index + metadata ---
def load_index_and_chunks():
    index = faiss.read_index(INDEX_FILE)
    with open(METADATA_FILE, "r") as f:
        metadata = json.load(f)
    return index, metadata

# --- Query FAISS ---
def retrieve_relevant_chunks(question_embedding, index, metadata):
    distances, indices = index.search(np.array([question_embedding]), TOP_K)
    return [metadata[i] for i in indices[0]]

# --- Use FLAN-T5 model to answer based on visual context ---
def ask_local_model(question, context_chunks):
    context = "\n---\n".join(context_chunks)
    prompt = f"Answer the question using the visual scene descriptions below.\n\nContext:\n{context}\n\nQuestion: {question}"

    generator = pipeline("text2text-generation", model="google/flan-t5-small")
    output = generator(prompt, max_new_tokens=256)[0]["generated_text"]
    return output

# --- Main ---
def main():
    question = input(" Ask a question about the video: ")

    model = SentenceTransformer(EMBED_MODEL)
    index, metadata = load_index_and_chunks()
    question_embedding = embed_question(question, model)
    context_chunks = retrieve_relevant_chunks(question_embedding, index, metadata)

    answer = ask_local_model(question, context_chunks)
    print(f"\n Answer:\n{answer}")

if __name__ == "__main__":
    main()
