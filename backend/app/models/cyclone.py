import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.db.database import Base

class Cyclone(Base):
    __tablename__ = "cyclones"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(32), unique=True, index=True, nullable=False) # e.g. "BOB-01-2026" or "AMPHAN-2020"
    name = Column(String(64), nullable=False)
    basin = Column(String(32), nullable=False) # "Bay of Bengal", "Arabian Sea"
    status = Column(String(32), default="Active") # "Active", "Dissipated", "Historical"
    genesis_date = Column(DateTime, default=datetime.datetime.utcnow)
    landfall_date = Column(DateTime, nullable=True)
    peak_category = Column(String(64), default="Depression")
    peak_wind_speed_knots = Column(Float, default=0.0)
    min_pressure_hpa = Column(Float, default=1008.0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    track_points = relationship("TrackPoint", back_populates="cyclone", cascade="all, delete-orphan", order_by="TrackPoint.timestamp")
    forecast_points = relationship("ForecastPoint", back_populates="cyclone", cascade="all, delete-orphan", order_by="ForecastPoint.forecast_time_hours")
    alerts = relationship("AlertBulletin", back_populates="cyclone", cascade="all, delete-orphan", order_by="desc(AlertBulletin.bulletin_number)")

class TrackPoint(Base):
    __tablename__ = "track_points"

    id = Column(Integer, primary_key=True, index=True)
    cyclone_id = Column(Integer, ForeignKey("cyclones.id", ondelete="CASCADE"), nullable=False)
    timestamp = Column(DateTime, nullable=False, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    intensity_category = Column(String(64), nullable=False) # IMD Standard Scale
    wind_speed_knots = Column(Float, nullable=False)
    central_pressure_hpa = Column(Float, nullable=False)
    movement_speed_kmh = Column(Float, default=15.0)
    movement_direction_deg = Column(Float, default=0.0) # 0-360 degrees
    radius_34kt_nm = Column(Float, default=80.0) # Gale wind radius in nautical miles
    radius_50kt_nm = Column(Float, default=45.0) # Storm wind radius
    radius_64kt_nm = Column(Float, default=25.0) # Hurricane wind radius
    source = Column(String(32), default="Observation") # "Observation", "Reanalysis", "AI_Inferred"

    cyclone = relationship("Cyclone", back_populates="track_points")

class ForecastPoint(Base):
    __tablename__ = "forecast_points"

    id = Column(Integer, primary_key=True, index=True)
    cyclone_id = Column(Integer, ForeignKey("cyclones.id", ondelete="CASCADE"), nullable=False)
    forecast_time_hours = Column(Integer, nullable=False) # e.g. 12, 24, 36, 48, 72, 96, 120
    valid_timestamp = Column(DateTime, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    intensity_category = Column(String(64), nullable=False)
    wind_speed_knots = Column(Float, nullable=False)
    central_pressure_hpa = Column(Float, nullable=False)
    cone_radius_km = Column(Float, default=50.0) # 70% probability cone radius
    model_name = Column(String(64), default="VARTA-Ensemble-v1")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    cyclone = relationship("Cyclone", back_populates="forecast_points")
