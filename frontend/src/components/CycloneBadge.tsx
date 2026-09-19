import React from 'react';

interface CycloneBadgeProps {
  category: string;
  className?: string;
}

export const CycloneBadge: React.FC<CycloneBadgeProps> = ({ category, className = '' }) => {
  const getBadgeStyle = () => {
    switch (category) {
      case 'Super Cyclonic Storm':
        return 'bg-purple-950/70 text-purple-200 border-purple-500/50 shadow-sm shadow-purple-500/20';
      case 'Extremely Severe Cyclonic Storm':
        return 'bg-rose-950/70 text-rose-200 border-rose-500/50 shadow-sm shadow-rose-500/20';
      case 'Very Severe Cyclonic Storm':
        return 'bg-orange-950/70 text-orange-200 border-orange-500/50 shadow-sm shadow-orange-500/20';
      case 'Severe Cyclonic Storm':
        return 'bg-amber-950/70 text-amber-200 border-amber-500/50 shadow-sm shadow-amber-500/20';
      case 'Cyclonic Storm':
        return 'bg-yellow-950/70 text-yellow-200 border-yellow-500/50';
      case 'Deep Depression':
        return 'bg-blue-950/70 text-blue-200 border-blue-500/50';
      case 'Depression':
      default:
        return 'bg-cyan-950/70 text-cyan-200 border-cyan-500/50';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${getBadgeStyle()} ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse" />
      {category}
    </span>
  );
};
