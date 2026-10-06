import React from 'react';

export const LoadingState: React.FC<{ message?: string }> = ({ message = 'Loading system data...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 min-h-[300px]">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-4" />
      <p className="text-sm font-medium text-slate-600">{message}</p>
    </div>
  );
};
