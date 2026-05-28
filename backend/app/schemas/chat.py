import uuid
from datetime import datetime
from typing import Optional, Any
from pydantic import BaseModel, ConfigDict


class ChatMessageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    session_id: str
    role: str
    content: str
    context_data: Optional[dict[str, Any]] = None
    created_at: datetime


class ChatRequest(BaseModel):
    session_id: str
    message: str
    context: Optional[dict[str, Any]] = None


class ChatResponse(BaseModel):
    session_id: str
    message: str
    suggestions: list[str] = []
    context_data: Optional[dict[str, Any]] = None


class ChatHistoryOut(BaseModel):
    session_id: str
    messages: list[ChatMessageOut]
