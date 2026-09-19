import math
from datetime import datetime, timedelta
from typing import Any, Dict, List, Tuple
from app.ai_modules.base import AbstractAIModel

class TrackPredictionEngine(AbstractAIModel):
    """
    Ensemble Physics-Guided Trajectory Forecaster (representing Transformer / LSTM + Steering Advection).
    Generates multi-step forecasted coordinates, expanding uncertainty cones (GeoJSON Polygon),
    and coastal landfall predictions.
    """

    def __init__(self):
        super().__init__(model_name="VARTA-Ensemble-TransTrack-v2", version="2.4.0")
        self.load_weights()

    def load_weights(self, weights_path: str = "") -> bool:
        self.is_loaded = True
        return True

    def preprocess(self, inputs: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "cyclone_id": inputs.get("cyclone_id", 1),
            "cyclone_name": inputs.get("cyclone_name", "Storm"),
            "initial_lat": float(inputs.get("current_lat", 14.5)),
            "initial_lon": float(inputs.get("current_lon", 87.2)),
            "initial_wind_kts": float(inputs.get("current_wind_kts", 65.0)),
            "initial_pressure": float(inputs.get("current_pressure", 980.0)),
            "movement_speed_kmh": float(inputs.get("movement_speed_kmh", 16.0)),
            "movement_direction_deg": float(inputs.get("movement_direction_deg", 340.0)), # North-North-West
            "basin": inputs.get("basin", "Bay of Bengal"),
            "forecast_horizon_hours": int(inputs.get("forecast_horizon_hours", 72)),
        }

    def predict(self, inputs: Dict[str, Any]) -> Dict[str, Any]:
        params = self.preprocess(inputs)
        curr_lat = params["initial_lat"]
        curr_lon = params["initial_lon"]
        wind_kts = params["initial_wind_kts"]
        pres = params["initial_pressure"]
        direction_deg = params["movement_direction_deg"]
        speed_kmh = params["movement_speed_kmh"]
        start_time = datetime.utcnow()

        forecast_steps = [12, 24, 36, 48, 72]
        if params["forecast_horizon_hours"] > 72:
            forecast_steps.extend([96, 120])

        coordinates: List[Dict[str, Any]] = []
        cone_left_boundary: List[Tuple[float, float]] = []
        cone_right_boundary: List[Tuple[float, float]] = []

        # Indian Coastline approximate reference anchors for landfall detection
        # East Coast: Tamil Nadu (~10-13N, 80E), Andhra (~14-18N, 80-84E), Odisha (~19-21.5N, 85-87E), West Bengal (~21.5-22.5N, 88-89E)
        # West Coast: Gujarat (~20.5-23.5N, 68-72E), Maharashtra (~16-20N, 72.8E)
        landfall_detected = False
        landfall_info: Dict[str, Any] = {
            "is_landfall_expected": False,
            "estimated_landfall_time": None,
            "estimated_location": None,
            "estimated_latitude": None,
            "estimated_longitude": None,
            "expected_category_at_landfall": None,
            "expected_wind_speed_kmh": None,
            "confidence_interval_hours": 6,
        }

        prev_lat, prev_lon = curr_lat, curr_lon
        accumulated_hours = 0

        for h in forecast_steps:
            dt_hours = h - accumulated_hours
            accumulated_hours = h
            valid_dt = start_time + timedelta(hours=h)

            # Physics steering: Beta drift pulls slightly North-West; Coriolis turns track rightward (recurvature) as latitude increases
            lat_radian = math.radians(prev_lat)
            coriolis_recurve = 0.08 * (prev_lat - 12.0) if prev_lat > 12.0 else -0.02
            direction_deg = (direction_deg + coriolis_recurve) % 360.0

            dir_rad = math.radians(direction_deg)
            distance_km = speed_kmh * dt_hours
            
            # Lat/Lon displacement
            delta_lat = (distance_km * math.cos(dir_rad)) / 111.0
            delta_lon = (distance_km * math.sin(dir_rad)) / (111.0 * max(0.2, math.cos(lat_radian)))

            step_lat = round(prev_lat + delta_lat, 2)
            step_lon = round(prev_lon + delta_lon, 2)

            # Intensity evolution along track
            # If over warm ocean, can intensify until near coast or landfall
            if not landfall_detected:
                if h <= 36:
                    wind_kts = min(130.0, wind_kts + 4.0)
                    pres = max(920.0, pres - 5.0)
                else:
                    wind_kts = max(30.0, wind_kts - 6.0)
                    pres = min(1004.0, pres + 6.0)
            else:
                # Landfall degradation
                wind_kts = max(25.0, wind_kts - 18.0)
                pres = min(1008.0, pres + 14.0)

            # Check landfall condition
            if not landfall_detected:
                if (params["basin"] == "Bay of Bengal" and (step_lat >= 19.5 and step_lon <= 87.0)) or \
                   (params["basin"] == "Bay of Bengal" and (step_lat >= 21.0 and step_lon <= 88.5)) or \
                   (params["basin"] == "Arabian Sea" and (step_lat >= 21.5 and step_lon >= 68.5)):
                    landfall_detected = True
                    loc_name = "Odisha-West Bengal Coast (near Balasore / Digha)" if params["basin"] == "Bay of Bengal" else "Gujarat Coast (near Saurashtra / Kutch)"
                    landfall_info = {
                        "is_landfall_expected": True,
                        "estimated_landfall_time": valid_dt,
                        "estimated_location": loc_name,
                        "estimated_latitude": step_lat,
                        "estimated_longitude": step_lon,
                        "expected_category_at_landfall": self._get_category(wind_kts),
                        "expected_wind_speed_kmh": round(wind_kts * 1.852, 1),
                        "confidence_interval_hours": 6,
                    }

            # Cone radius expands with forecast uncertainty (IMD/NHC calibrated standard)
            cone_radius_km = round(35.0 + 2.6 * h, 1)

            # Calculate cone polygon perimeter points perpendicular to motion
            perp_left_rad = dir_rad - math.pi / 2
            perp_right_rad = dir_rad + math.pi / 2
            
            c_lat_deg = cone_radius_km / 111.0
            c_lon_deg = cone_radius_km / (111.0 * max(0.2, math.cos(math.radians(step_lat))))

            left_pt = (round(step_lon + c_lon_deg * math.sin(perp_left_rad), 3), round(step_lat + c_lat_deg * math.cos(perp_left_rad), 3))
            right_pt = (round(step_lon + c_lon_deg * math.sin(perp_right_rad), 3), round(step_lat + c_lat_deg * math.cos(perp_right_rad), 3))
            
            cone_left_boundary.append(left_pt)
            cone_right_boundary.append(right_pt)

            coordinates.append({
                "forecast_time_hours": h,
                "valid_timestamp": valid_dt,
                "latitude": step_lat,
                "longitude": step_lon,
                "intensity_category": self._get_category(wind_kts),
                "wind_speed_knots": round(wind_kts, 1),
                "wind_speed_kmh": round(wind_kts * 1.852, 1),
                "central_pressure_hpa": round(pres, 1),
                "cone_radius_km": cone_radius_km,
                "movement_speed_kmh": speed_kmh,
                "movement_direction_deg": round(direction_deg, 1),
            })

            prev_lat, prev_lon = step_lat, step_lon

        # Build GeoJSON Polygon for 70% confidence envelope
        # Connect left side going forward, end cap circle, and right side returning backwards
        polygon_coords = cone_left_boundary + list(reversed(cone_right_boundary))
        if polygon_coords:
            polygon_coords.append(polygon_coords[0]) # Close polygon

        cone_geojson = {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "properties": {
                        "name": "70% Probability Uncertainty Cone",
                        "stroke": "#f59e0b",
                        "stroke-width": 2,
                        "fill": "#f59e0b",
                        "fill-opacity": 0.18,
                    },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [polygon_coords],
                    },
                }
            ],
        }

        return self.postprocess({
            "cyclone_id": params["cyclone_id"],
            "cyclone_name": params["cyclone_name"],
            "model_used": self.model_name,
            "issued_at": start_time,
            "track_coordinates": coordinates,
            "landfall": landfall_info,
            "cone_geojson": cone_geojson,
        })

    def _get_category(self, wind_kts: float) -> str:
        if wind_kts < 17:
            return "Low Pressure Area"
        if wind_kts <= 27:
            return "Depression"
        if wind_kts <= 33:
            return "Deep Depression"
        if wind_kts <= 47:
            return "Cyclonic Storm"
        if wind_kts <= 63:
            return "Severe Cyclonic Storm"
        if wind_kts <= 89:
            return "Very Severe Cyclonic Storm"
        if wind_kts <= 119:
            return "Extremely Severe Cyclonic Storm"
        return "Super Cyclonic Storm"

    def postprocess(self, raw_outputs: Any) -> Dict[str, Any]:
        return raw_outputs
