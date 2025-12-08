from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class AgentMessage(BaseModel):
    role: str
    content: str
    metadata: Optional[Dict[str, Any]] = None

class AgentResponse(BaseModel):
    content: str
    metadata: Optional[Dict[str, Any]] = None
    tool_calls: Optional[List[Dict[str, Any]]] = None

class BaseAgent(ABC):
    def __init__(self, name: str, role: str):
        self.name = name
        self.role = role
        self.memory: List[AgentMessage] = []

    def add_to_memory(self, message: AgentMessage):
        self.memory.append(message)

    def get_memory(self) -> List[Dict[str, Any]]:
        return [m.dict() for m in self.memory]

    @abstractmethod
    async def run(self, input_data: Any) -> AgentResponse:
        """
        Execute the agent's main logic.
        """
        pass
