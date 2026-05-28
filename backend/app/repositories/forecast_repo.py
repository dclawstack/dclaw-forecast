import uuid
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, update

from app.models.forecast import DataSeries, DataPoint, Forecast, ForecastPoint
from app.repositories.base_repo import BaseRepository


class DataSeriesRepository(BaseRepository[DataSeries]):
    def __init__(self, db: AsyncSession):
        super().__init__(db, DataSeries)

    async def update(self, item: DataSeries, data: dict) -> DataSeries:
        for key, val in data.items():
            setattr(item, key, val)
        item.updated_at = datetime.utcnow()
        await self.db.commit()
        await self.db.refresh(item)
        return item

    async def add_data_points(self, series_id: uuid.UUID, points: list[dict]) -> list[DataPoint]:
        objs = [DataPoint(data_series_id=series_id, **p) for p in points]
        self.db.add_all(objs)
        await self.db.commit()
        return objs

    async def get_data_points(self, series_id: uuid.UUID) -> list[DataPoint]:
        result = await self.db.execute(
            select(DataPoint)
            .where(DataPoint.data_series_id == series_id)
            .order_by(DataPoint.date)
        )
        return list(result.scalars().all())


class ForecastRepository(BaseRepository[Forecast]):
    def __init__(self, db: AsyncSession):
        super().__init__(db, Forecast)

    async def update(self, item: Forecast, data: dict) -> Forecast:
        for key, val in data.items():
            setattr(item, key, val)
        item.updated_at = datetime.utcnow()
        await self.db.commit()
        await self.db.refresh(item)
        return item

    async def save_forecast_points(self, forecast_id: uuid.UUID, points: list[dict]) -> None:
        objs = [ForecastPoint(forecast_id=forecast_id, **p) for p in points]
        self.db.add_all(objs)
        await self.db.commit()

    async def get_by_series(self, series_id: uuid.UUID) -> list[Forecast]:
        result = await self.db.execute(
            select(Forecast).where(Forecast.data_series_id == series_id)
        )
        return list(result.scalars().all())

    async def avg_mape(self) -> float | None:
        result = await self.db.execute(
            select(func.avg(Forecast.mape)).where(Forecast.mape.isnot(None))
        )
        return result.scalar()

    async def count_completed(self) -> int:
        result = await self.db.execute(
            select(func.count()).select_from(Forecast).where(Forecast.status == "completed")
        )
        return result.scalar() or 0

    async def recent(self, limit: int = 5) -> list[Forecast]:
        result = await self.db.execute(
            select(Forecast).order_by(Forecast.created_at.desc()).limit(limit)
        )
        return list(result.scalars().all())
