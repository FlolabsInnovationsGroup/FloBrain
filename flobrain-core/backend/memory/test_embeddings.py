from memory.embedding_service import build_message_index, search_messages

build_message_index()

results = search_messages(
    "travel plan for France",
    top_k=5,
    max_distance=1.0
)