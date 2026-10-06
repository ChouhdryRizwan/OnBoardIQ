'use client';

import React from 'react';
import { Breadcrumbs } from '../Breadcrumbs';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';

export interface TrainingDashboardHeaderProps {
  onRefresh: () => void;
  isRefreshing?: boolean;
  loading?: boolean;
  lastRefreshedAt?: string | null;
  lastRefreshed?: Date;
}

export const TrainingDashboardHeader: React.FC<TrainingDashboardHeaderProps> = ({
  onRefresh,
  isRefreshing,
  loading,
  lastRefreshedAt,
  lastRefreshed,
}) => {
  const refreshing = isRefreshing || loading || false;
  const timeStr = lastRefreshedAt || (lastRefreshed ? lastRefreshed.toLocaleTimeString() : null);

  return (
    <div className="border-b border-slate-800 pb-6 mb-6">
      <div className="mb-3">
        <Breadcrumbs items={[{ label: 'App', href: '/' }, { label: 'Training', href: '/training/dashboard' }, { label: 'Dashboard' }]} />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Training Manager Dashboard</h1>
            <Badge variant="indigo" className="uppercase text-[10px] tracking-wider">
              Training Manager
            </Badge>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Manage employee onboarding, training progress, assessments and training requirements.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {timeStr && (
            <span className="text-[11px] text-slate-400 hidden md:inline">
              Refreshed: <strong className="text-slate-400 font-mono">{timeStr}</strong>
            </span>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            isLoading={refreshing}
            className="border-slate-700 text-slate-200 hover:bg-slate-800 text-xs"
          >
            🔄 {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </Button>
        </div>
      </div>
    </div>
  );
};
