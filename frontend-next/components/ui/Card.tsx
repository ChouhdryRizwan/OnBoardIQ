import React from 'react';
import { cn } from '../../lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
}

export const Card: React.FC<CardProps> = ({ children, className, title, subtitle, ...props }) => {
  return (
    <div className={cn('bg-slate-900 border border-slate-800 rounded-xl shadow-xl p-6 text-slate-100', className)} {...props}>
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h3 className="text-lg font-semibold text-slate-100">{title}</h3>}
          {subtitle && <p className="text-sm text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
};
