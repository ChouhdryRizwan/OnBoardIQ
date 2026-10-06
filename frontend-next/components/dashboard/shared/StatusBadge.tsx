import React from 'react';

export interface StatusBadgeProps {
  status: 'verified' | 'pending' | 'in_progress' | 'failed' | 'completed' | string;
  label?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label }) => {
  const configs: Record<string, { bg: string; text: string; dot: string; defaultLabel: string }> = {
    verified: { bg: 'bg-emerald-950/80 border-emerald-800', text: 'text-emerald-300', dot: 'bg-emerald-400', defaultLabel: 'Verified' },
    completed: { bg: 'bg-emerald-950/80 border-emerald-800', text: 'text-emerald-300', dot: 'bg-emerald-400', defaultLabel: 'Completed' },
    pending: { bg: 'bg-amber-950/80 border-amber-800', text: 'text-amber-300', dot: 'bg-amber-400', defaultLabel: 'Pending Review' },
    in_progress: { bg: 'bg-indigo-950/80 border-indigo-800', text: 'text-indigo-300', dot: 'bg-indigo-400', defaultLabel: 'In Progress' },
    failed: { bg: 'bg-rose-950/80 border-rose-800', text: 'text-rose-300', dot: 'bg-rose-400', defaultLabel: 'Action Required' },
  };

  const key = status.toLowerCase();
  const config = configs[key] || {
    bg: 'bg-slate-900 border-slate-700',
    text: 'text-slate-300',
    dot: 'bg-slate-400',
    defaultLabel: status,
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-semibold ${config.bg} ${config.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {label || config.defaultLabel}
    </span>
  );
};
