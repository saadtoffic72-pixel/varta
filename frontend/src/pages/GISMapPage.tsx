import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { CycloneDetail, CoastalZone } from '../types';
import { GISMap } from '../components/GISMap';
import { CycloneBadge } from '../components/CycloneBadge';
import { Compass, Layers, Wind, Gauge, MapPin, Calendar, Activity } from 'lucide-react';

export const GISMapPage: React.FC = () => {
  const [cyclones, setCyclones] = useState<CycloneDetail[]>([]);
  const [selectedCycloneId, setSelectedCycloneId] = useState<number | null>(null);
  const [coastalZones, setCoastalZones] = useState<CoastalZone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getCyclones(), api.getCoastalZones()])
      .then(([cycList, zones]) => {
        setCyclones(cycList);
        if (cycList.length > 0) {
          setSelectedCycloneId(cycList[0].id);
        }
        setCoastalZones(zones);
      })
      .finally(() => setLoading(false));
  }, []);

  const selectedCyclone = cyclones.find((c) => c.id === selectedCycloneId) || cyclones[0];
  const latestPt = selectedCyclone?.track_points?.[selectedCyclone.track_points.length - 1];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header & Cyclone Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center space-x-2">
            <Compass className="w-6 h-6 text-cyan-400" />
            <span>Interactive GIS Geospatial Center</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Displaying cyclone eye tracks, 70% probability uncertainty envelope, wind swath radii, and coastal vulnerability markers.
          </p>
        </div>

        {/* Dropdown to switch cyclone */}
        <div className="flex items-center space-x-3 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 px-2 font-medium">Select Storm:</span>
          <select
            value={selectedCycloneId || ''}
            onChange={(e) => setSelectedCycloneId(Number(e.target.value))}
            className="bg-slate-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-cyan-500"
          >
            {cyclones.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.basin} - {c.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Map View */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl glass-card border border-slate-800 text-xs">
          <div className="flex items-center space-x-3">
            <span className="font-bold text-white text-sm">{selectedCyclone?.name}</span>
            {selectedCyclone && <CycloneBadge category={selectedCyclone.peak_category} />}
            <span className="text-slate-400">Basin: <span className="text-slate-200">{selectedCyclone?.basin}</span></span>
          </div>

          <div className="flex items-center space-x-4 text-slate-300 font-mono">
            {latestPt && (
              <>
                <span>Max Wind: <strong className="text-cyan-400">{latestPt.wind_speed_knots} kts</strong> ({Math.round(latestPt.wind_speed_knots * 1.852)} km/h)</span>
                <span>Pressure: <strong className="text-rose-400">{latestPt.central_pressure_hpa} hPa</strong></span>
              </>
            )}
          </div>
        </div>

        <GISMap
          cyclone={selectedCyclone}
          coastalZones={coastalZones}
          height="620px"
        />
      </div>

      {/* Waypoints & Coordinate Track Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Past Observations */}
        <div className="glass-card p-4 rounded-2xl space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center space-x-2">
            <Activity className="w-3.5 h-3.5" />
            <span>Observed Track Positions</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] font-mono border-b border-slate-800">
                <tr>
                  <th className="py-2 px-2.5">Time (UTC)</th>
                  <th className="py-2 px-2.5">Coordinates</th>
                  <th className="py-2 px-2.5">Category</th>
                  <th className="py-2 px-2.5">Wind / Pres</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {selectedCyclone?.track_points?.map((pt) => (
                  <tr key={pt.id} className="hover:bg-slate-800/30">
                    <td className="py-2 px-2.5">{new Date(pt.timestamp).toUTCString().slice(5, 22)}</td>
                    <td className="py-2 px-2.5 text-cyan-300">{pt.latitude.toFixed(1)}°N, {pt.longitude.toFixed(1)}°E</td>
                    <td className="py-2 px-2.5 font-sans text-slate-200">{pt.intensity_category}</td>
                    <td className="py-2 px-2.5">{Math.round(pt.wind_speed_knots * 1.852)} km/h / {pt.central_pressure_hpa} hPa</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Forecast Points */}
        <div className="glass-card p-4 rounded-2xl space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-2">
            <Compass className="w-3.5 h-3.5" />
            <span>Forecast Trajectory & Uncertainty Radius</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] font-mono border-b border-slate-800">
                <tr>
                  <th className="py-2 px-2.5">Lead Time</th>
                  <th className="py-2 px-2.5">Forecast Coord</th>
                  <th className="py-2 px-2.5">Projected Stage</th>
                  <th className="py-2 px-2.5">Error Cone Radius</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {selectedCyclone?.forecast_points?.map((fp) => (
                  <tr key={fp.id} className="hover:bg-slate-800/30">
                    <td className="py-2 px-2.5 text-amber-400 font-bold">+{fp.forecast_time_hours} hrs</td>
                    <td className="py-2 px-2.5 text-amber-300">{fp.latitude.toFixed(1)}°N, {fp.longitude.toFixed(1)}°E</td>
                    <td className="py-2 px-2.5 font-sans text-slate-200">{fp.intensity_category}</td>
                    <td className="py-2 px-2.5">±{fp.cone_radius_km} km</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
