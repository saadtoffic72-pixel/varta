from typing import List, Optional
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.cyclone import Cyclone, TrackPoint, ForecastPoint
from app.schemas.cyclone import CycloneSummaryResponse, CycloneDetailResponse

class CycloneService:
    @staticmethod
    async def get_all_cyclones(db: AsyncSession, status: Optional[str] = None) -> List[Cyclone]:
        stmt = select(Cyclone).options(
            selectinload(Cyclone.track_points),
            selectinload(Cyclone.forecast_points)
        ).order_by(desc(Cyclone.is_active), desc(Cyclone.genesis_date))
        
        if status:
            stmt = stmt.where(Cyclone.status == status)
            
        result = await db.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def get_cyclone_by_id(db: AsyncSession, cyclone_id: int) -> Optional[Cyclone]:
        stmt = select(Cyclone).where(Cyclone.id == cyclone_id).options(
            selectinload(Cyclone.track_points),
            selectinload(Cyclone.forecast_points)
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_active_cyclones(db: AsyncSession) -> List[Cyclone]:
        stmt = select(Cyclone).where(Cyclone.is_active == True).options(
            selectinload(Cyclone.track_points),
            selectinload(Cyclone.forecast_points)
        ).order_by(desc(Cyclone.peak_wind_speed_knots))
        result = await db.execute(stmt)
        return list(result.scalars().all())
