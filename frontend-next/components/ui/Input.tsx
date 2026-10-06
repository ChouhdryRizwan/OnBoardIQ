import React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, type = 'text', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>}
        <input
          type={type}
          className={cn(
            'w-full px-3.5 py-2 border rounded-lg text-sm bg-slate-950 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors',
            error ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-800',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-rose-400">{error}</p>}
        {helperText && !error && <p className="mt-1 text-xs text-slate-400">{helperText}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
