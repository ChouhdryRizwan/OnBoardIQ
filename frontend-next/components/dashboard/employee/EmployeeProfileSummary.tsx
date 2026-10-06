'use client';

import React from 'react';
import { User as UserIcon, Briefcase, Building2, Mail, CheckCircle2 } from 'lucide-react';
import { getStoredUser } from '../../../lib/auth';
import { BackendEmployeeDashboardResponse } from '../../../lib/services/employeeDashboard';

interface EmployeeProfileSummaryProps {
  dashboard: BackendEmployeeDashboardResponse | null;
  loading: boolean;
}

export const EmployeeProfileSummary: React.FC<EmployeeProfileSummaryProps> = ({
  dashboard,
  loading,
}) => {
  const storedUser = getStoredUser();

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 animate-pulse">
        <div className="h-4 bg-slate-800 rounded w-1/3 mb-2"></div>
        <div className="h-4 bg-slate-800 rounded w-1/2"></div>
      </div>
    );
  }

  const name = dashboard?.employee_name || storedUser?.full_name || storedUser?.name || 'Employee';
  const email = storedUser?.email || 'emp@company.com';
  const role = dashboard?.role_title || dashboard?.role_code || storedUser?.role || 'Job Role';
  const dept = dashboard?.department || storedUser?.department || 'General';
  const status = dashboard?.overall_status || 'Active Onboarding';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 h-full flex flex-col md:flex-row md:items-center justify-between gap-4 min-w-0 shadow-sm">
      <div className="flex items-start sm:items-center space-x-3 min-w-0">
        <div className="p-3 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
          <UserIcon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-slate-100 text-sm truncate">{name}</h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
              {status.toUpperCase()}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-400 mt-1">
            <span className="flex items-center space-x-1 min-w-0">
              <Mail className="h-3 w-3 text-slate-400 shrink-0" />
              <span className="truncate">{email}</span>
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center space-x-1 min-w-0">
              <Briefcase className="h-3 w-3 text-slate-400 shrink-0" />
              <span className="truncate">{role}</span>
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center space-x-1 min-w-0">
              <Building2 className="h-3 w-3 text-slate-400 shrink-0" />
              <span className="truncate">{dept}</span>
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-3 text-xs font-mono text-slate-400 border-t md:border-t-0 border-slate-800 pt-3 md:pt-0 shrink-0">
        <div className="flex items-center space-x-1 text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>Verified Account</span>
        </div>
      </div>
    </div>
  );
};
