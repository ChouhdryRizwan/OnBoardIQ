import React from 'react';
import { Button } from '../ui/Button';

export interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = 'An error occurred',
  message,
  onRetry,
}) => {
  return (
    <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-800">
      <svg className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <div className="flex-1">
        <h4 className="text-sm font-semibold mb-0.5">{title}</h4>
        <p className="text-xs text-rose-700">{message}</p>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry} className="mt-3 border-rose-300 text-rose-800 hover:bg-rose-100">
            Try Again
          </Button>
        )}
      </div>
    </div>
  );
};
