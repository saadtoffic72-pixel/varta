import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { AnalyticsOverview } from '../types';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { BarChart3, TrendingUp, Compass, Award, ShieldCheck, Activity } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAnalyticsOverview()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="p-8 text-center text-slate-400">
        Loading historical meteorological insights...
      </div>
    );
  }

  const trackErrorData = Object.entries(data.model_performance_benchmarks.track_forecast_error_nm).map(
    ([hour, errorNm]) => ({
      leadTime: hour,
      errorNm,
      errorKm: Math.round(errorNm * 1.852),
    })
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center space-x-2">
          <BarChart3 className="w-6 h-6 text-cyan-400" />
          <span>Comparative Analytics & Climatological Insights</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Decadal storm intensification trends, basin climatology, and AI model verification against RSMC New Delhi benchmarks.
        </p>
      </div>

      {/* High-Level Insight Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl glass-card space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase">Monitored Archive</span>
          <div className="text-2xl font-black font-mono text-cyan-400">{data.total_monitored_cyclones} storms</div>
          <p className="text-[11px] text-slate-400">1891 – 2026 North Indian Ocean</p>
        </div>

        <div className="p-4 rounded-2xl glass-card space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase">Super Cyclones</span>
          <div className="text-2xl font-black font-mono text-rose-400">17 recorded</div>
          <p className="text-[11px] text-slate-400">Bay of Bengal & Arabian Sea</p>
        </div>

        <div className="p-4 rounded-2xl glass-card space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase">Detection Reliability</span>
          <div className="text-2xl font-black font-mono text-emerald-400">
            {(data.model_performance_benchmarks.probability_of_detection * 100).toFixed(0)}% POD
          </div>
          <p className="text-[11px] text-slate-400">False Alarm Ratio: {(data.model_performance_benchmarks.false_alarm_ratio * 100).toFixed(0)}%</p>
        </div>

        <div className="p-4 rounded-2xl glass-card space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase">Intensity RMSE</span>
          <div className="text-2xl font-black font-mono text-amber-400">
            {data.model_performance_benchmarks.intensity_rmse_knots} kts
          </div>
          <p className="text-[11px] text-slate-400">Across 24h forecast verification</p>
        </div>
      </div>

      {/* Charts Row: Decadal Trends & Model Track Error */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Decadal Intensification */}
        <div className="glass-card p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-rose-400" />
              <span>Decadal Cyclone Frequency & Severe Storm Ratio</span>
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Demonstrates rising frequency of Very Severe Cyclones in North Indian Ocean over recent decades.
          </p>

          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <BarChart data={data.decadal_trends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="decade" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#f8fafc',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="total_count" name="Total Cyclones" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                <Bar dataKey="severe_count" name="Severe Storms (≥VSCS)" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Track Error vs Lead Time */}
        <div className="glass-card p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Model Track Forecast Error (MAE in Nautical Miles)</span>
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            VARTA Ensemble Spatiotemporal Transformer MAE calibrated on 12h to 120h lead times.
          </p>

          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <LineChart data={trackErrorData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="leadTime" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#f8fafc',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line
                  type="monotone"
                  dataKey="errorNm"
                  name="Error (Nautical Miles)"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#f59e0b' }}
                />
                <Line
                  type="monotone"
                  dataKey="errorKm"
                  name="Error (km)"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#06b6d4' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Notable Historical Cyclones Table */}
      <div className="glass-card p-5 rounded-2xl space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Notable North Indian Ocean Catastrophic Events (Validation Benchmarks)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] font-mono border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Cyclone Name</th>
                <th className="py-2.5 px-3">Year</th>
                <th className="py-2.5 px-3">Basin</th>
                <th className="py-2.5 px-3">Peak Category</th>
                <th className="py-2.5 px-3">Max Wind</th>
                <th className="py-2.5 px-3">Min Pressure</th>
                <th className="py-2.5 px-3">Estimated Damage</th>
                <th className="py-2.5 px-3">Casualties</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {data.notable_cyclones.map((c, i) => (
                <tr key={i} className="hover:bg-slate-800/30">
                  <td className="py-2.5 px-3 font-sans font-bold text-white">{c.name}</td>
                  <td className="py-2.5 px-3">{c.year}</td>
                  <td className="py-2.5 px-3 font-sans text-slate-300">{c.basin}</td>
                  <td className="py-2.5 px-3 font-sans text-cyan-300 font-semibold">{c.peak_category}</td>
                  <td className="py-2.5 px-3 text-amber-300 font-bold">{c.max_wind_kmh} km/h</td>
                  <td className="py-2.5 px-3 text-rose-300">{c.min_pressure_hpa} hPa</td>
                  <td className="py-2.5 px-3">${c.damage_usd_millions ? `${c.damage_usd_millions}M` : 'N/A'}</td>
                  <td className="py-2.5 px-3 text-rose-400 font-bold">{c.fatalities || 'Minimal'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
