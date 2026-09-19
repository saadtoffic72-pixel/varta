import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { TrackPoint, ForecastPoint } from '../types';

interface WindPressureChartProps {
  trackPoints?: TrackPoint[];
  forecastPoints?: ForecastPoint[];
  height?: number;
}

export const WindPressureChart: React.FC<WindPressureChartProps> = ({
  trackPoints = [],
  forecastPoints = [],
  height = 280,
}) => {
  // Merge track and forecast data chronologically
  const chartData = [
    ...trackPoints.map((tp, idx) => ({
      name: `Obs -${(trackPoints.length - 1 - idx) * 12}h`,
      wind_kmh: Math.round(tp.wind_speed_knots * 1.852),
      pressure: tp.central_pressure_hpa,
      type: 'Observed',
      category: tp.intensity_category,
    })),
    ...forecastPoints.map((fp) => ({
      name: `+${fp.forecast_time_hours}h`,
      wind_kmh: Math.round(fp.wind_speed_knots * 1.852),
      pressure: fp.central_pressure_hpa,
      type: 'Forecast',
      category: fp.intensity_category,
    })),
  ];

  return (
    <div className="w-full h-full glass-card p-4 rounded-2xl">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Wind Velocity (km/h) vs Central Pressure (hPa) Trajectory
        </h4>
        <div className="flex items-center space-x-3 text-xs">
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <span className="text-slate-300">Max Wind (km/h)</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
            <span className="text-slate-300">Central Pressure (hPa)</span>
          </span>
        </div>
      </div>

      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="windGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
            <YAxis
              yAxisId="left"
              stroke="#06b6d4"
              fontSize={11}
              domain={[20, 260]}
              label={{ value: 'km/h', angle: -90, position: 'insideLeft', fill: '#06b6d4', fontSize: 10 }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#f43f5e"
              fontSize={11}
              domain={[900, 1015]}
              label={{ value: 'hPa', angle: 90, position: 'insideRight', fill: '#f43f5e', fontSize: 10 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#f8fafc',
              }}
            />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="wind_kmh"
              name="Wind Speed"
              stroke="#06b6d4"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#windGradient)"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="pressure"
              name="Central Pressure"
              stroke="#f43f5e"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#f43f5e' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
