from typing import List, Dict, Any
from datetime import datetime
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.model_registry import AIModelMetadata
from app.models.dataset import DatasetSource

class AdminService:
    @staticmethod
    async def get_all_models(db: AsyncSession) -> List[AIModelMetadata]:
        stmt = select(AIModelMetadata).order_by(AIModelMetadata.task)
        res = await db.execute(stmt)
        return list(res.scalars().all())

    @staticmethod
    async def set_active_model(db: AsyncSession, model_id: int) -> AIModelMetadata:
        stmt = select(AIModelMetadata).where(AIModelMetadata.id == model_id)
        res = await db.execute(stmt)
        model = res.scalar_one_or_none()
        if not model:
            raise ValueError("Model not found")

        # Set all models in same task to inactive
        await db.execute(
            update(AIModelMetadata).where(AIModelMetadata.task == model.task).values(active_in_prod=False)
        )
        model.active_in_prod = True
        await db.commit()
        await db.refresh(model)
        return model

    @staticmethod
    async def get_all_datasets(db: AsyncSession) -> List[DatasetSource]:
        stmt = select(DatasetSource).order_by(DatasetSource.id)
        res = await db.execute(stmt)
        return list(res.scalars().all())

    @staticmethod
    async def sync_dataset(db: AsyncSession, dataset_id: int) -> DatasetSource:
        stmt = select(DatasetSource).where(DatasetSource.id == dataset_id)
        res = await db.execute(stmt)
        ds = res.scalar_one_or_none()
        if not ds:
            raise ValueError("Dataset not found")

        ds.last_synced = datetime.utcnow()
        ds.status = "Operational"
        ds.records_count += 128
        await db.commit()
        await db.refresh(ds)
        return ds

admin_service = AdminService()
