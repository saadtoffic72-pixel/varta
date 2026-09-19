import React from 'react';
import { AlertBulletin } from '../types';
import { AlertOctagon, ShieldAlert, Waves, Wind, MapPin, Download, CheckCircle2 } from 'lucide-react';

interface CAPAlertCardProps {
  bulletin: AlertBulletin;
}

export const CAPAlertCard: React.FC<CAPAlertCardProps> = ({ bulletin }) => {
  const getAlertHeaderStyle = () => {
    switch (bulletin.alert_level) {
      case 'Red':
        return 'bg-gradient-to-r from-rose-900/60 to-red-950/80 border-rose-500/40 text-rose-200';
      case 'Orange':
        return 'bg-gradient-to-r from-amber-900/60 to-orange-950/80 border-amber-500/40 text-amber-200';
      case 'Yellow':
        return 'bg-gradient-to-r from-yellow-900/60 to-amber-950/80 border-yellow-500/40 text-yellow-200';
      default:
        return 'bg-gradient-to-r from-emerald-900/60 to-teal-950/80 border-emerald-500/40 text-emerald-200';
    }
  };

  const downloadBulletin = () => {
    const textContent = `
============================================================
INDIA METEOROLOGICAL DEPARTMENT / NDMA CYCLONE BULLETIN
CAP IDENTIFIER: ${bulletin.cap_identifier}
============================================================
BULLETIN NUMBER: ${bulletin.bulletin_number}
ISSUED AT: ${new Date(bulletin.issue_time).toUTCString()}
HAZARD STAGE: ${bulletin.alert_level.toUpperCase()} ALERT
AFFECTED STATES: ${bulletin.affected_states}
AFFECTED DISTRICTS: ${bulletin.affected_districts}
EXPECTED LANDFALL: ${bulletin.expected_landfall_location || 'Under Continuous Surveillance'}
PROJECTED WIND VELOCITY: ${bulletin.expected_wind_speed_kmh} km/h
STORM SURGE HEIGHT: ${bulletin.surge_height_meters} meters above astronomical tide

SAFETY RECOMMENDATIONS & DIRECTIVES:
${bulletin.safety_recommendations}
============================================================
AUTHENTICATED BY VARTA CAP DISSEMINATION ENGINE
    `.trim();

    const element = document.createElement('a');
    const file = new Blob([textContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${bulletin.cap_identifier}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden border border-slate-800 transition">
      {/* Bulletin Banner Header */}
      <div className={`p-4 border-b flex flex-wrap items-center justify-between gap-3 ${getAlertHeaderStyle()}`}>
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-black/30 backdrop-blur-sm">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-sm uppercase tracking-wider">
                STAGE-IV {bulletin.alert_level.toUpperCase()} WARNING
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-black/40 font-mono">
                BULLETIN #{bulletin.bulletin_number}
              </span>
            </div>
            <p className="text-xs opacity-80 font-mono">CAP ID: {bulletin.cap_identifier}</p>
          </div>
        </div>

        <button
          onClick={downloadBulletin}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-black/40 hover:bg-black/60 border border-white/10 text-xs font-medium transition"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CAP Bulletin</span>
        </button>
      </div>

      {/* Bulletin Details Grid */}
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center space-x-1.5 text-xs text-slate-400 mb-1">
              <Wind className="w-3.5 h-3.5 text-cyan-400" />
              <span>Expected Wind</span>
            </div>
            <div className="text-lg font-extrabold text-white font-mono">
              {bulletin.expected_wind_speed_kmh} <span className="text-xs font-normal text-slate-400">km/h</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center space-x-1.5 text-xs text-slate-400 mb-1">
              <Waves className="w-3.5 h-3.5 text-sky-400" />
              <span>Storm Surge</span>
            </div>
            <div className="text-lg font-extrabold text-white font-mono">
              +{bulletin.surge_height_meters} <span className="text-xs font-normal text-slate-400">meters</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center space-x-1.5 text-xs text-slate-400 mb-1">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              <span>Projected Landfall</span>
            </div>
            <div className="text-xs font-semibold text-slate-200 truncate">
              {bulletin.expected_landfall_location || 'Offshore'}
            </div>
          </div>
        </div>

        {/* Affected Geographies */}
        <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 text-xs space-y-1">
          <div className="text-slate-400 font-semibold">Target Maritime States & Coastal Districts:</div>
          <div className="text-slate-200 font-medium">{bulletin.affected_districts} ({bulletin.affected_states})</div>
        </div>

        {/* Actionable Directives */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>Official Mitigation & Civil Defense Protocols:</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-line">
            {bulletin.safety_recommendations}
          </div>
        </div>
      </div>
    </div>
  );
};
