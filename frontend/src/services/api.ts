import axios from 'axios';
import {
  CycloneDetail,
  GenesisRequest,
  GenesisResponse,
  IntensityRequest,
  IntensityResponse,
  TrackPredictionResponse,
  RiskAnalysisResponse,
  AlertBulletin,
  CoastalZone,
  AnalyticsOverview,
  AIModel,
  DatasetSource
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('varta_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  login: async (username: string, password: string) => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    const res = await apiClient.post('/auth/token', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    return res.data;
  },

  // Cyclones
  getCyclones: async (status?: string): Promise<CycloneDetail[]> => {
    const res = await apiClient.get('/cyclones', { params: { status } });
    return res.data;
  },

  getActiveCyclones: async (): Promise<CycloneDetail[]> => {
    const res = await apiClient.get('/cyclones/active');
    return res.data;
  },

  getCycloneById: async (id: number): Promise<CycloneDetail> => {
    const res = await apiClient.get(`/cyclones/${id}`);
    return res.data;
  },

  // AI Diagnostic Services
  detectGenesis: async (data: GenesisRequest): Promise<GenesisResponse> => {
    const res = await apiClient.post('/predictions/genesis', data);
    return res.data;
  },

  classifyIntensity: async (data: IntensityRequest): Promise<IntensityResponse> => {
    const res = await apiClient.post('/predictions/intensity', data);
    return res.data;
  },

  predictTrack: async (cycloneId: number, forecastHorizon: number = 72): Promise<TrackPredictionResponse> => {
    const res = await apiClient.post('/predictions/track', {
      cyclone_id: cycloneId,
      forecast_horizon_hours: forecastHorizon,
    });
    return res.data;
  },

  analyzeRisk: async (cycloneId: number): Promise<RiskAnalysisResponse> => {
    const res = await apiClient.post('/predictions/risk', { cyclone_id: cycloneId });
    return res.data;
  },

  // Alerts & Bulletins
  getActiveAlerts: async (): Promise<AlertBulletin[]> => {
    const res = await apiClient.get('/alerts/active');
    return res.data;
  },

  getCoastalZones: async (): Promise<CoastalZone[]> => {
    const res = await apiClient.get('/alerts/coastal-zones');
    return res.data;
  },

  generateAlert: async (cycloneId: number, alertLevel?: string): Promise<AlertBulletin> => {
    const res = await apiClient.post('/alerts/generate', {
      cyclone_id: cycloneId,
      alert_level: alertLevel,
    });
    return res.data;
  },

  // Analytics
  getAnalyticsOverview: async (): Promise<AnalyticsOverview> => {
    const res = await apiClient.get('/analytics/overview');
    return res.data;
  },

  // Admin & Datasets
  getModels: async (): Promise<AIModel[]> => {
    const res = await apiClient.get('/admin/models');
    return res.data;
  },

  activateModel: async (modelId: number) => {
    const res = await apiClient.post(`/admin/models/${modelId}/activate`);
    return res.data;
  },

  getDatasets: async (): Promise<DatasetSource[]> => {
    const res = await apiClient.get('/admin/datasets');
    return res.data;
  },

  syncDataset: async (datasetId: number) => {
    const res = await apiClient.post(`/admin/datasets/${datasetId}/sync`);
    return res.data;
  },
};
