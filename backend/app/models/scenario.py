import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy import ForeignKey, String, Float, JSON, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base
from app.core.utils import utc_now


class Scenario(Base):
    __tablename__ = "scenarios"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    base_forecast_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("forecasts.id", ondelete="SET NULL"), nullable=True
    )
    assumptions: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    adjustment_pct: Mapped[float] = mapped_column(Float, default=0.0)
    status: Mapped[str] = mapped_column(String(50), default="draft")  # draft, active, archived
    created_at: Mapped[datetime] = mapped_column(default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(default=utc_now, onupdate=utc_now)
