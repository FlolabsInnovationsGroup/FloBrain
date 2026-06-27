from memory.embedding_service import build_message_index, search_messages

build_message_index()

results = search_messages("travel plan for France", top_k=2)

print("Search Results:")

for result in results:
    print(result)