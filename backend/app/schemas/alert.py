from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict

class AlertBulletinBase(BaseModel):
    cyclone_id: int
    bulletin_number: int
    alert_level: str # "Green", "Yellow", "Orange", "Red"
    expected_landfall_time: Optional[datetime] = None
    expected_landfall_location: Optional[str] = None
    expected_wind_speed_kmh: float
    surge_height_meters: float = 1.5
    affected_states: str
    affected_districts: str
    safety_recommendations: str
    cap_identifier: str
    is_active: bool = True

class AlertBulletinResponse(AlertBulletinBase):
    id: int
    issue_time: datetime
    cyclone_name: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class CoastalZoneResponse(BaseModel):
    id: int
    state_name: str
    district_name: str
    latitude: float
    longitude: float
    population_at_risk: int
    shelter_count: int
    shelter_capacity: int
    vulnerability_index: float
    current_alert_level: str
    evacuation_status: str
    model_config = ConfigDict(from_attributes=True)

class GenerateAlertRequest(BaseModel):
    cyclone_id: int
    alert_level: Optional[str] = None # Optional override; if None, AI calculates
