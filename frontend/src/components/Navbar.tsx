import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Radio, AlertTriangle, ShieldCheck, Activity, Clock } from 'lucide-react';

interface NavbarProps {
  activeStormName?: string;
  alertLevel?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeStormName = 'Cyclone Dana',
  alertLevel = 'Red'
}) => {
  const location = useLocation();
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(`${now.toUTCString().slice(17, 25)} UTC | ${now.toLocaleTimeString('en-IN', { hour12: false })} IST`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getAlertColor = () => {
    switch (alertLevel) {
      case 'Red': return 'bg-rose-500/20 text-rose-300 border-rose-500/40 glow-red animate-pulse';
      case 'Orange': return 'bg-amber-500/20 text-amber-300 border-amber-500/40 glow-amber';
      case 'Yellow': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40';
      default: return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 glass-panel">
      <div className="flex h-16 items-center justify-between px-4 lg:px-8">
        {/* Left: Brand Identity */}
        <div className="flex items-center space-x-4">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-sky-500 to-indigo-600 shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition">
              <Radio className="w-5 h-5 text-white animate-pulse" />
              <div className="absolute inset-0 rounded-xl ring-2 ring-cyan-400/30 group-hover:ring-cyan-400/60" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent">
                  VARTA
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  SIH 2026
                </span>
              </div>
              <p className="text-[10px] tracking-tight text-slate-400 font-medium hidden sm:block">
                AI/ML Tropical Cyclone Diagnostic & Prediction System
              </p>
            </div>
          </Link>
        </div>

        {/* Center: Live Hazard Alert Bar */}
        <div className="hidden md:flex flex-col items-center justify-center space-y-1">
          <div className="flex items-center space-x-2">
            <span className="bg-amber-500 text-black text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
              Demo Mode — Historical Replay
            </span>
            <span className="text-[11px] text-slate-300 font-medium">
              Cyclone Dana • Bay of Bengal • October 2024
            </span>
          </div>
          <div className={`flex items-center space-x-2 px-3.5 py-1 rounded-full border text-[11px] font-semibold ${getAlertColor()}`}>
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>STAGE-IV {alertLevel.toUpperCase()} ALERT: {activeStormName} (Wind: 120 km/h)</span>
          </div>
        </div>

        {/* Right: Telemetry & System Clock */}
        <div className="flex items-center space-x-4">
          <div className="hidden xl:flex items-center space-x-2 text-xs text-slate-300 font-mono bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>{timeStr}</span>
          </div>

          <div className="flex items-center space-x-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-md text-xs font-medium">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            <span className="hidden sm:inline">AI Ensembles:</span>
            <span className="font-semibold">Online</span>
          </div>
        </div>
      </div>
    </header>
  );
};
