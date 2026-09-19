from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel

class CycloneStatItem(BaseModel):
    name: str
    year: int
    basin: str
    peak_category: str
    max_wind_kmh: float
    min_pressure_hpa: float
    damage_usd_millions: Optional[float] = None
    fatalities: Optional[int] = None

class BasinComparison(BaseModel):
    basin: str
    total_cyclones: int
    super_cyclones: int
    very_severe_cyclones: int
    avg_annual_frequency: float

class DecadalTrend(BaseModel):
    decade: str
    total_count: int
    severe_count: int
    intensification_ratio: float

class AnalyticsOverviewResponse(BaseModel):
    total_monitored_cyclones: int
    active_cyclones_count: int
    historical_archives_count: int
    red_alerts_issued_last_30d: int
    basins: List[BasinComparison]
    decadal_trends: List[DecadalTrend]
    notable_cyclones: List[CycloneStatItem]
    model_performance_benchmarks: Dict[str, Any]
