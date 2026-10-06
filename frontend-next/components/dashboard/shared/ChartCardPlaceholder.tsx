import React from 'react';
import { Card } from '../../ui/Card';

export interface ChartCardPlaceholderProps {
  title: string;
  subtitle?: string;
  height?: string;
}

export const ChartCardPlaceholder: React.FC<ChartCardPlaceholderProps> = ({
  title,
  subtitle,
  height = 'h-48',
}) => {
  return (
    <Card className="bg-slate-900 border-slate-800 p-5 shadow-lg">
      <div className="border-b border-slate-800 pb-3 mb-4">
        <h3 className="text-sm font-bold text-white">{title}</h3>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>

      <div className={`${height} bg-slate-950/80 rounded-lg border border-slate-800 flex flex-col justify-end p-4 relative overflow-hidden`}>
        {/* Visual Bar Chart Mockup Graphics */}
        <div className="flex items-end justify-between gap-2 h-full pt-4">
          <div className="bg-indigo-600/40 border-t border-indigo-400 w-full rounded-t" style={{ height: '40%' }} />
          <div className="bg-indigo-600/60 border-t border-indigo-400 w-full rounded-t" style={{ height: '65%' }} />
          <div className="bg-indigo-600/50 border-t border-indigo-400 w-full rounded-t" style={{ height: '50%' }} />
          <div className="bg-emerald-600/70 border-t border-emerald-400 w-full rounded-t" style={{ height: '85%' }} />
          <div className="bg-indigo-600/60 border-t border-indigo-400 w-full rounded-t" style={{ height: '60%' }} />
          <div className="bg-emerald-600/90 border-t border-emerald-400 w-full rounded-t" style={{ height: '95%' }} />
          <div className="bg-indigo-600/70 border-t border-indigo-400 w-full rounded-t" style={{ height: '75%' }} />
        </div>
        <div className="text-[10px] text-slate-400 text-center mt-2 border-t border-slate-800/80 pt-1">
          Deterministic Data Visualization Region
        </div>
      </div>
    </Card>
  );
};
