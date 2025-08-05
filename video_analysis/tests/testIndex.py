import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
from ask import retrieve_relevant_chunks

def test_faiss_index_build_and_search(tmp_path):
    captions = ["dog in park", "cat on couch", "person riding bike"]
    model = SentenceTransformer("all-MiniLM-L6-v2")
    embeddings = model.encode(captions)

    dim = embeddings.shape[1]
    index = faiss.IndexFlatL2(dim)
    index.add(np.array(embeddings))

    # Embed a query similar to "dog"
    query_embedding = model.encode(["puppy running"])[0]
    results = retrieve_relevant_chunks(query_embedding, index, captions)
    
    assert isinstance(results, list)
    assert any("dog" in r or "puppy" in r for r in results)
