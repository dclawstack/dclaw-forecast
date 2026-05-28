from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.scenario import Scenario
from app.repositories.base_repo import BaseRepository


class ScenarioRepository(BaseRepository[Scenario]):
    def __init__(self, db: AsyncSession):
        super().__init__(db, Scenario)

    async def update(self, item: Scenario, data: dict) -> Scenario:
        for key, val in data.items():
            setattr(item, key, val)
        item.updated_at = datetime.utcnow()
        await self.db.commit()
        await self.db.refresh(item)
        return item
