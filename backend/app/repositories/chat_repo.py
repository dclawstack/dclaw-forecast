from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.chat import ChatMessage
from app.repositories.base_repo import BaseRepository


class ChatRepository(BaseRepository[ChatMessage]):
    def __init__(self, db: AsyncSession):
        super().__init__(db, ChatMessage)

    async def get_session_messages(self, session_id: str) -> list[ChatMessage]:
        result = await self.db.execute(
            select(ChatMessage)
            .where(ChatMessage.session_id == session_id)
            .order_by(ChatMessage.created_at)
        )
        return list(result.scalars().all())

    async def save_message(self, session_id: str, role: str, content: str, context_data: dict | None = None) -> ChatMessage:
        msg = ChatMessage(session_id=session_id, role=role, content=content, context_data=context_data)
        self.db.add(msg)
        await self.db.commit()
        await self.db.refresh(msg)
        return msg
