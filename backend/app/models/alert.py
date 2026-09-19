import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.db.database import Base

class AlertBulletin(Base):
    __tablename__ = "alert_bulletins"

    id = Column(Integer, primary_key=True, index=True)
    cyclone_id = Column(Integer, ForeignKey("cyclones.id", ondelete="CASCADE"), nullable=False)
    bulletin_number = Column(Integer, nullable=False)
    alert_level = Column(String(16), nullable=False) # "Green", "Yellow", "Orange", "Red"
    issue_time = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    expected_landfall_time = Column(DateTime, nullable=True)
    expected_landfall_location = Column(String(128), nullable=True)
    expected_wind_speed_kmh = Column(Float, nullable=False)
    surge_height_meters = Column(Float, default=1.5)
    affected_states = Column(String(256), nullable=False) # Comma-separated or JSON string
    affected_districts = Column(Text, nullable=False) # JSON list or detailed string
    safety_recommendations = Column(Text, nullable=False)
    cap_identifier = Column(String(64), unique=True, index=True, nullable=False) # Common Alerting Protocol ID
    is_active = Column(Boolean, default=True)

    cyclone = relationship("Cyclone", back_populates="alerts")

class CoastalZone(Base):
    __tablename__ = "coastal_zones"

    id = Column(Integer, primary_key=True, index=True)
    state_name = Column(String(64), nullable=False, index=True)
    district_name = Column(String(64), nullable=False, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    population_at_risk = Column(Integer, default=500000)
    shelter_count = Column(Integer, default=120)
    shelter_capacity = Column(Integer, default=150000)
    vulnerability_index = Column(Float, default=0.75) # 0.0 to 1.0
    current_alert_level = Column(String(16), default="Green")
    evacuation_status = Column(String(32), default="Normal") # "Normal", "Advisory", "Mandatory Evacuation", "Sheltered"
