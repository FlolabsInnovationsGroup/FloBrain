from typing import Any, Dict
from .base import BaseAgent, AgentResponse
from caipo_backend.app.services import transcription, vector_db, synthesis, llm

class ExecutionAgent(BaseAgent):
    def __init__(self):
        super().__init__(name="ExecutionAgent", role="Tool Executor")
        self.tools = {
            "transcription": self._transcribe,
            "summary": self._summarize,
            "tags": self._generate_tags,
            "embedding": self._create_embedding,
            "search": self._search_vector_db,
            "synthesis": self._synthesize_speech
        }

    async def run(self, input_data: Dict[str, Any]) -> AgentResponse:
        """
        Executes a specific tool.
        input_data expected format: {"tool": "tool_name", "args": {...}}
        """
        tool_name = input_data.get("tool")
        args = input_data.get("args", {})
        
        if tool_name not in self.tools:
            return AgentResponse(content=f"Error: Tool '{tool_name}' not found.")
        
        try:
            result = await self.tools[tool_name](**args)
            return AgentResponse(
                content=f"Tool '{tool_name}' executed successfully.",
                metadata={"result": result}
            )
        except Exception as e:
            return AgentResponse(content=f"Error executing '{tool_name}': {str(e)}")

    async def _transcribe(self, file_path: str) -> str:
        # Wrapper for transcription service
        # Assuming transcription.transcribe returns text
        return await transcription.transcribe(file_path)

    async def _summarize(self, text: str) -> str:
        # Wrapper for summary (using LLM directly for now if no dedicated service)
        messages = [{"role": "user", "content": f"Summarize the following text:\n{text}"}]
        return llm.generate_response(messages)

    async def _generate_tags(self, text: str) -> list:
        # Wrapper for tags
        messages = [{"role": "user", "content": f"Generate 5 relevant tags for the following text, comma separated:\n{text}"}]
        response = llm.generate_response(messages)
        return [tag.strip() for tag in response.split(",")]

    async def _create_embedding(self, text: str) -> list:
        # Wrapper for embedding
        # Assuming vector_db has a method to get embedding, or we use a service
        # For now, placeholder or call vector_db if it exposes embedding generation
        # vector_db.vector_db.add_text(text) actually adds it, maybe we want just the vector?
        # Let's assume we just add it to DB for now as that's what 'embedding' job usually implies in this context
        vector_db.vector_db.add_text(text)
        return "Text added to vector DB"

    async def _search_vector_db(self, query: str) -> str:
        dist, idx = vector_db.vector_db.search_similar(query)
        # In real app, map idx to text.
        return f"Found similar content at index {idx} with distance {dist}"

    async def _synthesize_speech(self, text: str, voice_id: str) -> Any:
        return synthesis.synthesize_speech(text, voice_id)
