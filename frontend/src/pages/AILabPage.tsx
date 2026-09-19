import React, { useState } from 'react';
import { api } from '../services/api';
import { GenesisResponse, IntensityResponse, RiskAnalysisResponse } from '../types';
import { CycloneBadge } from '../components/CycloneBadge';
import { Flame, Activity, ShieldAlert, Sparkles, RefreshCw, CheckCircle2, AlertCircle, Waves, Wind, MapPin } from 'lucide-react';

export const AILabPage: React.FC = () => {
  // 1. Genesis Simulator State
  const [sst, setSst] = useState(29.6);
  const [vws, setVws] = useState(9.5);
  const [rh, setRh] = useState(78.0);
  const [vort, setVort] = useState(5.6);
  const [genesisLoading, setGenesisLoading] = useState(false);
  const [genesisResult, setGenesisResult] = useState<GenesisResponse | null>(null);

  // 2. Intensity Simulator State
  const [windKts, setWindKts] = useState(75.0);
  const [pressure, setPressure] = useState(972.0);
  const [eyeTemp, setEyeTemp] = useState(14.0);
  const [cloudTemp, setCloudTemp] = useState(-75.0);
  const [intensityLoading, setIntensityLoading] = useState(false);
  const [intensityResult, setIntensityResult] = useState<IntensityResponse | null>(null);

  // 3. Multi-Hazard Risk State
  const [riskLoading, setRiskLoading] = useState(false);
  const [riskResult, setRiskResult] = useState<RiskAnalysisResponse | null>(null);

  const runGenesisAI = async () => {
    setGenesisLoading(true);
    try {
      const res = await api.detectGenesis({
        basin: 'Bay of Bengal',
        center_latitude: 14.2,
        center_longitude: 88.4,
        sea_surface_temp_celsius: sst,
        vertical_wind_shear_knots: vws,
        mid_tropospheric_rh_percent: rh,
        low_level_vorticity_1e5: vort,
      });
      setGenesisResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setGenesisLoading(false);
    }
  };

  const runIntensityAI = async () => {
    setIntensityLoading(true);
    try {
      const res = await api.classifyIntensity({
        current_wind_speed_knots: windKts,
        central_pressure_hpa: pressure,
        eye_temperature_celsius: eyeTemp,
        cloud_top_temperature_celsius: cloudTemp,
      });
      setIntensityResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIntensityLoading(false);
    }
  };

  const runRiskAI = async () => {
    setRiskLoading(true);
    try {
      const res = await api.analyzeRisk(1); // Run on active storm
      setRiskResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setRiskLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center space-x-2">
          <Sparkles className="w-6 h-6 text-cyan-400" />
          <span>AI Diagnostic Laboratories & Simulation Sandbox</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Interactive neural network simulation interfaces for Tropical Cyclogenesis, Advanced Dvorak Intensity Classification, and Multi-Hazard Surge Risk Modeling.
        </p>
      </div>

      {/* Lab 1: Genesis Detection */}
      <div className="glass-card p-6 rounded-2xl space-y-5 border border-cyan-500/20">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Lab 1: Tropical Cyclone Genesis Potential Engine</h2>
              <p className="text-xs text-slate-400">Model: VARTA-Genesis-TCGPI-CNN (v1.4.2)</p>
            </div>
          </div>

          <button
            onClick={runGenesisAI}
            disabled={genesisLoading}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/25 transition"
          >
            {genesisLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>Diagnose Genesis Potential</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-300">Sea Surface Temp</span>
              <span className="font-mono text-cyan-400">{sst.toFixed(1)} °C</span>
            </div>
            <input
              type="range"
              min="24.0"
              max="32.0"
              step="0.1"
              value={sst}
              onChange={(e) => setSst(parseFloat(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-300">Vertical Wind Shear</span>
              <span className="font-mono text-amber-400">{vws.toFixed(1)} kts</span>
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
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-300">Mid-Tropospheric RH</span>
              <span className="font-mono text-sky-400">{rh.toFixed(0)} %</span>
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
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-300">850 hPa Vorticity</span>
              <span className="font-mono text-emerald-400">{vort.toFixed(1)} x10⁻⁵ s⁻¹</span>
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
          </div>
        </div>

        {genesisResult && (
          <div className="p-4 rounded-xl bg-slate-900/90 border border-cyan-500/30 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <span className="text-xs font-semibold text-slate-400 block">GENESIS STATUS</span>
              <span className="text-lg font-extrabold text-white">{genesisResult.classification}</span>
              <div className="text-2xl font-black font-mono text-cyan-400 mt-1">
                {genesisResult.genesis_probability_percent}% Probability
              </div>
            </div>

            <div className="text-xs space-y-1">
              <span className="font-semibold text-slate-400 block">FAVORABLE FACTORS</span>
              {genesisResult.dominant_favorable_factors.map((f, i) => (
                <div key={i} className="flex items-center space-x-1.5 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
            </div>

            <div className="text-xs space-y-1">
              <span className="font-semibold text-slate-400 block">INHIBITING FACTORS</span>
              {genesisResult.dominant_inhibiting_factors.map((f, i) => (
                <div key={i} className="flex items-center space-x-1.5 text-rose-400">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lab 2: Intensity Classification */}
      <div className="glass-card p-6 rounded-2xl space-y-5 border border-amber-500/20">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Lab 2: Advanced Dvorak Technique (ADT) Intensity Classifier</h2>
              <p className="text-xs text-slate-400">Model: VARTA-Intensity-ResNet-ADT (v2.1.0)</p>
            </div>
          </div>

          <button
            onClick={runIntensityAI}
            disabled={intensityLoading}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold shadow-lg shadow-amber-500/25 transition"
          >
            {intensityLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>Classify Intensity Stage</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-300">Observed Wind</span>
              <span className="font-mono text-cyan-400">{windKts} kts ({Math.round(windKts * 1.852)} km/h)</span>
            </div>
            <input
              type="range"
              min="20"
              max="150"
              step="1"
              value={windKts}
              onChange={(e) => setWindKts(parseFloat(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-300">Central Pressure</span>
              <span className="font-mono text-rose-400">{pressure} hPa</span>
            </div>
            <input
              type="range"
              min="900"
              max="1010"
              step="1"
              value={pressure}
              onChange={(e) => setPressure(parseFloat(e.target.value))}
              className="w-full accent-rose-500 cursor-pointer"
            />
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-300">Eye IR Temp</span>
              <span className="font-mono text-amber-400">{eyeTemp.toFixed(1)} °C</span>
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

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-300">Eyewall Cloud Top</span>
              <span className="font-mono text-purple-400">{cloudTemp.toFixed(1)} °C</span>
            </div>
            <input
              type="range"
              min="-90"
              max="-45"
              step="0.5"
              value={cloudTemp}
              onChange={(e) => setCloudTemp(parseFloat(e.target.value))}
              className="w-full accent-purple-500 cursor-pointer"
            />
          </div>
        </div>

        {intensityResult && (
          <div className="p-4 rounded-xl bg-slate-900/90 border border-amber-500/30 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-slate-400 block">OFFICIAL IMD CATEGORY</span>
              <div className="mt-1">
                <CycloneBadge category={intensityResult.category} className="text-sm px-3 py-1" />
              </div>
            </div>

            <div className="font-mono text-center">
              <span className="text-xs font-semibold text-slate-400 block">DVORAK INTENSITY</span>
              <span className="text-2xl font-black text-amber-400">T{intensityResult.dvorak_t_number.toFixed(1)}</span>
            </div>

            <div className="font-mono text-center">
              <span className="text-xs font-semibold text-slate-400 block">PRESSURE DEFICIT</span>
              <span className="text-2xl font-black text-rose-400">-{intensityResult.pressure_deficit_hpa} hPa</span>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-400 block">24H RAPID INTENSIFICATION</span>
              <span className="text-sm font-bold text-emerald-400">{intensityResult.intensity_trend_24h}</span>
            </div>
          </div>
        )}
      </div>

      {/* Lab 3: Multi-Hazard Surge & Coastal Risk */}
      <div className="glass-card p-6 rounded-2xl space-y-5 border border-rose-500/20">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Lab 3: Multi-Hazard Coastal Inundation & Vulnerability Engine</h2>
              <p className="text-xs text-slate-400">Model: VARTA-MultiHazard-RiskNet (v1.8.0)</p>
            </div>
          </div>

          <button
            onClick={runRiskAI}
            disabled={riskLoading}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-bold shadow-lg shadow-rose-500/25 transition"
          >
            {riskLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>Compute District Disaster Indices</span>
          </button>
        </div>

        {riskResult && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs text-slate-400 font-semibold block">COMPOSITE RISK INDEX</span>
                <span className="text-2xl font-black font-mono text-rose-400">
                  {riskResult.composite_risk_index.toFixed(1)} / 100
                </span>
              </div>

              <div>
                <span className="text-xs text-slate-400 font-semibold block">HIGHEST THREAT DISTRICT</span>
                <span className="text-sm font-bold text-white">{riskResult.highest_risk_district}</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] font-mono border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">District (State)</th>
                    <th className="py-2.5 px-3">Risk Score</th>
                    <th className="py-2.5 px-3">Storm Surge</th>
                    <th className="py-2.5 px-3">Local Wind</th>
                    <th className="py-2.5 px-3">Inundation Area</th>
                    <th className="py-2.5 px-3">Population Exposed</th>
                    <th className="py-2.5 px-3">Recommended Evac</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {riskResult.affected_districts.map((d, i) => (
                    <tr key={i} className="hover:bg-slate-800/30">
                      <td className="py-2.5 px-3 font-sans font-bold text-white">
                        {d.district_name} ({d.state_name})
                      </td>
                      <td className="py-2.5 px-3 font-bold text-rose-400">{d.overall_risk_score}</td>
                      <td className="py-2.5 px-3 text-sky-400">+{d.storm_surge_risk_meters} m</td>
                      <td className="py-2.5 px-3 text-amber-300">{d.wind_damage_hazard_kmh} km/h</td>
                      <td className="py-2.5 px-3">{d.inundation_area_sq_km} km²</td>
                      <td className="py-2.5 px-3">{d.population_affected.toLocaleString()}</td>
                      <td className="py-2.5 px-3 font-bold text-rose-300">{d.recommended_evacuation_count.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
