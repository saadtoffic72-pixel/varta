from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.services.alert_service import alert_service
from app.schemas.alert import AlertBulletinResponse, CoastalZoneResponse, GenerateAlertRequest

router = APIRouter()

@router.get("/active", response_model=List[AlertBulletinResponse])
async def get_active_alerts(db: AsyncSession = Depends(get_db)):
    """Retrieve all active official CAP-compliant cyclone bulletins."""
    return await alert_service.get_active_alerts(db)

@router.get("/coastal-zones", response_model=List[CoastalZoneResponse])
async def get_coastal_zones(db: AsyncSession = Depends(get_db)):
    """Retrieve vulnerability, shelter statistics, and alert statuses for coastal districts."""
    return await alert_service.get_coastal_zones(db)

@router.post("/generate", response_model=AlertBulletinResponse)
async def generate_alert_bulletin(
    request: GenerateAlertRequest,
    db: AsyncSession = Depends(get_db)
):
    """Generate a new official IMD-formatted CAP cyclone bulletin with disaster mitigation directives."""
    try:
        return await alert_service.generate_bulletin(request, db)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
