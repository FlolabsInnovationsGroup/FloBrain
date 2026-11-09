from pprint import pprint

from memory.embedding_service import build_message_index
from memory.hybrid_retrieval_service import (
    retrieve_context,
    build_llm_context,
)


build_message_index()

query = "Show my previous France travel plan"

result = retrieve_context(
    query=query,
    top_k=2,
    user_id="user_1",
)

print("\nStructured hybrid retrieval result:")
pprint(result)

print("\nContext prepared for the LLM:")
print(
    build_llm_context(
        query=query,
        top_k=2,
        user_id="user_1",
    )
)
