from fastapi import APIRouter
from app.api.v1.endpoints import (
    cyclones,
    predictions,
    alerts,
    analytics,
    models_admin,
    auth,
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(cyclones.router, prefix="/cyclones", tags=["Cyclones & Tracks"])
api_router.include_router(predictions.router, prefix="/predictions", tags=["AI Diagnostics & Predictions"])
api_router.include_router(alerts.router, prefix="/alerts", tags=["CAP Bulletins & Early Warning"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Historical & Basin Analytics"])
api_router.include_router(models_admin.router, prefix="/admin", tags=["Model Registry & Data Pipelines"])
