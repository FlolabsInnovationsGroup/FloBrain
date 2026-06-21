from fastapi import APIRouter
from app.models.schemas import ChatRequest, ChatResponse
from app.services import vector_db, llm, synthesis
import base64

router = APIRouter()


@router.post("/", response_model=ChatResponse)
async def chat(request: ChatRequest):
    model = request.model or "gpt-3.5-turbo"
    last_user_message = ""

    if request.messages:
        messages = [m.model_dump() for m in request.messages]
        last_user_message = next(
            (m["content"] for m in reversed(messages) if m.get("role") == "user"),
            "",
        )
    elif request.message:
        last_user_message = request.message
        context = ""
        try:
            vector_db.vector_db.search_similar(request.message)
        except Exception as e:
            print(f"Vector search failed: {e}")

        messages = [{"role": "system", "content": "You are a helpful assistant."}]
        if context:
            messages.append({"role": "user", "content": f"Context: {context}"})
        messages.append({"role": "user", "content": request.message})
    else:
        return ChatResponse(
            response_text="Error: message or messages required.",
            estimated=True,
        )

    response = llm.generate_response(messages, model=model)

    audio_content = None
    if request.voice_id:
        audio_generator = synthesis.synthesize_speech(response.text, request.voice_id)
        if audio_generator:
            audio_bytes = b"".join(audio_generator)
            audio_content = base64.b64encode(audio_bytes).decode("utf-8")

    if last_user_message:
        try:
            vector_db.vector_db.add_text(last_user_message)
            vector_db.vector_db.add_text(response.text)
        except Exception as e:
            print(f"Failed to save to memory: {e}")

    return ChatResponse(
        response_text=response.text,
        audio_content=audio_content,
        prompt_tokens=response.prompt_tokens,
        completion_tokens=response.completion_tokens,
        total_tokens=response.total_tokens,
        model=response.model,
        provider=response.provider,
        estimated=response.estimated,
    )
