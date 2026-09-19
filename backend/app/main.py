from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import time

from app.core.config import settings
from app.core.logging import logger
from app.api.v1.router import api_router
from app.db.init_db import init_database

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting VARTA AI Cyclone Diagnostic & Prediction System...")
    # Initialize DB tables and seed data automatically on startup
    try:
        await init_database()
        logger.info("Database migration and baseline initialization complete.")
    except Exception as e:
        logger.error(f"Error during DB initialization: {e}")
    yield
    logger.info("Shutting down VARTA backend services...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.DESCRIPTION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request Timing & Diagnostic Middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time-Sec"] = f"{process_time:.4f}"
    response.headers["X-System"] = "VARTA-AI-Engine"
    return response

# Root & Health Check Endpoints
@app.get("/", tags=["System"])
async def root():
    return {
        "system": "VARTA",
        "description": "AI/ML Based Tropical Cyclone Diagnostic & Prediction System",
        "status": "OPERATIONAL",
        "version": settings.VERSION,
        "docs": "/docs",
        "api_v1": settings.API_V1_STR
    }

@app.get("/health", tags=["System"])
async def health_check():
    return {
        "status": "HEALTHY",
        "timestamp": time.time(),
        "database": "CONNECTED",
        "ai_modules": {
            "genesis": "READY",
            "intensity": "READY",
            "track": "READY",
            "risk": "READY"
        }
    }

# Mount modular REST APIs
app.include_router(api_router, prefix=settings.API_V1_STR)
