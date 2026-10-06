import React from 'react';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';

export interface MetricItem {
  label: string;
  value: string | number;
}

export interface MetricCardProps {
  title: string;
  subtitle?: string;
  badge?: string;
  badgeVariant?: 'indigo' | 'emerald' | 'amber' | 'blue' | 'neutral';
  metrics: MetricItem[];
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  subtitle,
  badge,
  badgeVariant = 'indigo',
  metrics,
}) => {
  return (
    <Card className="bg-slate-900 border-slate-800 p-5 shadow-lg">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div>
          <h3 className="text-sm font-bold text-white">{title}</h3>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
        {badge && <Badge variant={badgeVariant} className="text-[10px]">{badge}</Badge>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {metrics.map((m) => (
          <div key={m.label} className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
            <span className="text-[11px] text-slate-400 block line-clamp-1">{m.label}</span>
            <span className="text-base font-extrabold text-white font-mono mt-0.5 block">{m.value}</span>
          </div>
        ))}
      </div>
    </Card>
  );
};
