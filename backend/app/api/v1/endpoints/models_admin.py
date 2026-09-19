from typing import List, Any
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.services.admin_service import admin_service
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter()

@router.get("/models", dependencies=[Depends(get_current_user)])
async def list_models(db: AsyncSession = Depends(get_db)):
    """List registered AI/ML models across Genesis, Intensity, Track, and Risk domains."""
    models = await admin_service.get_all_models(db)
    return models

@router.post("/models/{model_id}/activate", dependencies=[Depends(get_current_user)])
async def activate_model(model_id: int, db: AsyncSession = Depends(get_db)):
    """Set an AI model as active for production inference."""
    try:
        model = await admin_service.set_active_model(db, model_id)
        return {"status": "success", "activated_model": model.name, "task": model.task}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/datasets", dependencies=[Depends(get_current_user)])
async def list_datasets(db: AsyncSession = Depends(get_db)):
    """List external dataset sources and real-time ingestion pipelines."""
    return await admin_service.get_all_datasets(db)

@router.post("/datasets/{dataset_id}/sync", dependencies=[Depends(get_current_user)])
async def sync_dataset(dataset_id: int, db: AsyncSession = Depends(get_db)):
    """Simulate on-demand synchronization with external weather repository."""
    try:
        ds = await admin_service.sync_dataset(db, dataset_id)
        return {"status": "synchronized", "dataset": ds.source_name, "records_count": ds.records_count}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
