from typing import Dict, Any, List
from .control import ControlAgent
from .execution import ExecutionAgent
from .judge import JudgeAgent
from .base import AgentResponse

class AgenticWorkflow:
    def __init__(self):
        self.control_agent = ControlAgent()
        self.execution_agent = ExecutionAgent()
        self.judge_agent = JudgeAgent()

    async def run(self, user_input: str) -> Dict[str, Any]:
        """
        Main entry point for the agentic workflow.
        """
        # 1. Control Agent: Plan
        plan_response = await self.control_agent.run(user_input)
        plan = plan_response.metadata.get("plan", [])
        
        execution_results = []
        
        # 2. Execution Agent: Execute Plan
        if plan:
            for step in plan:
                tool_name = step.get("tool")
                # Assuming the plan might have args, or we infer them. 
                # For simplicity, we pass the user input or context if needed.
                # In a real system, the Control Agent should generate specific args.
                # Here we'll just pass the description as a potential arg or just run the tool if it takes no args.
                # This is a simplification.
                
                # Let's assume the Control Agent generates args in the plan or we default.
                # For this prototype, we'll try to guess args or just pass the whole step.
                args = {}
                if tool_name == "transcription":
                    # We need a file path. This is tricky without context.
                    # We'll assume the user input MIGHT contain a path or we skip if missing.
                    pass 
                elif tool_name == "summary":
                    # We need text. We might use previous result.
                    if execution_results and "text" in execution_results[-1]:
                         args = {"text": execution_results[-1]["text"]}
                
                # Execute
                result = await self.execution_agent.run({"tool": tool_name, "args": args})
                execution_results.append({
                    "step": step,
                    "result": result.content,
                    "data": result.metadata.get("result")
                })
        else:
            # Direct response (no tools needed)
            execution_results.append({"result": plan_response.content})

        # 3. Judge Agent: Evaluate
        judge_response = await self.judge_agent.run({
            "original_request": user_input,
            "execution_results": execution_results
        })
        
        return {
            "plan": plan,
            "execution_results": execution_results,
            "final_response": execution_results[-1]["result"] if execution_results else "No action taken",
            "evaluation": judge_response.content,
            "verdict": judge_response.metadata.get("verdict")
        }
