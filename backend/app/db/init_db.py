import asyncio
from datetime import datetime, timedelta
from app.db.database import engine, Base, AsyncSessionLocal
from app.models.cyclone import Cyclone, TrackPoint, ForecastPoint
from app.models.alert import AlertBulletin, CoastalZone
from app.models.model_registry import AIModelMetadata
from app.models.dataset import DatasetSource
from app.core.logging import logger

from sqlalchemy import select

async def init_database():
    logger.info("Initializing database schemas...")
    async with engine.begin() as conn:
        # Create tables if they don't exist
        await conn.run_sync(Base.metadata.create_all)

    # Check if database is already seeded
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(Cyclone).limit(1))
        existing_cyclone = result.scalar_one_or_none()
        if existing_cyclone:
            logger.info("Database already contains data. Skipping seed.")
            return

    logger.info("Seeding realistic cyclone and meteorological records...")
    async with AsyncSessionLocal() as session:
        # 1. Active Cyclone: Cyclone DANA (Simulation)
        now = datetime.utcnow()
        dana = Cyclone(
            code="BOB-06-2024",
            name="Cyclone Dana",
            basin="Bay of Bengal",
            status="Active",
            genesis_date=now - timedelta(hours=36),
            peak_category="Severe Cyclonic Storm",
            peak_wind_speed_knots=65.0,
            min_pressure_hpa=984.0,
            is_active=True
        )
        session.add(dana)
        await session.flush()

        # Track points for Dana
        dana_tracks = [
            # -36h: Depression
            TrackPoint(
                cyclone_id=dana.id,
                timestamp=now - timedelta(hours=36),
                latitude=14.5,
                longitude=88.5,
                intensity_category="Depression",
                wind_speed_knots=25.0,
                central_pressure_hpa=1002.0,
                movement_speed_kmh=14.0,
                movement_direction_deg=320.0,
                radius_34kt_nm=0.0,
                source="Observation"
            ),
            # -24h: Deep Depression
            TrackPoint(
                cyclone_id=dana.id,
                timestamp=now - timedelta(hours=24),
                latitude=16.0,
                longitude=87.8,
                intensity_category="Deep Depression",
                wind_speed_knots=32.0,
                central_pressure_hpa=998.0,
                movement_speed_kmh=15.0,
                movement_direction_deg=330.0,
                radius_34kt_nm=45.0,
                source="Observation"
            ),
            # -12h: Cyclonic Storm
            TrackPoint(
                cyclone_id=dana.id,
                timestamp=now - timedelta(hours=12),
                latitude=17.8,
                longitude=87.2,
                intensity_category="Cyclonic Storm",
                wind_speed_knots=45.0,
                central_pressure_hpa=990.0,
                movement_speed_kmh=16.0,
                movement_direction_deg=335.0,
                radius_34kt_nm=90.0,
                radius_50kt_nm=35.0,
                source="Observation"
            ),
            # Current: Severe Cyclonic Storm
            TrackPoint(
                cyclone_id=dana.id,
                timestamp=now,
                latitude=19.4,
                longitude=86.8,
                intensity_category="Severe Cyclonic Storm",
                wind_speed_knots=65.0,
                central_pressure_hpa=984.0,
                movement_speed_kmh=17.0,
                movement_direction_deg=340.0,
                radius_34kt_nm=120.0,
                radius_50kt_nm=65.0,
                radius_64kt_nm=30.0,
                source="Observation"
            ),
        ]
        session.add_all(dana_tracks)

        # Forecast Points for Dana
        dana_forecasts = [
            ForecastPoint(
                cyclone_id=dana.id,
                forecast_time_hours=12,
                valid_timestamp=now + timedelta(hours=12),
                latitude=20.5,
                longitude=86.9,
                intensity_category="Severe Cyclonic Storm",
                wind_speed_knots=65.0,
                central_pressure_hpa=982.0,
                cone_radius_km=55.0,
                model_name="VARTA-Ensemble-TransTrack-v2"
            ),
            ForecastPoint(
                cyclone_id=dana.id,
                forecast_time_hours=24,
                valid_timestamp=now + timedelta(hours=24),
                latitude=21.4,
                longitude=87.0, # Landfall near Dhamra / Balasore
                intensity_category="Severe Cyclonic Storm",
                wind_speed_knots=60.0,
                central_pressure_hpa=986.0,
                cone_radius_km=85.0,
                model_name="VARTA-Ensemble-TransTrack-v2"
            ),
            ForecastPoint(
                cyclone_id=dana.id,
                forecast_time_hours=36,
                valid_timestamp=now + timedelta(hours=36),
                latitude=21.9,
                longitude=86.3,
                intensity_category="Cyclonic Storm",
                wind_speed_knots=45.0,
                central_pressure_hpa=994.0,
                cone_radius_km=115.0,
                model_name="VARTA-Ensemble-TransTrack-v2"
            ),
            ForecastPoint(
                cyclone_id=dana.id,
                forecast_time_hours=48,
                valid_timestamp=now + timedelta(hours=48),
                latitude=22.3,
                longitude=85.5,
                intensity_category="Deep Depression",
                wind_speed_knots=30.0,
                central_pressure_hpa=1000.0,
                cone_radius_km=145.0,
                model_name="VARTA-Ensemble-TransTrack-v2"
            ),
            ForecastPoint(
                cyclone_id=dana.id,
                forecast_time_hours=72,
                valid_timestamp=now + timedelta(hours=72),
                latitude=22.8,
                longitude=84.2,
                intensity_category="Depression",
                wind_speed_knots=20.0,
                central_pressure_hpa=1004.0,
                cone_radius_km=210.0,
                model_name="VARTA-Ensemble-TransTrack-v2"
            ),
        ]
        session.add_all(dana_forecasts)

        # 2. Historical Cyclone 1: AMPHAN (2020)
        amphan = Cyclone(
            code="BOB-01-2020",
            name="Cyclone Amphan",
            basin="Bay of Bengal",
            status="Historical",
            genesis_date=datetime(2020, 5, 16, 6, 0),
            landfall_date=datetime(2020, 5, 20, 12, 0),
            peak_category="Super Cyclonic Storm",
            peak_wind_speed_knots=140.0,
            min_pressure_hpa=907.0,
            is_active=False
        )
        session.add(amphan)
        await session.flush()

        amphan_tracks = [
            TrackPoint(cyclone_id=amphan.id, timestamp=datetime(2020, 5, 16, 6, 0), latitude=10.5, longitude=86.5, intensity_category="Depression", wind_speed_knots=25.0, central_pressure_hpa=1000.0, movement_speed_kmh=12.0, movement_direction_deg=350.0, source="IMD_BestTrack"),
            TrackPoint(cyclone_id=amphan.id, timestamp=datetime(2020, 5, 17, 6, 0), latitude=11.4, longitude=86.1, intensity_category="Cyclonic Storm", wind_speed_knots=45.0, central_pressure_hpa=990.0, movement_speed_kmh=13.0, movement_direction_deg=355.0, source="IMD_BestTrack"),
            TrackPoint(cyclone_id=amphan.id, timestamp=datetime(2020, 5, 18, 6, 0), latitude=13.2, longitude=86.3, intensity_category="Extremely Severe Cyclonic Storm", wind_speed_knots=115.0, central_pressure_hpa=925.0, movement_speed_kmh=15.0, movement_direction_deg=10.0, source="IMD_BestTrack"),
            TrackPoint(cyclone_id=amphan.id, timestamp=datetime(2020, 5, 18, 18, 0), latitude=14.0, longitude=86.4, intensity_category="Super Cyclonic Storm", wind_speed_knots=140.0, central_pressure_hpa=907.0, movement_speed_kmh=16.0, movement_direction_deg=15.0, source="IMD_BestTrack"),
            TrackPoint(cyclone_id=amphan.id, timestamp=datetime(2020, 5, 19, 12, 0), latitude=17.0, longitude=86.9, intensity_category="Extremely Severe Cyclonic Storm", wind_speed_knots=110.0, central_pressure_hpa=935.0, movement_speed_kmh=18.0, movement_direction_deg=20.0, source="IMD_BestTrack"),
            TrackPoint(cyclone_id=amphan.id, timestamp=datetime(2020, 5, 20, 12, 0), latitude=21.6, longitude=88.3, intensity_category="Very Severe Cyclonic Storm", wind_speed_knots=85.0, central_pressure_hpa=960.0, movement_speed_kmh=24.0, movement_direction_deg=25.0, source="IMD_BestTrack"), # Landfall Sundarbans
            TrackPoint(cyclone_id=amphan.id, timestamp=datetime(2020, 5, 21, 6, 0), latitude=24.0, longitude=89.5, intensity_category="Deep Depression", wind_speed_knots=30.0, central_pressure_hpa=998.0, movement_speed_kmh=28.0, movement_direction_deg=35.0, source="IMD_BestTrack"),
        ]
        session.add_all(amphan_tracks)

        # 3. Historical Cyclone 2: BIPARJOY (2023)
        biparjoy = Cyclone(
            code="ARB-02-2023",
            name="Cyclone Biparjoy",
            basin="Arabian Sea",
            status="Historical",
            genesis_date=datetime(2023, 6, 6, 0, 0),
            landfall_date=datetime(2023, 6, 15, 18, 0),
            peak_category="Extremely Severe Cyclonic Storm",
            peak_wind_speed_knots=105.0,
            min_pressure_hpa=958.0,
            is_active=False
        )
        session.add(biparjoy)
        await session.flush()

        biparjoy_tracks = [
            TrackPoint(cyclone_id=biparjoy.id, timestamp=datetime(2023, 6, 6, 0, 0), latitude=12.1, longitude=66.0, intensity_category="Depression", wind_speed_knots=25.0, central_pressure_hpa=1002.0, movement_speed_kmh=8.0, movement_direction_deg=0.0, source="IMD_BestTrack"),
            TrackPoint(cyclone_id=biparjoy.id, timestamp=datetime(2023, 6, 8, 12, 0), latitude=14.5, longitude=66.2, intensity_category="Very Severe Cyclonic Storm", wind_speed_knots=75.0, central_pressure_hpa=974.0, movement_speed_kmh=6.0, movement_direction_deg=5.0, source="IMD_BestTrack"),
            TrackPoint(cyclone_id=biparjoy.id, timestamp=datetime(2023, 6, 11, 0, 0), latitude=18.6, longitude=67.6, intensity_category="Extremely Severe Cyclonic Storm", wind_speed_knots=105.0, central_pressure_hpa=958.0, movement_speed_kmh=9.0, movement_direction_deg=15.0, source="IMD_BestTrack"),
            TrackPoint(cyclone_id=biparjoy.id, timestamp=datetime(2023, 6, 14, 12, 0), latitude=21.8, longitude=66.9, intensity_category="Very Severe Cyclonic Storm", wind_speed_knots=75.0, central_pressure_hpa=976.0, movement_speed_kmh=11.0, movement_direction_deg=45.0, source="IMD_BestTrack"),
            TrackPoint(cyclone_id=biparjoy.id, timestamp=datetime(2023, 6, 15, 18, 0), latitude=23.3, longitude=68.6, intensity_category="Very Severe Cyclonic Storm", wind_speed_knots=65.0, central_pressure_hpa=982.0, movement_speed_kmh=13.0, movement_direction_deg=65.0, source="IMD_BestTrack"), # Landfall Jakhau Port
        ]
        session.add_all(biparjoy_tracks)

        # 4. Historical Cyclone 3: FANI (2019)
        fani = Cyclone(
            code="BOB-02-2019",
            name="Cyclone Fani",
            basin="Bay of Bengal",
            status="Historical",
            genesis_date=datetime(2019, 4, 26, 6, 0),
            landfall_date=datetime(2019, 5, 3, 3, 30),
            peak_category="Extremely Severe Cyclonic Storm",
            peak_wind_speed_knots=115.0,
            min_pressure_hpa=932.0,
            is_active=False
        )
        session.add(fani)
        await session.flush()

        fani_tracks = [
            TrackPoint(cyclone_id=fani.id, timestamp=datetime(2019, 4, 27, 0, 0), latitude=4.5, longitude=88.5, intensity_category="Depression", wind_speed_knots=25.0, central_pressure_hpa=1004.0, movement_speed_kmh=16.0, movement_direction_deg=315.0, source="IMD_BestTrack"),
            TrackPoint(cyclone_id=fani.id, timestamp=datetime(2019, 4, 30, 12, 0), latitude=11.8, longitude=86.3, intensity_category="Very Severe Cyclonic Storm", wind_speed_knots=75.0, central_pressure_hpa=975.0, movement_speed_kmh=18.0, movement_direction_deg=340.0, source="IMD_BestTrack"),
            TrackPoint(cyclone_id=fani.id, timestamp=datetime(2019, 5, 2, 6, 0), latitude=16.2, longitude=84.8, intensity_category="Extremely Severe Cyclonic Storm", wind_speed_knots=115.0, central_pressure_hpa=932.0, movement_speed_kmh=17.0, movement_direction_deg=20.0, source="IMD_BestTrack"),
            TrackPoint(cyclone_id=fani.id, timestamp=datetime(2019, 5, 3, 3, 30), latitude=19.8, longitude=85.8, intensity_category="Extremely Severe Cyclonic Storm", wind_speed_knots=100.0, central_pressure_hpa=942.0, movement_speed_kmh=20.0, movement_direction_deg=30.0, source="IMD_BestTrack"), # Landfall Puri
        ]
        session.add_all(fani_tracks)

        # 5. Coastal Zones
        coastal_zones = [
            CoastalZone(state_name="Odisha", district_name="Balasore", latitude=21.49, longitude=86.93, population_at_risk=2320000, shelter_count=145, shelter_capacity=180000, vulnerability_index=0.92, current_alert_level="Red", evacuation_status="Mandatory Evacuation"),
            CoastalZone(state_name="Odisha", district_name="Bhadrak", latitude=21.05, longitude=86.50, population_at_risk=1500000, shelter_count=110, shelter_capacity=140000, vulnerability_index=0.88, current_alert_level="Red", evacuation_status="Mandatory Evacuation"),
            CoastalZone(state_name="Odisha", district_name="Kendrapara", latitude=20.50, longitude=86.42, population_at_risk=1440000, shelter_count=125, shelter_capacity=150000, vulnerability_index=0.85, current_alert_level="Orange", evacuation_status="Advisory"),
            CoastalZone(state_name="West Bengal", district_name="East Medinipur", latitude=21.90, longitude=87.77, population_at_risk=5095000, shelter_count=210, shelter_capacity=280000, vulnerability_index=0.89, current_alert_level="Red", evacuation_status="Mandatory Evacuation"),
            CoastalZone(state_name="West Bengal", district_name="South 24 Parganas", latitude=21.80, longitude=88.55, population_at_risk=8160000, shelter_count=290, shelter_capacity=380000, vulnerability_index=0.94, current_alert_level="Red", evacuation_status="Mandatory Evacuation"),
            CoastalZone(state_name="Andhra Pradesh", district_name="Visakhapatnam", latitude=17.68, longitude=83.21, population_at_risk=4290000, shelter_count=180, shelter_capacity=220000, vulnerability_index=0.55, current_alert_level="Yellow", evacuation_status="Normal"),
            CoastalZone(state_name="Gujarat", district_name="Kutch", latitude=23.24, longitude=69.66, population_at_risk=2090000, shelter_count=160, shelter_capacity=190000, vulnerability_index=0.62, current_alert_level="Green", evacuation_status="Normal"),
        ]
        session.add_all(coastal_zones)

        # 6. Active Alert Bulletin for Cyclone Dana
        bulletin = AlertBulletin(
            cyclone_id=dana.id,
            bulletin_number=14,
            alert_level="Red",
            issue_time=now,
            expected_landfall_time=now + timedelta(hours=22),
            expected_landfall_location="Odisha-West Bengal coast between Puri and Sagar Island (near Dhamra)",
            expected_wind_speed_kmh=120.0,
            surge_height_meters=3.2,
            affected_states="Odisha, West Bengal",
            affected_districts="Balasore, Bhadrak, Kendrapara, Jagatsinghpur, East Medinipur, South 24 Parganas",
            safety_recommendations=(
                "1. Total suspension of all marine fishing operations across North Bay of Bengal.\n"
                "2. Evacuation of residents in low-lying coastal tracts within 5 km of coast to pucca cyclone shelters.\n"
                "3. Movement of NDRF and ODRAF motorized rescue units to vulnerable river mouths.\n"
                "4. Major ports of Paradip, Dhamra, and Haldia advised to maintain Great Danger Signal No. 10.\n"
                "5. Power grid operations placed under emergency protective disconnection protocols."
            ),
            cap_identifier=f"IN-IMD-CAP-{now.strftime('%Y%m%d')}-DANA-14-RED",
            is_active=True
        )
        session.add(bulletin)

        # 7. AI Models Registry
        models = [
            AIModelMetadata(
                name="VARTA-Ensemble-TransTrack-v2",
                task="track",
                version="2.4.0",
                architecture="Physics-Guided Spatiotemporal Transformer + Ensembles",
                description="Transformer model trained on IBTrACS & ECMWF ERA5 reanalysis with physics-constrained advection and beta-drift.",
                track_mae_nm=46.8,
                inference_latency_ms=38.5,
                active_in_prod=True,
                parameters_count="84.2M"
            ),
            AIModelMetadata(
                name="VARTA-Intensity-ResNet-ADT",
                task="intensity",
                version="2.1.0",
                architecture="Deep ResNet-50 + Advanced Dvorak Technique (ADT)",
                description="Multispectral IR & passive microwave cloud pattern classification with wind-pressure deficit regression.",
                intensity_rmse_knots=7.8,
                inference_latency_ms=22.0,
                active_in_prod=True,
                parameters_count="25.6M"
            ),
            AIModelMetadata(
                name="VARTA-Genesis-TCGPI-CNN",
                task="genesis",
                version="1.4.2",
                architecture="Multimodal TCGPI & Convective Feature Fusion",
                description="Calculates Emanuel-Nolan Genesis Potential Index and diagnoses satellite deep convection signatures.",
                inference_latency_ms=18.0,
                active_in_prod=True,
                parameters_count="14.8M"
            ),
            AIModelMetadata(
                name="VARTA-MultiHazard-RiskNet",
                task="risk",
                version="1.8.0",
                architecture="Hydrodynamic SLOSH Proxy + Geospatial Risk Estimator",
                description="High-resolution coastal surge inundation, wind swath, and infrastructure vulnerability scoring.",
                inference_latency_ms=42.0,
                active_in_prod=True,
                parameters_count="18.2M"
            ),
        ]
        session.add_all(models)

        # 8. Dataset Sources
        datasets = [
            DatasetSource(
                source_name="IMD Cyclone eAtlas Archive",
                provider="India Meteorological Department (IMD)",
                description="Official North Indian Ocean best-track historical dataset covering 1891 to 2026.",
                records_count=1840,
                status="Operational"
            ),
            DatasetSource(
                source_name="IBTrACS Global v04r01",
                provider="NOAA / NCEI",
                description="International Best Track Archive for Climate Stewardship, providing 6-hourly global storm positions.",
                records_count=134500,
                status="Operational"
            ),
            DatasetSource(
                source_name="NOAA GFS & GEFS Ensembles",
                provider="NOAA / NCEP",
                description="0.25-degree Global Forecast System numerical weather prediction and 31-member ensemble feeds.",
                records_count=4890,
                status="Operational"
            ),
            DatasetSource(
                source_name="INSAT-3D/3DR Satellite Multi-Spectral Imagery",
                provider="ISRO / MOSDAC",
                description="TIR-1, TIR-2, and Water Vapor channel geostationary imagery every 15 minutes over Indian Ocean.",
                records_count=8240,
                status="Operational"
            ),
            DatasetSource(
                source_name="INCOIS Moored Buoy Network (OOS)",
                provider="Indian National Centre for Ocean Information Services",
                description="Real-time in-situ sea surface temperature, barometric pressure, wave height, and surface winds.",
                records_count=15200,
                status="Operational"
            ),
        ]
        session.add_all(datasets)

        await session.commit()
        logger.info("Database initialized and populated successfully with realistic cyclone scenarios!")

if __name__ == "__main__":
    asyncio.run(init_database())
