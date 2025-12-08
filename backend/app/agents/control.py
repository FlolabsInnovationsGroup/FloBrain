from typing import List, Any
from .base import BaseAgent, AgentResponse, AgentMessage
from caipo_backend.app.services import llm
import json

class ControlAgent(BaseAgent):
    def __init__(self):
        super().__init__(name="ControlAgent", role="Orchestrator")

    async def run(self, input_data: str) -> AgentResponse:
        """
        Analyzes the user input and creates a plan of execution.
        """
        # 1. Add user input to memory
        self.add_to_memory(AgentMessage(role="user", content=input_data))

        # 2. Construct prompt for planning
        system_prompt = """
        You are the Control Agent. Your goal is to analyze the user's request and create a plan of execution.
        You have access to the following tools (Execution Agents):
        - transcription: Converts audio to text.
        - summary: Summarizes text.
        - tags: Generates tags for text.
        - embedding: Creates vector embeddings for text.
        - search: Searches the vector database.
        
        Output your plan as a JSON list of steps. Each step should have a 'tool' and 'description'.
        Example: [{"tool": "transcription", "description": "Transcribe audio"}, {"tool": "summary", "description": "Summarize transcript"}]
        If the request is simple conversation, return an empty list or a direct response plan.
        """
        
        messages = [{"role": "system", "content": system_prompt}]
        messages.extend([{"role": "user", "content": m["content"]} for m in self.get_memory() if m["role"] == "user"]) # Simplified history

        # 3. Call LLM to get the plan
        # Note: In a real implementation, we might want a structured output parser.
        # For now, we rely on the LLM following instructions.
        response_text = llm.generate_response(messages)
        
        try:
            # Attempt to parse JSON plan
            # This is a simplification; robust parsing is needed for production
            # We might need to extract JSON from markdown code blocks if the LLM adds them
            clean_text = response_text.replace("```json", "").replace("```", "").strip()
            plan = json.loads(clean_text)
            
            return AgentResponse(
                content="Plan created",
                metadata={"plan": plan}
            )
        except json.JSONDecodeError:
            # Fallback if no valid JSON found - treat as direct response
            return AgentResponse(
                content=response_text,
                metadata={"plan": []} # No tools needed
            )
