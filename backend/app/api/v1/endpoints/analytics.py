from fastapi import APIRouter
from app.services.analytics_service import analytics_service
from app.schemas.analytics import AnalyticsOverviewResponse

router = APIRouter()

@router.get("/overview", response_model=AnalyticsOverviewResponse)
async def get_analytics_overview():
    """Retrieve comprehensive historical basin analytics, decadal trends, notable storms, and AI accuracy metrics."""
    return analytics_service.get_overview()
