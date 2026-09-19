import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text
from app.db.database import Base

class DatasetSource(Base):
    __tablename__ = "dataset_sources"

    id = Column(Integer, primary_key=True, index=True)
    source_name = Column(String(64), unique=True, nullable=False) # e.g. "IMD Cyclone eAtlas", "IBTrACS Global v04r01"
    provider = Column(String(64), nullable=False) # "IMD", "NOAA/NCEI", "NASA JPL", "INCOIS"
    description = Column(Text, nullable=True)
    records_count = Column(Integer, default=0)
    spatial_coverage = Column(String(64), default="North Indian Ocean (Bay of Bengal & Arabian Sea)")
    temporal_coverage = Column(String(64), default="1982 - 2026")
    file_format = Column(String(32), default="NetCDF4 / GeoJSON")
    status = Column(String(32), default="Operational") # "Operational", "Syncing", "Degraded"
    last_synced = Column(DateTime, default=datetime.datetime.utcnow)
