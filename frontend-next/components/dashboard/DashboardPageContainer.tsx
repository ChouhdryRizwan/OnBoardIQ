import React from 'react';

export interface DashboardPageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const DashboardPageContainer: React.FC<DashboardPageContainerProps> = ({ children, className = '' }) => {
  return (
    <div className={`w-full min-w-0 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 ${className}`}>
      {children}
    </div>
  );
};
