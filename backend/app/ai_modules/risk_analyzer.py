import math
from datetime import datetime
from typing import Any, Dict, List
from app.ai_modules.base import AbstractAIModel

class RiskAnalysisEngine(AbstractAIModel):
    """
    Multi-Hazard Coastal Vulnerability & Risk Assessment Engine.
    Combines storm surge modeling, wind swath projection, digital elevation model (DEM) proxies,
    and socio-demographic vulnerability indicators to compute real-time district-level disaster risk.
    """

    def __init__(self):
        super().__init__(model_name="VARTA-MultiHazard-RiskNet", version="1.8.0")
        self.load_weights()

        # Database of vulnerable coastal districts in India
        self.district_database = [
            {
                "district_name": "Balasore",
                "state_name": "Odisha",
                "lat": 21.49,
                "lon": 86.93,
                "elevation_m": 4.5,
                "population": 2320000,
                "bathymetry_slope": 0.0015, # Shallow shelf amplifies surge
                "shelters": 145,
            },
            {
                "district_name": "Bhadrak",
                "state_name": "Odisha",
                "lat": 21.05,
                "lon": 86.50,
                "elevation_m": 3.8,
                "population": 1500000,
                "bathymetry_slope": 0.0012,
                "shelters": 110,
            },
            {
                "district_name": "Kendrapara",
                "state_name": "Odisha",
                "lat": 20.50,
                "lon": 86.42,
                "elevation_m": 3.2,
                "population": 1440000,
                "bathymetry_slope": 0.0010,
                "shelters": 125,
            },
            {
                "district_name": "East Medinipur",
                "state_name": "West Bengal",
                "lat": 21.90,
                "lon": 87.77,
                "elevation_m": 3.5,
                "population": 5095000,
                "bathymetry_slope": 0.0011,
                "shelters": 210,
            },
            {
                "district_name": "South 24 Parganas (Sundarbans)",
                "state_name": "West Bengal",
                "lat": 21.80,
                "lon": 88.55,
                "elevation_m": 2.8,
                "population": 8160000,
                "bathymetry_slope": 0.0009,
                "shelters": 290,
            },
            {
                "district_name": "Visakhapatnam",
                "state_name": "Andhra Pradesh",
                "lat": 17.68,
                "lon": 83.21,
                "elevation_m": 8.0,
                "population": 4290000,
                "bathymetry_slope": 0.0035, # Steeper slope = lower surge
                "shelters": 180,
            },
            {
                "district_name": "Kutch",
                "state_name": "Gujarat",
                "lat": 23.24,
                "lon": 69.66,
                "elevation_m": 5.0,
                "population": 2090000,
                "bathymetry_slope": 0.0013,
                "shelters": 160,
            },
        ]

    def load_weights(self, weights_path: str = "") -> bool:
        self.is_loaded = True
        return True

    def preprocess(self, inputs: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "cyclone_id": inputs.get("cyclone_id", 1),
            "cyclone_name": inputs.get("cyclone_name", "Storm"),
            "current_lat": float(inputs.get("current_lat", 19.5)),
            "current_lon": float(inputs.get("current_lon", 86.8)),
            "wind_speed_knots": float(inputs.get("wind_speed_knots", 75.0)),
            "central_pressure_hpa": float(inputs.get("central_pressure_hpa", 965.0)),
            "movement_speed_kmh": float(inputs.get("movement_speed_kmh", 18.0)),
        }

    def predict(self, inputs: Dict[str, Any]) -> Dict[str, Any]:
        params = self.preprocess(inputs)
        cyclone_lat = params["current_lat"]
        cyclone_lon = params["current_lon"]
        wind_kts = params["wind_speed_knots"]
        pres = params["central_pressure_hpa"]
        pressure_drop = max(0.0, 1010.0 - pres)

        district_profiles: List[Dict[str, Any]] = []
        max_risk_score = 0.0
        highest_risk_district = ""

        for dist in self.district_database:
            # Haversine distance from cyclone center to district
            d_lat = math.radians(dist["lat"] - cyclone_lat)
            d_lon = math.radians(dist["lon"] - cyclone_lon)
            a = math.sin(d_lat / 2)**2 + math.cos(math.radians(cyclone_lat)) * math.cos(math.radians(dist["lat"])) * math.sin(d_lon / 2)**2
            c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
            distance_km = 6371.0 * c

            # Wind attenuation with distance: Rankine combined vortex model
            rmw_km = 35.0 # Radius of maximum wind
            if distance_km <= rmw_km:
                local_wind_kts = wind_kts
            else:
                local_wind_kts = wind_kts * math.pow(rmw_km / max(distance_km, 1.0), 0.55)
            
            local_wind_kmh = round(local_wind_kts * 1.852, 1)

            # Storm Surge Estimation (Modified Jelesnianski / IITD SLOSH formulation)
            # S = 0.01 * DeltaP + (wind_kts^2 * 0.0003) / (slope * 1000)
            if distance_km < 350.0:
                surge_m = (0.012 * pressure_drop) + (math.pow(local_wind_kts, 1.9) * 0.00028) / (dist["bathymetry_slope"] * 1000)
                # Distance reduction factor
                surge_m *= max(0.0, 1.0 - (distance_km / 350.0))
            else:
                surge_m = 0.4
            
            surge_m = round(min(8.5, max(0.3, surge_m)), 2)

            # Inundation area calculation (sq km based on surge height vs district elevation)
            elevation_deficit = max(0.0, surge_m - (dist["elevation_m"] * 0.5))
            inundation_sq_km = round(elevation_deficit * 65.0 * (1.0 + (100.0 / max(distance_km, 20.0))), 1)

            # Composite Multi-hazard Risk Score (0 to 100)
            # Factors: Wind hazard (40%), Surge hazard (40%), Vulnerability/Elevation (20%)
            wind_hazard = min(100.0, (local_wind_kmh / 160.0) * 100.0)
            surge_hazard = min(100.0, (surge_m / 4.5) * 100.0)
            vuln_factor = min(100.0, (4.5 / max(dist["elevation_m"], 1.0)) * 50.0)

            risk_score = round(0.40 * wind_hazard + 0.40 * surge_hazard + 0.20 * vuln_factor, 1)
            risk_score = min(99.5, max(5.0, risk_score))

            if risk_score >= 80.0:
                risk_level = "Extreme"
                evac_ratio = 0.22
            elif risk_score >= 60.0:
                risk_level = "High"
                evac_ratio = 0.12
            elif risk_score >= 40.0:
                risk_level = "Moderate"
                evac_ratio = 0.04
            else:
                risk_level = "Low"
                evac_ratio = 0.0

            pop_affected = int(dist["population"] * (risk_score / 150.0))
            evac_count = int(pop_affected * evac_ratio)

            if risk_score > max_risk_score:
                max_risk_score = risk_score
                highest_risk_district = f"{dist['district_name']} ({dist['state_name']})"

            # Critical infrastructure threatened
            infras = []
            if local_wind_kmh > 90:
                infras.append("Power transmission lines & electrical substations")
                infras.append("Telecommunication towers")
            if surge_m > 2.0:
                infras.append("Coastal highways & port berths")
                infras.append("Low-lying drinking water reservoirs (salinity intrusion)")
            if local_wind_kmh > 120:
                infras.append("Thatched/asbestos dwellings & port gantry cranes")

            if not infras:
                infras.append("Minor disruption to rural feeder roads")

            district_profiles.append({
                "district_name": dist["district_name"],
                "state_name": dist["state_name"],
                "overall_risk_score": risk_score,
                "risk_level": risk_level,
                "storm_surge_risk_meters": surge_m,
                "wind_damage_hazard_kmh": local_wind_kmh,
                "inundation_area_sq_km": inundation_sq_km,
                "population_affected": pop_affected,
                "recommended_evacuation_count": evac_count,
                "critical_infrastructures_at_risk": infras,
            })

        # Sort districts by risk score descending
        district_profiles.sort(key=lambda x: x["overall_risk_score"], reverse=True)

        actions = [
            f"Activate Stage-IV Warning (Red Alert) for top vulnerable sectors: {highest_risk_district}.",
            "Initiate immediate preemptive evacuation of all populations within 5 km of coast & tidal creeks.",
            "Pre-position NDRF / SDRF water rescue teams and motorized inflatable boats in designated cyclone shelters.",
            "Complete suspension of all marine fishing operations and recall all offshore vessels.",
            "Suspend shipping operations and de-berth large container vessels at nearby major ports.",
        ]

        return self.postprocess({
            "cyclone_id": params["cyclone_id"],
            "cyclone_name": params["cyclone_name"],
            "analyzed_at": datetime.utcnow(),
            "composite_risk_index": max_risk_score,
            "highest_risk_district": highest_risk_district,
            "affected_districts": district_profiles,
            "recommended_actions": actions,
        })

    def postprocess(self, raw_outputs: Any) -> Dict[str, Any]:
        return raw_outputs
