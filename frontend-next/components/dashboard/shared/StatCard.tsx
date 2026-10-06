import React from 'react';
import { Card } from '../../ui/Card';

export interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  subtitle?: string;
  icon?: string;
  accentColor?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  subtitle,
  icon,
  accentColor = 'indigo',
}) => {
  const accentBorders = {
    indigo: 'border-l-indigo-500',
    emerald: 'border-l-emerald-500',
    amber: 'border-l-amber-500',
    rose: 'border-l-rose-500',
    sky: 'border-l-sky-500',
  };

  const changeColors = {
    positive: 'text-emerald-400',
    negative: 'text-rose-400',
    neutral: 'text-slate-400',
  };

  return (
    <Card className={`bg-slate-900 border-slate-800 border-l-4 ${accentBorders[accentColor]} p-5 shadow-lg`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</span>
        {icon && <span className="text-lg">{icon}</span>}
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{value}</span>
        {change && <span className={`text-xs font-bold ${changeColors[changeType]}`}>{change}</span>}
      </div>

      {subtitle && <p className="text-xs text-slate-400 mt-2 line-clamp-1">{subtitle}</p>}
    </Card>
  );
};
