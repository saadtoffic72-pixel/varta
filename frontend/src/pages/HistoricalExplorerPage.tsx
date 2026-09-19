import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { CycloneDetail, CoastalZone } from '../types';
import { CycloneBadge } from '../components/CycloneBadge';
import { GISMap } from '../components/GISMap';
import { WindPressureChart } from '../components/WindPressureChart';
import { History, Calendar, Wind, Gauge, Award, ExternalLink, MapPin } from 'lucide-react';

export const HistoricalExplorerPage: React.FC = () => {
  const [cyclones, setCyclones] = useState<CycloneDetail[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [coastalZones, setCoastalZones] = useState<CoastalZone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getCyclones(), api.getCoastalZones()])
      .then(([allCyclones, zones]) => {
        setCyclones(allCyclones);
        if (allCyclones.length > 0) {
          // Default to historical storm if available, otherwise first
          const hist = allCyclones.find((c) => c.status === 'Historical');
          setSelectedId(hist ? hist.id : allCyclones[0].id);
        }
        setCoastalZones(zones);
      })
      .finally(() => setLoading(false));
  }, []);

  const selectedCyclone = cyclones.find((c) => c.id === selectedId) || cyclones[0];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center space-x-2">
          <History className="w-6 h-6 text-cyan-400" />
          <span>Historical Cyclone Archive & Benchmark Explorer</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Explore past North Indian Ocean super storms, validate AI model accuracy against official IMD best-track archives, and study intensification patterns.
        </p>
      </div>

      {/* Historical Storms Carousel / Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cyclones.map((c) => {
          const isSelected = c.id === selectedCyclone?.id;
          return (
            <div
              key={c.id}
              onClick={() => setSelectedId(c.id)}
              className={`p-4 rounded-2xl cursor-pointer glass-card border transition ${
                isSelected
                  ? 'border-cyan-500/60 bg-cyan-950/20 shadow-lg shadow-cyan-500/10 scale-[1.02]'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-slate-400">{c.code}</span>
                <CycloneBadge category={c.peak_category} />
              </div>

              <h3 className="text-lg font-bold text-white mb-1">{c.name}</h3>
              <p className="text-xs text-slate-400 mb-3">{c.basin}</p>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2 border-t border-slate-800/80">
                <div>
                  <span className="text-slate-400 text-[10px] block">PEAK WIND</span>
                  <span className="text-cyan-300 font-bold">
                    {Math.round(c.peak_wind_speed_knots * 1.852)} km/h
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">MIN PRESSURE</span>
                  <span className="text-rose-400 font-bold">{c.min_pressure_hpa} hPa</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Storm In-Depth Analysis */}
      {selectedCyclone && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl glass-panel border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-3">
                <h2 className="text-2xl font-black text-white">{selectedCyclone.name}</h2>
                <CycloneBadge category={selectedCyclone.peak_category} />
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {selectedCyclone.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                Official Identifier: {selectedCyclone.code} | Genesis: {new Date(selectedCyclone.genesis_date).toDateString()}
              </p>
            </div>

            <div className="flex items-center space-x-4 text-xs font-mono">
              <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400">Total Track Steps:</span>{' '}
                <span className="font-bold text-cyan-400">{selectedCyclone.track_points.length}</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400">Database Record:</span>{' '}
                <span className="font-bold text-emerald-400">IMD BestTrack Verified</span>
              </div>
            </div>
          </div>

          {/* GIS Map and Wind Profile */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <GISMap
                cyclone={selectedCyclone}
                coastalZones={coastalZones}
                height="480px"
              />
            </div>

            <div>
              <WindPressureChart
                trackPoints={selectedCyclone.track_points}
                forecastPoints={selectedCyclone.forecast_points}
                height={420}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
