from typing import Dict, Any, Optional
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from app.models.cyclone import Cyclone, TrackPoint, ForecastPoint
from app.ai_modules.genesis_detector import GenesisDetectionEngine
from app.ai_modules.intensity_classifier import IntensityClassificationEngine
from app.ai_modules.track_predictor import TrackPredictionEngine
from app.ai_modules.risk_analyzer import RiskAnalysisEngine
from app.schemas.prediction import (
    GenesisDetectionRequest, GenesisDetectionResponse,
    IntensityClassificationRequest, IntensityClassificationResponse,
    TrackPredictionRequest, TrackPredictionResponse,
    RiskAnalysisRequest, RiskAnalysisResponse
)

class PredictionService:
    def __init__(self):
        self.genesis_engine = GenesisDetectionEngine()
        self.intensity_engine = IntensityClassificationEngine()
        self.track_engine = TrackPredictionEngine()
        self.risk_engine = RiskAnalysisEngine()

    async def detect_genesis(self, request: GenesisDetectionRequest) -> GenesisDetectionResponse:
        results = self.genesis_engine.predict(request.model_dump())
        return GenesisDetectionResponse(**results)

    async def classify_intensity(self, request: IntensityClassificationRequest, db: Optional[AsyncSession] = None) -> IntensityClassificationResponse:
        input_data = request.model_dump()
        if request.cyclone_id and db:
            stmt = select(Cyclone).where(Cyclone.id == request.cyclone_id)
            res = await db.execute(stmt)
            cyclone = res.scalar_one_or_none()
            if cyclone:
                # Use latest known observation if not specified
                if not request.current_wind_speed_knots and cyclone.peak_wind_speed_knots:
                    input_data["current_wind_speed_knots"] = cyclone.peak_wind_speed_knots
                if not request.central_pressure_hpa and cyclone.min_pressure_hpa:
                    input_data["central_pressure_hpa"] = cyclone.min_pressure_hpa

        results = self.intensity_engine.predict(input_data)
        return IntensityClassificationResponse(**results)

    async def predict_track(self, request: TrackPredictionRequest, db: AsyncSession) -> TrackPredictionResponse:
        stmt = select(Cyclone).where(Cyclone.id == request.cyclone_id)
        res = await db.execute(stmt)
        cyclone = res.scalar_one_or_none()
        
        if not cyclone:
            raise ValueError(f"Cyclone with ID {request.cyclone_id} not found")

        # Get latest track point
        pts_stmt = select(TrackPoint).where(TrackPoint.cyclone_id == cyclone.id).order_by(TrackPoint.timestamp.desc())
        pts_res = await db.execute(pts_stmt)
        latest_pt = pts_res.scalars().first()

        curr_lat = latest_pt.latitude if latest_pt else 15.0
        curr_lon = latest_pt.longitude if latest_pt else 88.0
        curr_wind = latest_pt.wind_speed_knots if latest_pt else cyclone.peak_wind_speed_knots
        curr_pres = latest_pt.central_pressure_hpa if latest_pt else cyclone.min_pressure_hpa
        speed_kmh = latest_pt.movement_speed_kmh if latest_pt else 16.0
        dir_deg = latest_pt.movement_direction_deg if latest_pt else 330.0

        model_input = {
            "cyclone_id": cyclone.id,
            "cyclone_name": cyclone.name,
            "current_lat": curr_lat,
            "current_lon": curr_lon,
            "current_wind_kts": curr_wind,
            "current_pressure": curr_pres,
            "movement_speed_kmh": speed_kmh,
            "movement_direction_deg": dir_deg,
            "basin": cyclone.basin,
            "forecast_horizon_hours": request.forecast_horizon_hours,
        }

        results = self.track_engine.predict(model_input)

        # Update forecast points in database
        await db.execute(delete(ForecastPoint).where(ForecastPoint.cyclone_id == cyclone.id))
        for pt in results["track_coordinates"]:
            new_fp = ForecastPoint(
                cyclone_id=cyclone.id,
                forecast_time_hours=pt["forecast_time_hours"],
                valid_timestamp=pt["valid_timestamp"],
                latitude=pt["latitude"],
                longitude=pt["longitude"],
                intensity_category=pt["intensity_category"],
                wind_speed_knots=pt["wind_speed_knots"],
                central_pressure_hpa=pt["central_pressure_hpa"],
                cone_radius_km=pt["cone_radius_km"],
                model_name=results["model_used"]
            )
            db.add(new_fp)
        
        await db.commit()

        return TrackPredictionResponse(**results)

    async def analyze_risk(self, request: RiskAnalysisRequest, db: AsyncSession) -> RiskAnalysisResponse:
        stmt = select(Cyclone).where(Cyclone.id == request.cyclone_id)
        res = await db.execute(stmt)
        cyclone = res.scalar_one_or_none()
        
        if not cyclone:
            raise ValueError(f"Cyclone with ID {request.cyclone_id} not found")

        pts_stmt = select(TrackPoint).where(TrackPoint.cyclone_id == cyclone.id).order_by(TrackPoint.timestamp.desc())
        pts_res = await db.execute(pts_stmt)
        latest_pt = pts_res.scalars().first()

        curr_lat = latest_pt.latitude if latest_pt else 18.0
        curr_lon = latest_pt.longitude if latest_pt else 86.5
        curr_wind = latest_pt.wind_speed_knots if latest_pt else cyclone.peak_wind_speed_knots
        curr_pres = latest_pt.central_pressure_hpa if latest_pt else cyclone.min_pressure_hpa
        speed_kmh = latest_pt.movement_speed_kmh if latest_pt else 18.0

        model_input = {
            "cyclone_id": cyclone.id,
            "cyclone_name": cyclone.name,
            "current_lat": curr_lat,
            "current_lon": curr_lon,
            "wind_speed_knots": curr_wind,
            "central_pressure_hpa": curr_pres,
            "movement_speed_kmh": speed_kmh,
        }

        results = self.risk_engine.predict(model_input)
        return RiskAnalysisResponse(**results)

prediction_service = PredictionService()
