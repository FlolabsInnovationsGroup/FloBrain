from fastapi import APIRouter
from typing import List
from pydantic import BaseModel

class Recording(BaseModel):
    id: str
    title: str

router = APIRouter()

@router.get("/", response_model=List[Recording])
async def read_recordings():
    return [
        {"id": "1", "title": "Meeting with Team"},
        {"id": "2", "title": "Project Brainstorming"},
        {"id": "3", "title": "Client Interview"}
    ]
