import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { AlertBulletin, CoastalZone, CycloneDetail } from '../types';
import { CAPAlertCard } from '../components/CAPAlertCard';
import { AlertOctagon, Plus, ShieldAlert, Send, CheckCircle2, Download } from 'lucide-react';

export const AlertCenterPage: React.FC = () => {
  const [alerts, setAlerts] = useState<AlertBulletin[]>([]);
  const [coastalZones, setCoastalZones] = useState<CoastalZone[]>([]);
  const [cyclones, setCyclones] = useState<CycloneDetail[]>([]);
  const [selectedCycloneId, setSelectedCycloneId] = useState<number>(1);
  const [selectedLevel, setSelectedLevel] = useState<string>('Red');
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [alertsRes, zonesRes, cyclonesRes] = await Promise.all([
        api.getActiveAlerts(),
        api.getCoastalZones(),
        api.getCyclones(),
      ]);
      setAlerts(alertsRes);
      setCoastalZones(zonesRes);
      setCyclones(cyclonesRes);
      if (cyclonesRes.length > 0) setSelectedCycloneId(cyclonesRes[0].id);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleGenerateBulletin = async () => {
    setIsGenerating(true);
    setStatusMessage(null);
    try {
      const newBulletin = await api.generateAlert(selectedCycloneId, selectedLevel);
      setAlerts([newBulletin, ...alerts]);
      setStatusMessage(`Successfully generated and disseminated CAP Bulletin #${newBulletin.bulletin_number}!`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center space-x-2">
          <AlertOctagon className="w-6 h-6 text-rose-500" />
          <span>CAP Early Warning & Alert Dissemination Center</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Automated Common Alerting Protocol (CAP v1.2) emergency bulletin generator and coastal zone disaster mitigation directives.
        </p>
      </div>

      {/* Bulletin Generator Action Card */}
      <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <Send className="w-4 h-4 text-cyan-400" />
            <span>Generate Official Disaster Management Bulletin</span>
          </h2>
          <span className="text-xs text-slate-400">IMD & NDMA Multi-Agency Broadcast Standard</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-slate-400 font-medium mb-1.5">Target Tropical Cyclone</label>
            <select
              value={selectedCycloneId}
              onChange={(e) => setSelectedCycloneId(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 text-white text-xs font-semibold p-2.5 rounded-xl focus:border-cyan-500 focus:outline-none"
            >
              {cyclones.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.basin})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-400 font-medium mb-1.5">Alert Color Level</label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-white text-xs font-semibold p-2.5 rounded-xl focus:border-cyan-500 focus:outline-none"
            >
              <option value="Red">Red (Warning - Landfall within 12h / Mandatory Evacuation)</option>
              <option value="Orange">Orange (Alert - Expected within 24h / Standby)</option>
              <option value="Yellow">Yellow (Watch - Expected within 48h / Fishermen Recall)</option>
              <option value="Green">Green (Information - Routine Monitoring)</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleGenerateBulletin}
              disabled={isGenerating}
              className="w-full flex items-center justify-center space-x-2 p-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-bold shadow-lg shadow-rose-500/25 transition disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{isGenerating ? 'Synthesizing...' : 'Disseminate CAP Bulletin'}</span>
            </button>
          </div>
        </div>

        {statusMessage && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}
      </div>

      {/* Active Bulletins Feed */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white flex items-center space-x-2">
          <ShieldAlert className="w-5 h-5 text-amber-400" />
          <span>Active Official Bulletins ({alerts.length})</span>
        </h2>

        <div className="space-y-4">
          {alerts.map((b) => (
            <CAPAlertCard key={b.id} bulletin={b} />
          ))}
        </div>
      </div>

      {/* Coastal District Risk and Shelter Matrix */}
      <div className="glass-card p-5 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Coastal Maritime District Preparedness & Evacuation Matrix
          </h3>
          <span className="text-xs text-slate-400">Total Vulnerable Zones: {coastalZones.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] font-mono border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">State / District</th>
                <th className="py-2.5 px-3">Coordinates</th>
                <th className="py-2.5 px-3">Population at Risk</th>
                <th className="py-2.5 px-3">Shelters (Capacity)</th>
                <th className="py-2.5 px-3">Vulnerability</th>
                <th className="py-2.5 px-3">Alert Stage</th>
                <th className="py-2.5 px-3">Evacuation Directive</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {coastalZones.map((z) => {
                const isRed = z.current_alert_level === 'Red';
                return (
                  <tr key={z.id} className="hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 font-sans font-bold text-white">
                      {z.district_name}, {z.state_name}
                    </td>
                    <td className="py-2.5 px-3 text-cyan-300">
                      {z.latitude.toFixed(2)}°N, {z.longitude.toFixed(2)}°E
                    </td>
                    <td className="py-2.5 px-3">{z.population_at_risk.toLocaleString()}</td>
                    <td className="py-2.5 px-3">
                      {z.shelter_count} ({z.shelter_capacity.toLocaleString()})
                    </td>
                    <td className="py-2.5 px-3 font-bold text-amber-300">
                      {(z.vulnerability_index * 100).toFixed(0)}%
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isRed
                            ? 'bg-rose-500/20 text-rose-300'
                            : z.current_alert_level === 'Orange'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-yellow-500/20 text-yellow-300'
                        }`}
                      >
                        {z.current_alert_level.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-sans font-semibold text-rose-300">
                      {z.evacuation_status}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
