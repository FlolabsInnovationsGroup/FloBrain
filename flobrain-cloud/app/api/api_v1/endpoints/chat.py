from fastapi import APIRouter
from app.models.schemas import ChatRequest, ChatResponse
from app.services import vector_db, llm, synthesis
import base64

router = APIRouter()


@router.post("/", response_model=ChatResponse)
async def chat(request: ChatRequest):
    # 1. Retrieve context
    try:
        dist, idx = vector_db.vector_db.search_similar(request.message)
        # In a real app, we would fetch the actual text from a DB using idx
        # For now, we just log it or use a placeholder if we don't have the text mapping
        # The prototype read from 'transcripts.txt'. Let's assume we don't have that yet or it's empty.
        context = ""
        # TODO: Implement text retrieval from ID
    except Exception as e:
        print(f"Vector search failed: {e}")
        context = ""

    # 2. Generate Response
    messages = [{"role": "system", "content": "You are a helpful assistant."}]
    if context:
        messages.append({"role": "user", "content": f"Context: {context}"})
    messages.append({"role": "user", "content": request.message})

    response = llm.generate_response(messages)

    # 3. Synthesize Speech (Optional)
    audio_content = None
    if request.voice_id:
        audio_generator = synthesis.synthesize_speech(response.text, request.voice_id)
        if audio_generator:
            # ElevenLabs returns a generator of bytes. We need to consume it.
            audio_bytes = b"".join(audio_generator)
            audio_content = base64.b64encode(audio_bytes).decode("utf-8")

    # 4. Save to Vector DB (Memory)
    # We should probably save the user message and the response
    try:
        vector_db.vector_db.add_text(request.message)
        vector_db.vector_db.add_text(response.text)
    except Exception as e:
        print(f"Failed to save to memory: {e}")

    return {"response_text": response.text, "audio_content": audio_content}
