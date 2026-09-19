import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  change?: string;
  isPositive?: boolean;
  icon: LucideIcon;
  color?: 'cyan' | 'rose' | 'amber' | 'emerald';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  change,
  isPositive = true,
  icon: Icon,
  color = 'cyan',
}) => {
  const getColorStyles = () => {
    switch (color) {
      case 'rose':
        return {
          iconBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
          accent: 'from-rose-500/10 to-transparent',
        };
      case 'amber':
        return {
          iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          accent: 'from-amber-500/10 to-transparent',
        };
      case 'emerald':
        return {
          iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          accent: 'from-emerald-500/10 to-transparent',
        };
      default:
        return {
          iconBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
          accent: 'from-cyan-500/10 to-transparent',
        };
    }
  };

  const styles = getColorStyles();

  return (
    <div className="relative p-5 rounded-2xl glass-card overflow-hidden group">
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${styles.accent} rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none group-hover:scale-110 transition duration-500`} />

      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </span>
        <div className={`p-2.5 rounded-xl border ${styles.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="flex items-baseline space-x-2">
        <span className="text-2xl lg:text-3xl font-extrabold tracking-tight text-white font-mono">
          {value}
        </span>
        {unit && <span className="text-xs font-medium text-slate-400">{unit}</span>}
      </div>

      {change && (
        <div className="mt-3 flex items-center space-x-1.5 text-xs">
          <span className={isPositive ? 'text-emerald-400' : 'text-rose-400'}>
            {isPositive ? '↑' : '↓'} {change}
          </span>
          <span className="text-slate-400">vs 6h ago</span>
        </div>
      )}
    </div>
  );
};
