import uuid
from datetime import datetime, date
from typing import Optional
from sqlalchemy import ForeignKey, String, Float, Integer, Date, JSON, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base
from app.core.utils import utc_now


class DataSeries(Base):
    __tablename__ = "data_series"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    unit: Mapped[str] = mapped_column(String(100), default="units")
    data_type: Mapped[str] = mapped_column(String(50), default="demand")  # demand, revenue, headcount
    created_at: Mapped[datetime] = mapped_column(default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(default=utc_now, onupdate=utc_now)

    data_points: Mapped[list["DataPoint"]] = relationship(
        back_populates="data_series", lazy="selectin", cascade="all, delete-orphan"
    )
    forecasts: Mapped[list["Forecast"]] = relationship(
        back_populates="data_series", lazy="selectin", cascade="all, delete-orphan"
    )


class DataPoint(Base):
    __tablename__ = "data_points"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    data_series_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("data_series.id", ondelete="CASCADE"), nullable=False
    )
    date: Mapped[date] = mapped_column(Date, nullable=False)
    value: Mapped[float] = mapped_column(Float, nullable=False)
    created_at: Mapped[datetime] = mapped_column(default=utc_now)

    data_series: Mapped["DataSeries"] = relationship(back_populates="data_points", lazy="selectin")


class Forecast(Base):
    __tablename__ = "forecasts"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    data_series_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("data_series.id", ondelete="SET NULL"), nullable=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    model_type: Mapped[str] = mapped_column(String(50), default="ensemble")  # linear, ets, ensemble
    horizon_months: Mapped[int] = mapped_column(Integer, default=12)
    status: Mapped[str] = mapped_column(String(50), default="pending")  # pending, running, completed, failed
    mape: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    created_at: Mapped[datetime] = mapped_column(default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(default=utc_now, onupdate=utc_now)

    data_series: Mapped[Optional["DataSeries"]] = relationship(back_populates="forecasts", lazy="selectin")
    forecast_points: Mapped[list["ForecastPoint"]] = relationship(
        back_populates="forecast", lazy="selectin", cascade="all, delete-orphan"
    )


class ForecastPoint(Base):
    __tablename__ = "forecast_points"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    forecast_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("forecasts.id", ondelete="CASCADE"), nullable=False
    )
    date: Mapped[date] = mapped_column(Date, nullable=False)
    value: Mapped[float] = mapped_column(Float, nullable=False)
    lower_bound: Mapped[float] = mapped_column(Float, nullable=False)
    upper_bound: Mapped[float] = mapped_column(Float, nullable=False)

    forecast: Mapped["Forecast"] = relationship(back_populates="forecast_points", lazy="selectin")
