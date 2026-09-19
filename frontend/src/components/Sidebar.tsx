import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  MapPin,
  Flame,
  AlertOctagon,
  History,
  BarChart3,
  Sliders,
  FileText,
  Home,
  Settings
} from 'lucide-react';

const navigationItems = [
  { name: 'Overview / Home', path: '/', icon: Home },
  { name: 'Live Operations', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Interactive GIS Map', path: '/map', icon: MapPin },
  { name: 'Genesis & Intensity AI', path: '/ai-lab', icon: Flame },
  { name: 'Alert Dissemination', path: '/alerts', icon: AlertOctagon },
  { name: 'Historical Explorer', path: '/history', icon: History },
  { name: 'Comparative Analytics', path: '/analytics', icon: BarChart3 },
  { name: 'Model & Data Admin', path: '/admin', icon: Sliders },
  { name: 'Documentation', path: '/docs', icon: FileText },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 border-r border-slate-800/80 glass-panel flex flex-col justify-between hidden md:flex min-h-[calc(100vh-4rem)]">
      <div className="py-5 px-3 space-y-1">
        <div className="px-3 pb-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Diagnostic Navigation
        </div>
        {navigationItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`
            }
          >
            <item.icon className="w-4 h-4 flex-shrink-0" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </div>

      <div className="p-4 border-t border-slate-800/80 space-y-3">
        <button
          onClick={() => {
            localStorage.removeItem('varta_token');
            window.location.href = '/login';
          }}
          className="flex items-center space-x-3 text-sm font-medium px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 transition w-full text-left"
        >
          <Settings className="w-4 h-4" />
          <span>Logout</span>
        </button>

        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-1.5">
          <div className="flex items-center justify-between font-semibold text-slate-300">
            <span>IMD / WMO Link</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <p className="text-[11px] leading-relaxed">
            Connected to North Indian Ocean RSMC & IBTrACS Gateway.
          </p>
        </div>
      </div>
    </aside>
  );
};
