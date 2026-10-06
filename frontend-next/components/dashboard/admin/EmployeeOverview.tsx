import React from 'react';
import Link from 'next/link';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { AdminDashboardData } from '../../../lib/services/adminDashboard';

export interface EmployeeOverviewProps {
  data: AdminDashboardData;
  isLoading: boolean;
}

export const EmployeeOverview: React.FC<EmployeeOverviewProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <Card className="bg-slate-900 border-slate-800 p-6 animate-pulse">
        <div className="h-4 bg-slate-800 rounded w-1/3 mb-4" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-12 bg-slate-800 rounded" />
          <div className="h-12 bg-slate-800 rounded" />
        </div>
      </Card>
    );
  }

  if (data.errors.employees) {
    return (
      <Card className="bg-slate-900 border-slate-800 p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white">Employee Overview</h3>
          <span className="text-xs text-rose-400 font-semibold">API Error</span>
        </div>
        <p className="text-xs text-slate-400 mt-2">{data.errors.employees}</p>
      </Card>
    );
  }

  const employees = data.employees || [];
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter((e) => e.is_active !== false).length;
  const onboardingCount = employees.filter((e) => e.training_status === 'on_track' || e.training_status === 'in_progress').length;
  const completedCount = employees.filter((e) => e.training_status === 'completed').length;
  const attentionCount = employees.filter((e) => e.training_status === 'behind_schedule' || e.training_status === 'requires_attention').length;

  return (
    <Card className="bg-slate-900 border-slate-800 p-6 shadow-lg flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-white">Employee Overview</h3>
            <p className="text-xs text-slate-400 mt-0.5">Directory & onboarding status breakdown</p>
          </div>
          <span className="text-xs font-mono font-bold text-indigo-400 bg-slate-950 px-2 py-1 rounded border border-slate-800">
            {totalEmployees} Users
          </span>
        </div>

        {totalEmployees > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
              <span className="text-[11px] text-slate-400 block">Active Accounts</span>
              <span className="text-xl font-extrabold text-white font-mono">{activeEmployees}</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
              <span className="text-[11px] text-slate-400 block">Currently Onboarding</span>
              <span className="text-xl font-extrabold text-indigo-400 font-mono">{onboardingCount}</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
              <span className="text-[11px] text-slate-400 block">Completed Onboarding</span>
              <span className="text-xl font-extrabold text-emerald-400 font-mono">{completedCount}</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
              <span className="text-[11px] text-slate-400 block">Needs Attention</span>
              <span className="text-xl font-extrabold text-amber-400 font-mono">{attentionCount}</span>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center text-xs text-slate-400 bg-slate-950/60 rounded-lg border border-slate-800/80 mb-6">
            No employees registered in system directory yet.
          </div>
        )}
      </div>

      <div className="pt-2">
        <Link href="/admin/employees">
          <Button variant="outline" size="sm" className="w-full border-slate-700 text-slate-200 hover:bg-slate-800 text-xs">
            View Employees Directory →
          </Button>
        </Link>
      </div>
    </Card>
  );
};
