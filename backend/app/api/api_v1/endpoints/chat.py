
from fastapi import APIRouter, HTTPException
from caipo_backend.app.models.schemas import ChatRequest, ChatResponse
from caipo_backend.app.services import vector_db, llm, synthesis
from caipo_backend.app.agents.workflow import AgenticWorkflow
import base64

router = APIRouter()

@router.post("/", response_model=ChatResponse)
async def chat(request: ChatRequest):
    # Initialize Workflow
    workflow = AgenticWorkflow()
    
    # Run Workflow
    try:
        result = await workflow.run(request.message)
        
        # Construct Response
        response_text = result["final_response"]
        
        # Optional: Synthesize speech if requested (using the execution agent logic or direct service)
        audio_content = None
        if request.voice_id:
            # We could also make this a step in the agent workflow, but keeping it here for backward compatibility
            from caipo_backend.app.services import synthesis
            import base64
            audio_generator = synthesis.synthesize_speech(response_text, request.voice_id)
            if audio_generator:
                audio_bytes = b"".join(audio_generator)
                audio_content = base64.b64encode(audio_bytes).decode("utf-8")

        return {"response_text": response_text, "audio_content": audio_content}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
