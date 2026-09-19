import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text
from app.db.database import Base

class AIModelMetadata(Base):
    __tablename__ = "ai_models"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(64), unique=True, nullable=False)
    task = Column(String(32), nullable=False) # "genesis", "intensity", "track", "risk"
    version = Column(String(16), nullable=False)
    architecture = Column(String(64), nullable=False) # e.g. "Physics-Guided Transformer", "ResNet-50 ADT"
    description = Column(Text, nullable=True)
    track_mae_nm = Column(Float, nullable=True) # Mean Absolute Error in nautical miles
    intensity_rmse_knots = Column(Float, nullable=True) # Root Mean Squared Error in knots
    inference_latency_ms = Column(Float, default=45.0)
    active_in_prod = Column(Boolean, default=True)
    framework = Column(String(32), default="PyTorch 2.3")
    parameters_count = Column(String(16), default="42.5M")
    last_trained = Column(DateTime, default=datetime.datetime.utcnow)
