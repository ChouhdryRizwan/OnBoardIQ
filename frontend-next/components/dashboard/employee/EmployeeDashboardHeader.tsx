'use client';

import React from 'react';
import { Breadcrumbs } from '../Breadcrumbs';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { getStoredUser } from '../../../lib/auth';

export interface EmployeeDashboardHeaderProps {
  onRefresh: () => void;
  loading?: boolean;
  isRefreshing?: boolean;
  lastRefreshedAt?: string | null;
  lastRefreshed?: Date;
  employeeName?: string;
  roleTitle?: string;
  department?: string;
}

export const EmployeeDashboardHeader: React.FC<EmployeeDashboardHeaderProps> = ({
  onRefresh,
  loading,
  isRefreshing,
  lastRefreshedAt,
  lastRefreshed,
  employeeName,
  roleTitle,
  department,
}) => {
  const storedUser = getStoredUser();
  const displayName = employeeName || storedUser?.full_name || storedUser?.name || 'Team Member';
  const displayRole = roleTitle || storedUser?.role || 'Employee';
  const displayDept = department || storedUser?.department || 'General';

  const refreshing = isRefreshing || loading || false;
  const timeStr = lastRefreshedAt || (lastRefreshed ? lastRefreshed.toLocaleTimeString() : null);

  return (
    <div className="border-b border-slate-800 pb-6 mb-6">
      <div className="mb-3">
        <Breadcrumbs items={[{ label: 'App', href: '/' }, { label: 'Employee', href: '/employee/dashboard' }, { label: 'Dashboard' }]} />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 min-w-0">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {displayName}
            </h1>
            <Badge variant="emerald" className="uppercase text-[10px] tracking-wider shrink-0">
              {displayRole}
            </Badge>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Continue your onboarding, track module milestones, and complete mandatory requirements for {displayDept}.
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
