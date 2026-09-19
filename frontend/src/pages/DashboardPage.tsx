import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { CycloneDetail, AlertBulletin, CoastalZone } from '../types';
import { MetricCard } from '../components/MetricCard';
import { CycloneBadge } from '../components/CycloneBadge';
import { GISMap } from '../components/GISMap';
import { WindPressureChart } from '../components/WindPressureChart';
import { CAPAlertCard } from '../components/CAPAlertCard';
import { GenesisModal } from '../components/GenesisModal';
import { IntensityModal } from '../components/IntensityModal';
import {
  Wind,
  Gauge,
  Compass,
  AlertTriangle,
  Play,
  Flame,
  Activity,
  ShieldCheck,
  RefreshCw,
  Clock,
  Layers,
  Sparkles
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const [activeCyclone, setActiveCyclone] = useState<CycloneDetail | null>(null);
  const [alerts, setAlerts] = useState<AlertBulletin[]>([]);
  const [coastalZones, setCoastalZones] = useState<CoastalZone[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isGenesisOpen, setIsGenesisOpen] = useState(false);
  const [isIntensityOpen, setIsIntensityOpen] = useState(false);
  const [predictingTrack, setPredictingTrack] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cyclonesRes, alertsRes, zonesRes] = await Promise.all([
        api.getActiveCyclones(),
        api.getActiveAlerts(),
        api.getCoastalZones(),
      ]);

      if (cyclonesRes.length > 0) {
        setActiveCyclone(cyclonesRes[0]);
      }
      setAlerts(alertsRes);
      setCoastalZones(zonesRes);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRerunTrackAI = async () => {
    if (!activeCyclone) return;
    setPredictingTrack(true);
    try {
      await api.predictTrack(activeCyclone.id, 72);
      // Reload cyclone data to get updated forecast points
      const updated = await api.getCycloneById(activeCyclone.id);
      setActiveCyclone(updated);
    } catch (err) {
      console.error('Error re-running track AI:', err);
    } finally {
      setPredictingTrack(false);
    }
  };

  const latestPt = activeCyclone?.track_points?.[activeCyclone.track_points.length - 1];
  const activeAlert = alerts[0];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner & Diagnostic Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Live Operations Command Center
            </h1>
            <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold animate-pulse">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>LIVE HAZARD TELEMETRY</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time hydrodynamic tracking, uncertainty cones, and early warning dissemination.
          </p>
        </div>

        {/* AI Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsGenesisOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-xs font-semibold transition"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Genesis Lab</span>
          </button>

          <button
            onClick={() => setIsIntensityOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-semibold transition"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Intensity Lab</span>
          </button>

          <button
            onClick={handleRerunTrackAI}
            disabled={predictingTrack || !activeCyclone}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white text-xs font-semibold shadow-md shadow-cyan-500/20 transition"
          >
            {predictingTrack ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            <span>Re-compute AI Ensembles</span>
          </button>
        </div>
      </div>

      {/* Telemetry Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Monitored Storm"
          value={activeCyclone ? activeCyclone.name : 'Searching...'}
          unit={activeCyclone ? activeCyclone.basin : ''}
          icon={Wind}
          color="rose"
        />

        <MetricCard
          title="Max Sustained Wind"
          value={latestPt ? Math.round(latestPt.wind_speed_knots * 1.852) : 120}
          unit="km/h (65 kts)"
          change="+15 km/h"
          isPositive={false}
          icon={Gauge}
          color="amber"
        />

        <MetricCard
          title="Estimated Central Pressure"
          value={latestPt ? latestPt.central_pressure_hpa : 984}
          unit="hPa"
          change="-6 hPa"
          isPositive={false}
          icon={Compass}
          color="cyan"
        />

        <MetricCard
          title="Projected Landfall Time"
          value="~22 hrs"
          unit="Odisha Coast"
          icon={Clock}
          color="rose"
        />
      </div>

      {/* Main Operations Section: GIS Map & Wind Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Large GIS Map (2 Columns on large screens) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <Compass className="w-4 h-4 text-cyan-400" />
                <span>Live GIS Track & 70% Probability Cone</span>
              </h2>
              {activeCyclone && <CycloneBadge category={activeCyclone.peak_category} />}
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Lat: {latestPt?.latitude.toFixed(1)}°N | Lon: {latestPt?.longitude.toFixed(1)}°E
            </span>
          </div>

          <GISMap
            cyclone={activeCyclone}
            coastalZones={coastalZones}
            height="500px"
          />
        </div>

        {/* Right Column: Coastal Risk & Vulnerability Overview */}
        <div className="space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Coastal Vulnerability Index</span>
            </h2>

            <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
              {coastalZones.slice(0, 5).map((zone) => {
                const isRed = zone.current_alert_level === 'Red';
                return (
                  <div
                    key={zone.id}
                    className={`p-3.5 rounded-xl glass-card border ${
                      isRed ? 'border-rose-500/30 glow-red' : 'border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="font-bold text-white text-xs">
                        {zone.district_name}, {zone.state_name}
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          isRed
                            ? 'bg-rose-500/20 text-rose-300'
                            : zone.current_alert_level === 'Orange'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-yellow-500/20 text-yellow-300'
                        }`}
                      >
                        {zone.current_alert_level.toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                      <div>
                        <span className="text-slate-400">At Risk:</span>{' '}
                        <span className="font-mono font-semibold text-white">
                          {(zone.population_at_risk / 100000).toFixed(1)}L
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400">Shelters:</span>{' '}
                        <span className="font-mono font-semibold text-white">{zone.shelter_count}</span>
                      </div>
                    </div>

                    <div className="mt-2 text-[11px] text-rose-400 font-semibold flex items-center space-x-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{zone.evacuation_status}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400">
            <span className="font-semibold text-slate-200">NDRF Advisory:</span> Pre-staged 18 disaster relief battalions in Balasore and Bhadrak multipurpose shelters.
          </div>
        </div>
      </div>

      {/* Dual Trajectory Chart & Official CAP Bulletin */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <WindPressureChart
            trackPoints={activeCyclone?.track_points}
            forecastPoints={activeCyclone?.forecast_points}
            height={280}
          />
        </div>

        <div>
          {activeAlert && <CAPAlertCard bulletin={activeAlert} />}
        </div>
      </div>

      {/* Simulation Modals */}
      <GenesisModal isOpen={isGenesisOpen} onClose={() => setIsGenesisOpen(false)} />
      <IntensityModal isOpen={isIntensityOpen} onClose={() => setIsIntensityOpen(false)} />
    </div>
  );
};
