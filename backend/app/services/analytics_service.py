from typing import Dict, Any
from app.schemas.analytics import (
    AnalyticsOverviewResponse, BasinComparison, DecadalTrend, CycloneStatItem
)

class AnalyticsService:
    @staticmethod
    def get_overview() -> AnalyticsOverviewResponse:
        basins = [
            BasinComparison(
                basin="Bay of Bengal",
                total_cyclones=480,
                super_cyclones=14,
                very_severe_cyclones=118,
                avg_annual_frequency=4.2
            ),
            BasinComparison(
                basin="Arabian Sea",
                total_cyclones=165,
                super_cyclones=3,
                very_severe_cyclones=32,
                avg_annual_frequency=1.6
            ),
        ]

        decadal = [
            DecadalTrend(decade="1991-2000", total_count=48, severe_count=19, intensification_ratio=0.39),
            DecadalTrend(decade="2001-2010", total_count=44, severe_count=21, intensification_ratio=0.47),
            DecadalTrend(decade="2011-2020", total_count=52, severe_count=29, intensification_ratio=0.55),
            DecadalTrend(decade="2021-2026", total_count=31, severe_count=19, intensification_ratio=0.61),
        ]

        notable = [
            CycloneStatItem(
                name="Cyclone Dana",
                year=2024,
                basin="Bay of Bengal",
                peak_category="Severe Cyclonic Storm",
                max_wind_kmh=120.0,
                min_pressure_hpa=984.0,
                damage_usd_millions=140.0,
                fatalities=4
            ),
            CycloneStatItem(
                name="Cyclone Biparjoy",
                year=2023,
                basin="Arabian Sea",
                peak_category="Extremely Severe Cyclonic Storm",
                max_wind_kmh=195.0,
                min_pressure_hpa=958.0,
                damage_usd_millions=1200.0,
                fatalities=12
            ),
            CycloneStatItem(
                name="Cyclone Mocha",
                year=2023,
                basin="Bay of Bengal",
                peak_category="Extremely Severe Cyclonic Storm",
                max_wind_kmh=275.0,
                min_pressure_hpa=918.0,
                damage_usd_millions=1500.0,
                fatalities=145
            ),
            CycloneStatItem(
                name="Cyclone Tauktae",
                year=2021,
                basin="Arabian Sea",
                peak_category="Extremely Severe Cyclonic Storm",
                max_wind_kmh=220.0,
                min_pressure_hpa=950.0,
                damage_usd_millions=2100.0,
                fatalities=169
            ),
            CycloneStatItem(
                name="Cyclone Amphan",
                year=2020,
                basin="Bay of Bengal",
                peak_category="Super Cyclonic Storm",
                max_wind_kmh=260.0,
                min_pressure_hpa=907.0,
                damage_usd_millions=13500.0,
                fatalities=128
            ),
            CycloneStatItem(
                name="Cyclone Fani",
                year=2019,
                basin="Bay of Bengal",
                peak_category="Extremely Severe Cyclonic Storm",
                max_wind_kmh=215.0,
                min_pressure_hpa=932.0,
                damage_usd_millions=8100.0,
                fatalities=89
            ),
        ]

        benchmarks = {
            "track_forecast_error_nm": {
                "12h": 26.4,
                "24h": 46.8,
                "36h": 71.2,
                "48h": 94.5,
                "72h": 139.2,
                "96h": 188.0,
                "120h": 242.5
            },
            "intensity_rmse_knots": 7.8,
            "genesis_lead_time_hours": 54.0,
            "false_alarm_ratio": 0.11,
            "probability_of_detection": 0.93,
        }

        return AnalyticsOverviewResponse(
            total_monitored_cyclones=645,
            active_cyclones_count=1,
            historical_archives_count=644,
            red_alerts_issued_last_30d=2,
            basins=basins,
            decadal_trends=decadal,
            notable_cyclones=notable,
            model_performance_benchmarks=benchmarks
        )

analytics_service = AnalyticsService()
