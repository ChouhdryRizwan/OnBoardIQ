'use client';

import React from 'react';
import { Breadcrumbs } from '../Breadcrumbs';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';

export interface AdminDashboardHeaderProps {
  onRefresh: () => void;
  isRefreshing: boolean;
  lastRefreshedAt: string | null;
}

export const AdminDashboardHeader: React.FC<AdminDashboardHeaderProps> = ({
  onRefresh,
  isRefreshing,
  lastRefreshedAt,
}) => {
  return (
    <div className="border-b border-slate-800 pb-6 mb-6">
      <div className="mb-3">
        <Breadcrumbs items={[{ label: 'App', href: '/' }, { label: 'Admin', href: '/admin/dashboard' }, { label: 'Dashboard' }]} />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Administrator Dashboard</h1>
            <Badge variant="indigo" className="uppercase text-[10px] tracking-wider">
              Administrator
            </Badge>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Monitor onboarding, validation, learning, policy changes and platform activity from one place.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {lastRefreshedAt && (
            <span className="text-[11px] text-slate-400 hidden md:inline">
              Refreshed: <strong className="text-slate-400 font-mono">{lastRefreshedAt}</strong>
            </span>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            isLoading={isRefreshing}
            className="border-slate-700 text-slate-200 hover:bg-slate-800 text-xs"
          >
            🔄 {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
          </Button>
        </div>
      </div>
    </div>
  );
};
