from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict

class TrackPointBase(BaseModel):
    timestamp: datetime
    latitude: float
    longitude: float
    intensity_category: str
    wind_speed_knots: float
    central_pressure_hpa: float
    movement_speed_kmh: float = 15.0
    movement_direction_deg: float = 0.0
    radius_34kt_nm: float = 80.0
    radius_50kt_nm: float = 45.0
    radius_64kt_nm: float = 25.0
    source: str = "Observation"

class TrackPointResponse(TrackPointBase):
    id: int
    cyclone_id: int
    model_config = ConfigDict(from_attributes=True)

class ForecastPointBase(BaseModel):
    forecast_time_hours: int
    valid_timestamp: datetime
    latitude: float
    longitude: float
    intensity_category: str
    wind_speed_knots: float
    central_pressure_hpa: float
    cone_radius_km: float = 50.0
    model_name: str = "VARTA-Ensemble-v1"

class ForecastPointResponse(ForecastPointBase):
    id: int
    cyclone_id: int
    model_config = ConfigDict(from_attributes=True)

class CycloneBase(BaseModel):
    code: str
    name: str
    basin: str
    status: str = "Active"
    peak_category: str = "Depression"
    peak_wind_speed_knots: float = 0.0
    min_pressure_hpa: float = 1008.0
    is_active: bool = True

class CycloneSummaryResponse(CycloneBase):
    id: int
    genesis_date: datetime
    landfall_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    latest_lat: Optional[float] = None
    latest_lon: Optional[float] = None
    latest_wind_speed: Optional[float] = None
    latest_pressure: Optional[float] = None
    model_config = ConfigDict(from_attributes=True)

class CycloneDetailResponse(CycloneBase):
    id: int
    genesis_date: datetime
    landfall_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    track_points: List[TrackPointResponse] = []
    forecast_points: List[ForecastPointResponse] = []
    model_config = ConfigDict(from_attributes=True)
