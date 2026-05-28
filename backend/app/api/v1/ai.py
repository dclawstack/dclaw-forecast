from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.repositories.chat_repo import ChatRepository
from app.schemas.chat import ChatRequest, ChatResponse, ChatHistoryOut
from app.services.forecast_ai import chat_with_copilot

router = APIRouter()


@router.post("/forecast-chat", response_model=ChatResponse)
async def forecast_chat(body: ChatRequest, db: AsyncSession = Depends(get_db)):
    """AI Forecast Copilot chat endpoint."""
    repo = ChatRepository(db)

    await repo.save_message(body.session_id, "user", body.message, body.context)

    history_msgs = await repo.get_session_messages(body.session_id)
    history = [{"role": m.role, "content": m.content} for m in history_msgs[:-1]]

    response_text, suggestions = await chat_with_copilot(
        message=body.message,
        history=history,
        context=body.context,
    )

    await repo.save_message(body.session_id, "assistant", response_text)

    return ChatResponse(
        session_id=body.session_id,
        message=response_text,
        suggestions=suggestions,
    )


@router.get("/forecast-chat/{session_id}/history", response_model=ChatHistoryOut)
async def get_chat_history(session_id: str, db: AsyncSession = Depends(get_db)):
    repo = ChatRepository(db)
    messages = await repo.get_session_messages(session_id)
    return ChatHistoryOut(session_id=session_id, messages=messages)


@router.delete("/forecast-chat/{session_id}/history", status_code=204)
async def clear_chat_history(session_id: str, db: AsyncSession = Depends(get_db)):
    repo = ChatRepository(db)
    msgs = await repo.get_session_messages(session_id)
    for msg in msgs:
        await repo.delete(msg)
