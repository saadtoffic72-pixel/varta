from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.services.cyclone_service import CycloneService
from app.schemas.cyclone import CycloneSummaryResponse, CycloneDetailResponse

router = APIRouter()

@router.get("", response_model=List[CycloneDetailResponse])
async def list_cyclones(
    status: Optional[str] = Query(None, description="Filter by status: Active, Dissipated, Historical"),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve all cyclones with track and forecast geometries."""
    return await CycloneService.get_all_cyclones(db, status=status)

@router.get("/active", response_model=List[CycloneDetailResponse])
async def list_active_cyclones(db: AsyncSession = Depends(get_db)):
    """Retrieve all currently active cyclones."""
    return await CycloneService.get_active_cyclones(db)

@router.get("/{cyclone_id}", response_model=CycloneDetailResponse)
async def get_cyclone(cyclone_id: int, db: AsyncSession = Depends(get_db)):
    """Retrieve detailed telemetry, past track, and forecast points for a specific cyclone."""
    cyclone = await CycloneService.get_cyclone_by_id(db, cyclone_id)
    if not cyclone:
        raise HTTPException(status_code=404, detail="Cyclone not found")
    return cyclone
