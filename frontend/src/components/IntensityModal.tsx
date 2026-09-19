import React, { useState } from 'react';
import { api } from '../services/api';
import { IntensityResponse } from '../types';
import { Activity, Sparkles, X, Gauge, RefreshCw } from 'lucide-react';
import { CycloneBadge } from './CycloneBadge';

interface IntensityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IntensityModal: React.FC<IntensityModalProps> = ({ isOpen, onClose }) => {
  const [windKts, setWindKts] = useState(65.0);
  const [pressure, setPressure] = useState(982.0);
  const [eyeTemp, setEyeTemp] = useState(12.0);
  const [cloudTemp, setCloudTemp] = useState(-72.0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IntensityResponse | null>(null);

  if (!isOpen) return null;

  const handleClassify = async () => {
    setLoading(true);
    try {
      const res = await api.classifyIntensity({
        current_wind_speed_knots: windKts,
        central_pressure_hpa: pressure,
        eye_temperature_celsius: eyeTemp,
        cloud_top_temperature_celsius: cloudTemp,
      });
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="w-full max-w-2xl rounded-2xl glass-panel border border-amber-500/30 shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-5">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Gauge className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Intensity Classification Lab</h3>
            <p className="text-xs text-slate-400">
              Advanced Dvorak Technique (ADT) & IMD Standard Scale Regression
            </p>
          </div>
        </div>

        {/* Input Parameters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Observed Sustained Wind</span>
              <span className="font-mono font-bold text-cyan-400">{windKts.toFixed(0)} kts ({Math.round(windKts * 1.852)} km/h)</span>
            </div>
            <input
              type="range"
              min="15"
              max="155"
              step="1"
              value={windKts}
              onChange={(e) => setWindKts(parseFloat(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Central Pressure (hPa)</span>
              <span className="font-mono font-bold text-rose-400">{pressure.toFixed(0)} hPa</span>
            </div>
            <input
              type="range"
              min="900"
              max="1012"
              step="1"
              value={pressure}
              onChange={(e) => setPressure(parseFloat(e.target.value))}
              className="w-full accent-rose-500 cursor-pointer"
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Eye IR Temperature</span>
              <span className="font-mono font-bold text-amber-400">{eyeTemp.toFixed(1)} °C</span>
            </div>
            <input
              type="range"
              min="-10"
              max="25"
              step="0.5"
              value={eyeTemp}
              onChange={(e) => setEyeTemp(parseFloat(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Eyewall Cloud Top Temp</span>
              <span className="font-mono font-bold text-purple-400">{cloudTemp.toFixed(1)} °C</span>
            </div>
            <input
              type="range"
              min="-90"
              max="-40"
              step="0.5"
              value={cloudTemp}
              onChange={(e) => setCloudTemp(parseFloat(e.target.value))}
              className="w-full accent-purple-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end mb-6">
          <button
            onClick={handleClassify}
            disabled={loading}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-sm font-semibold shadow-lg shadow-amber-500/25 transition"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>Classify Intensity & Dvorak T-Number</span>
          </button>
        </div>

        {/* Inference Results View */}
        {result && (
          <div className="p-4 rounded-xl bg-slate-900/80 border border-amber-500/30 space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase">Official IMD Category</span>
                <div className="mt-1">
                  <CycloneBadge category={result.category} className="text-sm px-3 py-1" />
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 font-semibold uppercase">Dvorak Intensity</span>
                <div className="text-2xl font-extrabold font-mono text-amber-400">
                  T{result.dvorak_t_number.toFixed(1)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs pt-2">
              <div className="p-2.5 rounded-lg bg-black/40 border border-slate-800">
                <div className="text-slate-400">Max Sustained Wind</div>
                <div className="font-mono font-bold text-white text-sm mt-0.5">{result.estimated_msw_kmh} km/h</div>
              </div>
              <div className="p-2.5 rounded-lg bg-black/40 border border-slate-800">
                <div className="text-slate-400">Pressure Deficit</div>
                <div className="font-mono font-bold text-rose-400 text-sm mt-0.5">-{result.pressure_deficit_hpa} hPa</div>
              </div>
              <div className="p-2.5 rounded-lg bg-black/40 border border-slate-800">
                <div className="text-slate-400">24h Rapid Trend</div>
                <div className="font-semibold text-emerald-400 text-xs mt-0.5">{result.intensity_trend_24h}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
