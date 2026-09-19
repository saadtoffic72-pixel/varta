from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

# 1. Genesis Detection Schemas
class GenesisDetectionRequest(BaseModel):
    basin: str = Field(default="Bay of Bengal", description="Basin name: Bay of Bengal or Arabian Sea")
    center_latitude: float = Field(default=12.5, description="Latitude of convective cluster")
    center_longitude: float = Field(default=86.0, description="Longitude of convective cluster")
    sea_surface_temp_celsius: float = Field(default=29.2, description="Sea Surface Temperature in °C")
    vertical_wind_shear_knots: float = Field(default=10.5, description="850-200 hPa Wind Shear in knots")
    mid_tropospheric_rh_percent: float = Field(default=75.0, description="700-500 hPa Relative Humidity %")
    low_level_vorticity_1e5: float = Field(default=4.8, description="850 hPa Relative Vorticity (10^-5 s^-1)")

class GenesisDetectionResponse(BaseModel):
    genesis_probability_percent: float
    tcgpi_index: float # Tropical Cyclone Genesis Potential Index
    classification: str # "High Potential", "Moderate Potential", "Low Potential", "Genesis Unlikely"
    projected_time_to_depression_hours: Optional[int] = None
    dominant_favorable_factors: List[str]
    dominant_inhibiting_factors: List[str]
    confidence_score: float
    model_version: str

# 2. Intensity Classification Schemas
class IntensityClassificationRequest(BaseModel):
    cyclone_id: Optional[int] = None
    current_wind_speed_knots: float = Field(default=55.0, description="Observed wind speed in knots")
    central_pressure_hpa: float = Field(default=985.0, description="Observed central pressure in hPa")
    eye_temperature_celsius: Optional[float] = Field(default=12.0, description="Eye IR temperature")
    cloud_top_temperature_celsius: Optional[float] = Field(default=-72.0, description="Surrounding eyewall cloud top temp")
    dvorak_t_number: Optional[float] = Field(default=None, description="Manual Dvorak T-Number if available")

class IntensityClassificationResponse(BaseModel):
    category: str # IMD Standard Scale
    dvorak_t_number: float
    estimated_msw_knots: float # Maximum Sustained Wind
    estimated_msw_kmh: float
    estimated_central_pressure_hpa: float
    pressure_deficit_hpa: float
    intensity_trend_24h: str # "Rapid Intensification", "Steady Intensification", "Neutral", "Weakening"
    confidence_score: float
    model_name: str

# 3. Track Prediction Schemas
class TrackPredictionRequest(BaseModel):
    cyclone_id: int
    ensemble_member_count: int = Field(default=5, description="Number of ensemble trajectories to compute")
    forecast_horizon_hours: int = Field(default=72, description="Hours to forecast: 24, 48, 72, 96, 120")

class PredictedCoordinate(BaseModel):
    forecast_time_hours: int
    valid_timestamp: datetime
    latitude: float
    longitude: float
    intensity_category: str
    wind_speed_knots: float
    wind_speed_kmh: float
    central_pressure_hpa: float
    cone_radius_km: float
    movement_speed_kmh: float
    movement_direction_deg: float

class LandfallEstimate(BaseModel):
    is_landfall_expected: bool
    estimated_landfall_time: Optional[datetime] = None
    estimated_location: Optional[str] = None
    estimated_latitude: Optional[float] = None
    estimated_longitude: Optional[float] = None
    expected_category_at_landfall: Optional[str] = None
    expected_wind_speed_kmh: Optional[float] = None
    confidence_interval_hours: int = 6

class TrackPredictionResponse(BaseModel):
    cyclone_id: int
    cyclone_name: str
    model_used: str
    issued_at: datetime
    track_coordinates: List[PredictedCoordinate]
    landfall: LandfallEstimate
    cone_geojson: Dict[str, Any] # Polygon geometry for the 70% uncertainty envelope

# 4. Multi-Hazard Risk Analysis Schemas
class RiskAnalysisRequest(BaseModel):
    cyclone_id: int
    target_district_id: Optional[int] = None

class DistrictRiskProfile(BaseModel):
    district_name: str
    state_name: str
    overall_risk_score: float # 0 to 100
    risk_level: str # "Extreme", "High", "Moderate", "Low"
    storm_surge_risk_meters: float
    wind_damage_hazard_kmh: float
    inundation_area_sq_km: float
    population_affected: int
    recommended_evacuation_count: int
    critical_infrastructures_at_risk: List[str]

class RiskAnalysisResponse(BaseModel):
    cyclone_id: int
    cyclone_name: str
    analyzed_at: datetime
    composite_risk_index: float
    highest_risk_district: str
    affected_districts: List[DistrictRiskProfile]
    recommended_actions: List[str]
