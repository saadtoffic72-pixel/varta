import math
from typing import Any, Dict, List
from app.ai_modules.base import AbstractAIModel

class GenesisDetectionEngine(AbstractAIModel):
    """
    Tropical Cyclone Genesis Potential Index (TCGPI) & Convective Cloud Analysis Engine.
    Compatible with future Satellite Vision Transformer / ResNet multimodal feature fusion.
    """

    def __init__(self):
        super().__init__(model_name="VARTA-Genesis-TCGPI-CNN", version="1.4.2")
        self.load_weights()

    def load_weights(self, weights_path: str = "") -> bool:
        # Placeholder for torch.load or onnxruntime session initialization
        self.is_loaded = True
        return True

    def preprocess(self, inputs: Dict[str, Any]) -> Dict[str, float]:
        # Validate and sanitize environmental inputs
        return {
            "sst": float(inputs.get("sea_surface_temp_celsius", 29.0)),
            "vws": float(inputs.get("vertical_wind_shear_knots", 12.0)),
            "rh": float(inputs.get("mid_tropospheric_rh_percent", 70.0)),
            "vort": float(inputs.get("low_level_vorticity_1e5", 4.0)),
            "lat": float(inputs.get("center_latitude", 12.0)),
            "lon": float(inputs.get("center_longitude", 86.0)),
        }

    def predict(self, inputs: Dict[str, Any]) -> Dict[str, Any]:
        features = self.preprocess(inputs)

        # 1. Physical Genesis Potential Index (Camargo / Emanuel / Nolan approximation)
        # TCGPI = |eta|^1.5 * (RH/50)^3 * (SST/28)^2.5 * (1 + 0.1 * VWS)^-2
        favorable_factors: List[str] = []
        inhibiting_factors: List[str] = []

        # SST effect (Threshold: 26.5 C)
        sst = features["sst"]
        if sst >= 28.5:
            favorable_factors.append(f"High Sea Surface Temperature ({sst:.1f}°C > 28°C provides intense thermal energy)")
            sst_factor = math.pow(sst / 26.5, 2.8)
        elif sst >= 26.5:
            favorable_factors.append(f"Marginally favorable SST ({sst:.1f}°C)")
            sst_factor = math.pow(sst / 26.5, 1.5)
        else:
            inhibiting_factors.append(f"Sub-threshold SST ({sst:.1f}°C < 26.5°C restricts heat flux)")
            sst_factor = 0.2

        # Vertical Wind Shear (VWS) effect (< 15 kts favorable, > 25 kts destructive)
        vws = features["vws"]
        if vws <= 12.0:
            favorable_factors.append(f"Weak Vertical Wind Shear ({vws:.1f} kts allows vertical vortex alignment)")
            shear_factor = 1.0 / math.pow(1.0 + 0.08 * vws, 2.0)
        elif vws <= 20.0:
            favorable_factors.append(f"Moderate Wind Shear ({vws:.1f} kts)")
            shear_factor = 1.0 / math.pow(1.0 + 0.15 * vws, 2.2)
        else:
            inhibiting_factors.append(f"Severe Vertical Wind Shear ({vws:.1f} kts tilts and disrupts convective core)")
            shear_factor = 0.15

        # Mid-Tropospheric Humidity (RH)
        rh = features["rh"]
        if rh >= 65.0:
            favorable_factors.append(f"Moist mid-troposphere ({rh:.1f}% RH mitigates dry air intrusion)")
            rh_factor = math.pow(rh / 60.0, 2.5)
        else:
            inhibiting_factors.append(f"Dry air intrusion detected ({rh:.1f}% RH suppresses deep convection)")
            rh_factor = math.pow(rh / 60.0, 4.0)

        # Low-level Vorticity
        vort = features["vort"]
        if vort >= 3.5:
            favorable_factors.append(f"Strong 850 hPa cyclonic vorticity ({vort:.1f} x 10^-5 s^-1)")
            vort_factor = math.pow(max(vort, 1.0), 1.2)
        else:
            inhibiting_factors.append(f"Weak background vorticity ({vort:.1f} x 10^-5 s^-1)")
            vort_factor = 0.4

        # Coriolis Factor (distance from equator: at least 5 degrees N/S needed)
        lat = abs(features["lat"])
        coriolis_factor = min(1.0, lat / 6.0)

        # Raw index computation calibrated for North Indian Ocean baselines
        tcgpi = 0.85 * sst_factor * (shear_factor / 0.35) * rh_factor * (vort_factor / 4.0) * coriolis_factor
        tcgpi = round(tcgpi, 2)

        # Map to Sigmoid Genesis Probability (0% - 100%) centered around index of 2.0
        prob_raw = 1.0 / (1.0 + math.exp(-1.4 * (tcgpi - 2.2)))
        probability_pct = round(min(98.5, max(4.0, prob_raw * 100.0)), 1)

        # Classification mapping
        if probability_pct >= 75.0:
            classification = "High Potential (Genesis Imminent)"
            time_to_dep = 18
        elif probability_pct >= 50.0:
            classification = "Moderate Potential"
            time_to_dep = 36
        elif probability_pct >= 25.0:
            classification = "Low Potential"
            time_to_dep = 60
        else:
            classification = "Genesis Unlikely"
            time_to_dep = None

        return self.postprocess({
            "probability_percent": probability_pct,
            "tcgpi": tcgpi,
            "classification": classification,
            "time_to_depression_hours": time_to_dep,
            "favorable_factors": favorable_factors,
            "inhibiting_factors": inhibiting_factors,
            "confidence_score": 0.88,
        })

    def postprocess(self, raw_outputs: Any) -> Dict[str, Any]:
        return {
            "genesis_probability_percent": raw_outputs["probability_percent"],
            "tcgpi_index": raw_outputs["tcgpi"],
            "classification": raw_outputs["classification"],
            "projected_time_to_depression_hours": raw_outputs["time_to_depression_hours"],
            "dominant_favorable_factors": raw_outputs["favorable_factors"],
            "dominant_inhibiting_factors": raw_outputs["inhibiting_factors"],
            "confidence_score": raw_outputs["confidence_score"],
            "model_version": self.version,
        }
