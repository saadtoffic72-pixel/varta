import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { CycloneDetail, CoastalZone } from '../types';
import { CycloneBadge } from '../components/CycloneBadge';
import { GISMap } from '../components/GISMap';
import { WindPressureChart } from '../components/WindPressureChart';
import { Compass, Wind, Gauge, Calendar, ShieldCheck, ArrowLeft, Layers } from 'lucide-react';

export const CycloneDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [cyclone, setCyclone] = useState<CycloneDetail | null>(null);
  const [coastalZones, setCoastalZones] = useState<CoastalZone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([api.getCycloneById(Number(id)), api.getCoastalZones()])
      .then(([cyc, zones]) => {
        setCyclone(cyc);
        setCoastalZones(zones);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading || !cyclone) {
    return (
      <div className="p-8 text-center text-slate-400">
        Loading detailed storm trajectory and meteorological records...
      </div>
    );
  }

  const latestPt = cyclone.track_points[cyclone.track_points.length - 1];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Back Button */}
      <Link
        to="/dashboard"
        className="inline-flex items-center space-x-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-semibold transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Live Operations Dashboard</span>
      </Link>

      {/* Storm Header Info */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-black text-white">{cyclone.name}</h1>
            <CycloneBadge category={cyclone.peak_category} />
            <span className="text-xs px-3 py-1 rounded-full bg-slate-800 text-slate-200 border border-slate-700 font-mono">
              {cyclone.code}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Basin: {cyclone.basin} | Status: {cyclone.status} | Genesis: {new Date(cyclone.genesis_date).toUTCString()}
          </p>
        </div>

        <div className="flex items-center space-x-4 font-mono text-xs">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-400 text-[10px] block">PEAK WIND VELOCITY</span>
            <span className="text-cyan-400 font-bold text-lg">
              {Math.round(cyclone.peak_wind_speed_knots * 1.852)} km/h
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-400 text-[10px] block">MIN CENTRAL PRESSURE</span>
            <span className="text-rose-400 font-bold text-lg">{cyclone.min_pressure_hpa} hPa</span>
          </div>
        </div>
      </div>

      {/* GIS Map & Hydrodynamic Track */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <GISMap
            cyclone={cyclone}
            coastalZones={coastalZones}
            height="520px"
          />
        </div>

        <div>
          <WindPressureChart
            trackPoints={cyclone.track_points}
            forecastPoints={cyclone.forecast_points}
            height={460}
          />
        </div>
      </div>

      {/* Full Waypoints Chronological Table */}
      <div className="glass-card p-5 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <Compass className="w-4 h-4 text-cyan-400" />
            <span>Complete Track & Forecast Waypoints Record</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            Total Points: {cyclone.track_points.length + cyclone.forecast_points.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] font-mono border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Timestamp (UTC)</th>
                <th className="py-2.5 px-3">Latitude / Longitude</th>
                <th className="py-2.5 px-3">Classification Stage</th>
                <th className="py-2.5 px-3">Wind Speed</th>
                <th className="py-2.5 px-3">Pressure</th>
                <th className="py-2.5 px-3">Translation Speed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {cyclone.track_points.map((pt) => (
                <tr key={`tp-${pt.id}`} className="hover:bg-slate-800/30">
                  <td className="py-2.5 px-3 font-bold text-cyan-400">Observed</td>
                  <td className="py-2.5 px-3">{new Date(pt.timestamp).toUTCString().slice(5, 22)}</td>
                  <td className="py-2.5 px-3 text-cyan-300">{pt.latitude.toFixed(2)}°N, {pt.longitude.toFixed(2)}°E</td>
                  <td className="py-2.5 px-3 font-sans text-slate-200">{pt.intensity_category}</td>
                  <td className="py-2.5 px-3">{Math.round(pt.wind_speed_knots * 1.852)} km/h ({pt.wind_speed_knots} kts)</td>
                  <td className="py-2.5 px-3">{pt.central_pressure_hpa} hPa</td>
                  <td className="py-2.5 px-3">{pt.movement_speed_kmh} km/h</td>
                </tr>
              ))}
              {cyclone.forecast_points.map((fp) => (
                <tr key={`fp-${fp.id}`} className="hover:bg-slate-800/30 bg-amber-950/10">
                  <td className="py-2.5 px-3 font-bold text-amber-400">Forecast +{fp.forecast_time_hours}h</td>
                  <td className="py-2.5 px-3">{new Date(fp.valid_timestamp).toUTCString().slice(5, 22)}</td>
                  <td className="py-2.5 px-3 text-amber-300">{fp.latitude.toFixed(2)}°N, {fp.longitude.toFixed(2)}°E</td>
                  <td className="py-2.5 px-3 font-sans text-slate-200">{fp.intensity_category}</td>
                  <td className="py-2.5 px-3">{Math.round(fp.wind_speed_knots * 1.852)} km/h ({fp.wind_speed_knots} kts)</td>
                  <td className="py-2.5 px-3">{fp.central_pressure_hpa} hPa</td>
                  <td className="py-2.5 px-3 text-amber-400">±{fp.cone_radius_km} km (Cone)</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
