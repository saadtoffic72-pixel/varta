import React, { useState } from 'react';
import { api } from '../services/api';
import { GenesisResponse } from '../types';
import { Flame, Sparkles, X, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

interface GenesisModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GenesisModal: React.FC<GenesisModalProps> = ({ isOpen, onClose }) => {
  const [basin, setBasin] = useState('Bay of Bengal');
  const [sst, setSst] = useState(29.4);
  const [vws, setVws] = useState(11.0);
  const [rh, setRh] = useState(76.0);
  const [vort, setVort] = useState(5.4);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenesisResponse | null>(null);

  if (!isOpen) return null;

  const handleRunDiagnosis = async () => {
    setLoading(true);
    try {
      const res = await api.detectGenesis({
        basin,
        center_latitude: 14.0,
        center_longitude: 88.0,
        sea_surface_temp_celsius: sst,
        vertical_wind_shear_knots: vws,
        mid_tropospheric_rh_percent: rh,
        low_level_vorticity_1e5: vort,
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
      <div className="w-full max-w-2xl rounded-2xl glass-panel border border-cyan-500/30 shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-5">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Cyclone Genesis Detection Lab</h3>
            <p className="text-xs text-slate-400">
              Interactive TCGPI (Tropical Cyclone Genesis Potential Index) & Deep Convection Simulator
            </p>
          </div>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Sea Surface Temp (SST)</span>
              <span className="font-mono font-bold text-cyan-400">{sst.toFixed(1)} °C</span>
            </div>
            <input
              type="range"
              min="24.0"
              max="32.5"
              step="0.1"
              value={sst}
              onChange={(e) => setSst(parseFloat(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>24°C (Sub-threshold)</span>
              <span>26.5°C (Threshold)</span>
              <span>32°C (Super-warm)</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Vertical Wind Shear (VWS)</span>
              <span className="font-mono font-bold text-amber-400">{vws.toFixed(1)} kts</span>
            </div>
            <input
              type="range"
              min="4.0"
              max="35.0"
              step="0.5"
              value={vws}
              onChange={(e) => setVws(parseFloat(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>&lt;10 kts (Favorable)</span>
              <span>20 kts (Moderate)</span>
              <span>&gt;30 kts (Hostile)</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Mid-Tropospheric RH (700-500 hPa)</span>
              <span className="font-mono font-bold text-sky-400">{rh.toFixed(0)} %</span>
            </div>
            <input
              type="range"
              min="30"
              max="95"
              step="1"
              value={rh}
              onChange={(e) => setRh(parseFloat(e.target.value))}
              className="w-full accent-sky-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>30% (Dry intrusion)</span>
              <span>70% (Moist)</span>
              <span>95% (Saturated)</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">850 hPa Relative Vorticity</span>
              <span className="font-mono font-bold text-emerald-400">{vort.toFixed(1)} x10⁻⁵ s⁻¹</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="10.0"
              step="0.1"
              value={vort}
              onChange={(e) => setVort(parseFloat(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>1.0 (Weak)</span>
              <span>5.0 (Moderate)</span>
              <span>10.0 (Vortical core)</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end mb-6">
          <button
            onClick={handleRunDiagnosis}
            disabled={loading}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white text-sm font-semibold shadow-lg shadow-cyan-500/25 transition"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>Execute AI Diagnostic Engine</span>
          </button>
        </div>

        {/* Inference Results View */}
        {result && (
          <div className="p-4 rounded-xl bg-slate-900/80 border border-cyan-500/30 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase">Diagnosis Outcome</span>
                <div className="text-xl font-extrabold text-white">{result.classification}</div>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 font-semibold uppercase">Genesis Probability</span>
                <div className="text-2xl font-extrabold font-mono text-cyan-400">
                  {result.genesis_probability_percent}%
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-black/40 border border-slate-800">
                <span className="text-slate-400">Computed TCGPI Score:</span>
                <span className="ml-2 font-mono font-bold text-white">{result.tcgpi_index}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-black/40 border border-slate-800">
                <span className="text-slate-400">Time to Depression:</span>
                <span className="ml-2 font-mono font-bold text-amber-400">
                  {result.projected_time_to_depression_hours ? `${result.projected_time_to_depression_hours} hrs` : 'N/A'}
                </span>
              </div>
            </div>

            {/* Contributing factors */}
            <div className="space-y-1.5 text-xs">
              <span className="font-semibold text-slate-300">Environmental Diagnostics:</span>
              {result.dominant_favorable_factors.map((f, i) => (
                <div key={i} className="flex items-center space-x-2 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
              {result.dominant_inhibiting_factors.map((f, i) => (
                <div key={i} className="flex items-center space-x-2 text-rose-400">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
