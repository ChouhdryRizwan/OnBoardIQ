import React from 'react';
import { Card } from '../../ui/Card';

export interface ProgressCardProps {
  title: string;
  subtitle?: string;
  percentage: number;
  label?: string;
  color?: 'emerald' | 'indigo' | 'sky' | 'amber';
}

export const ProgressCard: React.FC<ProgressCardProps> = ({
  title,
  subtitle,
  percentage,
  label,
  color = 'indigo',
}) => {
  const barGradients = {
    indigo: 'from-indigo-600 to-sky-400',
    emerald: 'from-emerald-600 to-teal-400',
    sky: 'from-sky-600 to-indigo-400',
    amber: 'from-amber-600 to-yellow-400',
  };

  const clampedPct = Math.min(100, Math.max(0, percentage));

  return (
    <Card className="bg-slate-900 border-slate-800 p-5 shadow-lg">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-bold text-white">{title}</h3>
        <span className="text-sm font-extrabold text-white font-mono">{clampedPct}%</span>
      </div>

      {subtitle && <p className="text-xs text-slate-400 mb-3">{subtitle}</p>}

      <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800 my-2">
        <div
          className={`h-full bg-gradient-to-r ${barGradients[color]} transition-all duration-500 rounded-full`}
          style={{ width: `${clampedPct}%` }}
        />
      </div>

      {label && <p className="text-[11px] text-slate-400 mt-2 font-medium">{label}</p>}
    </Card>
  );
};
