export interface TrackPoint {
  id: number;
  cyclone_id: number;
  timestamp: string;
  latitude: number;
  longitude: number;
  intensity_category: string;
  wind_speed_knots: number;
  central_pressure_hpa: number;
  movement_speed_kmh: number;
  movement_direction_deg: number;
  radius_34kt_nm: number;
  radius_50kt_nm: number;
  radius_64kt_nm: number;
  source: string;
}

export interface ForecastPoint {
  id: number;
  cyclone_id: number;
  forecast_time_hours: number;
  valid_timestamp: string;
  latitude: number;
  longitude: number;
  intensity_category: string;
  wind_speed_knots: number;
  central_pressure_hpa: number;
  cone_radius_km: number;
  model_name: string;
}

export interface CycloneDetail {
  id: number;
  code: string;
  name: string;
  basin: string;
  status: string;
  genesis_date: string;
  landfall_date?: string;
  peak_category: string;
  peak_wind_speed_knots: number;
  min_pressure_hpa: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  track_points: TrackPoint[];
  forecast_points: ForecastPoint[];
}

export interface GenesisRequest {
  basin: string;
  center_latitude: number;
  center_longitude: number;
  sea_surface_temp_celsius: number;
  vertical_wind_shear_knots: number;
  mid_tropospheric_rh_percent: number;
  low_level_vorticity_1e5: number;
}

export interface GenesisResponse {
  genesis_probability_percent: number;
  tcgpi_index: number;
  classification: string;
  projected_time_to_depression_hours?: number;
  dominant_favorable_factors: string[];
  dominant_inhibiting_factors: string[];
  confidence_score: number;
  model_version: string;
}

export interface IntensityRequest {
  cyclone_id?: number;
  current_wind_speed_knots: number;
  central_pressure_hpa: number;
  eye_temperature_celsius?: number;
  cloud_top_temperature_celsius?: number;
  dvorak_t_number?: number;
}

export interface IntensityResponse {
  category: string;
  dvorak_t_number: number;
  estimated_msw_knots: number;
  estimated_msw_kmh: number;
  estimated_central_pressure_hpa: number;
  pressure_deficit_hpa: number;
  intensity_trend_24h: string;
  confidence_score: number;
  model_name: string;
}

export interface LandfallInfo {
  is_landfall_expected: boolean;
  estimated_landfall_time?: string;
  estimated_location?: string;
  estimated_latitude?: number;
  estimated_longitude?: number;
  expected_category_at_landfall?: string;
  expected_wind_speed_kmh?: number;
  confidence_interval_hours: number;
}

export interface TrackPredictionResponse {
  cyclone_id: number;
  cyclone_name: string;
  model_used: string;
  issued_at: string;
  track_coordinates: {
    forecast_time_hours: number;
    valid_timestamp: string;
    latitude: number;
    longitude: number;
    intensity_category: string;
    wind_speed_knots: number;
    wind_speed_kmh: number;
    central_pressure_hpa: number;
    cone_radius_km: number;
    movement_speed_kmh: number;
    movement_direction_deg: number;
  }[];
  landfall: LandfallInfo;
  cone_geojson: any;
}

export interface DistrictRiskProfile {
  district_name: string;
  state_name: string;
  overall_risk_score: number;
  risk_level: string;
  storm_surge_risk_meters: number;
  wind_damage_hazard_kmh: number;
  inundation_area_sq_km: number;
  population_affected: number;
  recommended_evacuation_count: number;
  critical_infrastructures_at_risk: string[];
}

export interface RiskAnalysisResponse {
  cyclone_id: number;
  cyclone_name: string;
  analyzed_at: string;
  composite_risk_index: number;
  highest_risk_district: string;
  affected_districts: DistrictRiskProfile[];
  recommended_actions: string[];
}

export interface AlertBulletin {
  id: number;
  cyclone_id: number;
  cyclone_name?: string;
  bulletin_number: number;
  alert_level: 'Green' | 'Yellow' | 'Orange' | 'Red';
  issue_time: string;
  expected_landfall_time?: string;
  expected_landfall_location?: string;
  expected_wind_speed_kmh: number;
  surge_height_meters: number;
  affected_states: string;
  affected_districts: string;
  safety_recommendations: string;
  cap_identifier: string;
  is_active: boolean;
}

export interface CoastalZone {
  id: number;
  state_name: string;
  district_name: string;
  latitude: number;
  longitude: number;
  population_at_risk: number;
  shelter_count: number;
  shelter_capacity: number;
  vulnerability_index: number;
  current_alert_level: string;
  evacuation_status: string;
}

export interface AnalyticsOverview {
  total_monitored_cyclones: number;
  active_cyclones_count: number;
  historical_archives_count: number;
  red_alerts_issued_last_30d: number;
  basins: {
    basin: string;
    total_cyclones: number;
    super_cyclones: number;
    very_severe_cyclones: number;
    avg_annual_frequency: number;
  }[];
  decadal_trends: {
    decade: string;
    total_count: number;
    severe_count: number;
    intensification_ratio: number;
  }[];
  notable_cyclones: {
    name: string;
    year: number;
    basin: string;
    peak_category: string;
    max_wind_kmh: number;
    min_pressure_hpa: number;
    damage_usd_millions?: number;
    fatalities?: number;
  }[];
  model_performance_benchmarks: {
    track_forecast_error_nm: Record<string, number>;
    intensity_rmse_knots: number;
    genesis_lead_time_hours: number;
    false_alarm_ratio: number;
    probability_of_detection: number;
  };
}

export interface AIModel {
  id: number;
  name: string;
  task: string;
  version: string;
  architecture: string;
  description: string;
  track_mae_nm?: number;
  intensity_rmse_knots?: number;
  inference_latency_ms: number;
  active_in_prod: boolean;
  parameters_count: string;
}

export interface DatasetSource {
  id: number;
  source_name: string;
  provider: string;
  description: string;
  records_count: number;
  spatial_coverage: string;
  temporal_coverage: string;
  file_format: string;
  status: string;
  last_synced: string;
}
