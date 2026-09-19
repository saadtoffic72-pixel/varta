import pytest
import httpx
from app.main import app

@pytest.mark.asyncio
async def test_health_endpoint():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "HEALTHY"
        assert "genesis" in data["ai_modules"]

@pytest.mark.asyncio
async def test_cyclones_endpoint():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/v1/cyclones")
        assert response.status_code == 200
        cyclones = response.json()
        assert len(cyclones) >= 1
        assert any(c["name"] == "Cyclone Dana" for c in cyclones)

@pytest.mark.asyncio
async def test_genesis_prediction():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        payload = {
            "basin": "Bay of Bengal",
            "center_latitude": 13.0,
            "center_longitude": 87.0,
            "sea_surface_temp_celsius": 29.5,
            "vertical_wind_shear_knots": 9.0,
            "mid_tropospheric_rh_percent": 78.0,
            "low_level_vorticity_1e5": 5.2
        }
        response = await client.post("/api/v1/predictions/genesis", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "genesis_probability_percent" in data
        assert data["genesis_probability_percent"] > 50.0
        assert len(data["dominant_favorable_factors"]) > 0

@pytest.mark.asyncio
async def test_intensity_classification():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        payload = {
            "current_wind_speed_knots": 70.0,
            "central_pressure_hpa": 970.0,
            "eye_temperature_celsius": 14.0,
            "cloud_top_temperature_celsius": -75.0
        }
        response = await client.post("/api/v1/predictions/intensity", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["category"] == "Very Severe Cyclonic Storm"
        assert data["dvorak_t_number"] >= 4.0

@pytest.mark.asyncio
async def test_track_prediction():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        # Cyclone Dana has ID 1
        payload = {
            "cyclone_id": 1,
            "forecast_horizon_hours": 72
        }
        response = await client.post("/api/v1/predictions/track", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert len(data["track_coordinates"]) >= 5
        assert "cone_geojson" in data
        assert data["cone_geojson"]["type"] == "FeatureCollection"

@pytest.mark.asyncio
async def test_risk_analysis():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        payload = {
            "cyclone_id": 1
        }
        response = await client.post("/api/v1/predictions/risk", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert len(data["affected_districts"]) > 0
        assert data["composite_risk_index"] > 0

@pytest.mark.asyncio
async def test_alerts_endpoint():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/v1/alerts/active")
        assert response.status_code == 200
        alerts = response.json()
        assert len(alerts) >= 1
        assert alerts[0]["alert_level"] in ["Green", "Yellow", "Orange", "Red"]

@pytest.mark.asyncio
async def test_analytics_endpoint():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/v1/analytics/overview")
        assert response.status_code == 200
        data = response.json()
        assert len(data["basins"]) == 2
        assert len(data["notable_cyclones"]) >= 4
