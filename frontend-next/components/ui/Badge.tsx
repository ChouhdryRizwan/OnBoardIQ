import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'indigo' | 'blue' | 'emerald' | 'amber';
}

export const Badge: React.FC<BadgeProps> = ({ children, className, variant = 'info', ...props }) => {
  const variants = {
    success: 'bg-emerald-950/80 text-emerald-300 border-emerald-800',
    emerald: 'bg-emerald-950/80 text-emerald-300 border-emerald-800',
    warning: 'bg-amber-950/80 text-amber-300 border-amber-800',
    amber: 'bg-amber-950/80 text-amber-300 border-amber-800',
    error: 'bg-rose-950/80 text-rose-300 border-rose-800',
    info: 'bg-sky-950/80 text-sky-300 border-sky-800',
    indigo: 'bg-indigo-950/80 text-indigo-300 border-indigo-800',
    blue: 'bg-blue-950/80 text-blue-300 border-blue-800',
    neutral: 'bg-slate-800 text-slate-300 border-slate-700',
  };

  return (
    <span
      className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border', variants[variant], className)}
      {...props}
    >
      {children}
    </span>
  );
};
