from typing import Any
from .base import BaseAgent, AgentResponse, AgentMessage
from caipo_backend.app.services import llm

class JudgeAgent(BaseAgent):
    def __init__(self):
        super().__init__(name="JudgeAgent", role="Evaluator")

    async def run(self, input_data: Any) -> AgentResponse:
        """
        Evaluates the execution results against the original user request.
        input_data expected format: {"original_request": "...", "execution_results": [...]}
        """
        original_request = input_data.get("original_request")
        execution_results = input_data.get("execution_results")
        
        system_prompt = """
        You are the Judge Agent. Your goal is to evaluate if the executed actions have satisfied the user's original request.
        
        Input:
        - Original Request
        - List of executed steps and their results
        
        Output:
        - "PASS": If the request is satisfied.
        - "FAIL": If the request is not satisfied, along with a reason and suggestion.
        """
        
        content = f"Original Request: {original_request}\n\nExecution Results:\n{execution_results}"
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": content}
        ]
        
        evaluation = llm.generate_response(messages)
        
        return AgentResponse(
            content=evaluation,
            metadata={"verdict": "PASS" if "PASS" in evaluation else "FAIL"}
        )
