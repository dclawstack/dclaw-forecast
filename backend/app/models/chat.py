import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy import String, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base
from app.core.utils import utc_now


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    session_id: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    role: Mapped[str] = mapped_column(String(50), nullable=False)  # user, assistant
    content: Mapped[str] = mapped_column(Text, nullable=False)
    context_data: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(default=utc_now)
