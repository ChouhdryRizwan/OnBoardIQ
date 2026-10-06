import React from 'react';
import Link from 'next/link';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { ProgressCard } from '../shared/ProgressCard';
import { AdminDashboardData } from '../../../lib/services/adminDashboard';

export interface RRMOverviewProps {
  data: AdminDashboardData;
  isLoading: boolean;
}

export const RRMOverview: React.FC<RRMOverviewProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <Card className="bg-slate-900 border-slate-800 p-6 animate-pulse">
        <div className="h-4 bg-slate-800 rounded w-1/3 mb-4" />
        <div className="h-24 bg-slate-800 rounded" />
      </Card>
    );
  }

  const rrm = data.rrmSummary;
  const roles = data.jobRoles || [];

  const totalRoles = roles.length > 0 ? roles.length : (rrm?.total_roles ?? rrm?.total_job_roles ?? 0);
  const totalReqs = rrm?.mandatory_requirements ?? rrm?.total_mandatory_requirements ?? 0;
  const completeRoles = rrm?.roles_with_complete_matrix ?? totalRoles;
  const circularDeps = rrm?.circular_dependencies_detected ?? 0;

  const completionPct = totalRoles > 0 ? Math.round((completeRoles / totalRoles) * 100) : 100;

  return (
    <Card className="bg-slate-900 border-slate-800 p-6 shadow-lg flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-white">Role Requirement Matrix (RRM)</h3>
            <p className="text-xs text-slate-400 mt-0.5">Role competency standards & prerequisite chains</p>
          </div>
          <span className="text-xs font-mono font-bold text-sky-400 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
            {totalRoles} Job Roles
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
            <span className="text-[11px] text-slate-400 block">Mandatory Competencies</span>
            <span className="text-xl font-extrabold text-white font-mono">{totalReqs}</span>
          </div>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
            <span className="text-[11px] text-slate-400 block">Circular Dependencies</span>
            <span className={`text-xl font-extrabold font-mono ${circularDeps > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {circularDeps}
            </span>
          </div>
        </div>

        <ProgressCard
          title="Roles Matrix Completion"
          percentage={completionPct}
          label={`${completeRoles} of ${totalRoles} job roles have active RRM matrices configured`}
          color="sky"
        />
      </div>

      <div className="pt-4">
        <Link href="/admin/rrm">
          <Button variant="outline" size="sm" className="w-full border-slate-700 text-slate-200 hover:bg-slate-800 text-xs">
            Open Role Requirement Matrix →
          </Button>
        </Link>
      </div>
    </Card>
  );
};
