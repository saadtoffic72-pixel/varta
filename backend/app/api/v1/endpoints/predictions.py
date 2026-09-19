from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.services.prediction_service import prediction_service
from app.schemas.prediction import (
    GenesisDetectionRequest, GenesisDetectionResponse,
    IntensityClassificationRequest, IntensityClassificationResponse,
    TrackPredictionRequest, TrackPredictionResponse,
    RiskAnalysisRequest, RiskAnalysisResponse
)

router = APIRouter()

@router.post("/genesis", response_model=GenesisDetectionResponse)
async def detect_genesis(request: GenesisDetectionRequest):
    """
    Diagnose tropical cyclogenesis potential based on environmental parameters
    (SST, low-level vorticity, mid-tropospheric RH, vertical wind shear).
    """
    return await prediction_service.detect_genesis(request)

@router.post("/intensity", response_model=IntensityClassificationResponse)
async def classify_intensity(
    request: IntensityClassificationRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Classify storm intensity into IMD categories and estimate Dvorak T-number,
    central pressure drop, and 24-hour intensification trajectory.
    """
    return await prediction_service.classify_intensity(request, db)

@router.post("/track", response_model=TrackPredictionResponse)
async def predict_track(
    request: TrackPredictionRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Generate ensemble trajectory forecasts (12h to 120h), 70% uncertainty cone GeoJSON,
    and coastal landfall predictions.
    """
    try:
        return await prediction_service.predict_track(request, db)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/risk", response_model=RiskAnalysisResponse)
async def analyze_risk(
    request: RiskAnalysisRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Evaluate multi-hazard coastal risk (storm surge height, destructive wind field,
    inundation area, population vulnerability) across key coastal districts.
    """
    try:
        return await prediction_service.analyze_risk(request, db)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
