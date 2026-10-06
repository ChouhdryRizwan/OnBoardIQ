'use client';

import React from 'react';
import { Breadcrumbs } from '../Breadcrumbs';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';

export interface ManagerDashboardHeaderProps {
  onRefresh: () => void;
  loading?: boolean;
  isRefreshing?: boolean;
  lastRefreshedAt?: string | null;
  lastRefreshed?: Date;
  selectedDept?: string;
  onDeptChange?: (dept: string) => void;
  departments?: string[];
}

export const ManagerDashboardHeader: React.FC<ManagerDashboardHeaderProps> = ({
  onRefresh,
  loading,
  isRefreshing,
  lastRefreshedAt,
  lastRefreshed,
  selectedDept,
  onDeptChange,
  departments = [],
}) => {
  const refreshing = isRefreshing || loading || false;
  const timeStr = lastRefreshedAt || (lastRefreshed ? lastRefreshed.toLocaleTimeString() : null);

  return (
    <div className="border-b border-slate-800 pb-6 mb-6">
      <div className="mb-3">
        <Breadcrumbs items={[{ label: 'App', href: '/' }, { label: 'Manager', href: '/manager/dashboard' }, { label: 'Dashboard' }]} />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Manager Dashboard</h1>
            <Badge variant="blue" className="uppercase text-[10px] tracking-wider">
              Manager Role
            </Badge>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Monitor your team&apos;s onboarding, training progress, assessments and mandatory requirements.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {departments.length > 0 && onDeptChange && (
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-400 font-medium">Department Scope:</span>
              <select
                value={selectedDept || ''}
                onChange={(e) => onDeptChange(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500"
              >
                <option value="">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          )}

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
