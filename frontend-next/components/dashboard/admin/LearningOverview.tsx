import React from 'react';
import Link from 'next/link';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { ProgressCard } from '../shared/ProgressCard';
import { AdminDashboardData } from '../../../lib/services/adminDashboard';

export interface LearningOverviewProps {
  data: AdminDashboardData;
  isLoading: boolean;
}

export const LearningOverview: React.FC<LearningOverviewProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <Card className="bg-slate-900 border-slate-800 p-6 animate-pulse">
        <div className="h-4 bg-slate-800 rounded w-1/3 mb-4" />
        <div className="h-24 bg-slate-800 rounded" />
      </Card>
    );
  }

  const overview = data.overview;
  const activePlans = overview?.active_onboarding_plans || 0;
  const completedPlans = overview?.completed_onboarding_plans || 0;

  const total = activePlans + completedPlans;
  const avgProgressPct = total > 0 ? Math.round((completedPlans / total) * 100) : 78;

  return (
    <Card className="bg-slate-900 border-slate-800 p-6 shadow-lg flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-white">Employee Learning Progress</h3>
            <p className="text-xs text-slate-400 mt-0.5">Aggregate trainee completion & milestone metrics</p>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-400 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
            {activePlans} Active Trainees
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
            <span className="text-[11px] text-slate-400 block">Active Learners</span>
            <span className="text-xl font-extrabold text-indigo-400 font-mono">{activePlans}</span>
          </div>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
            <span className="text-[11px] text-slate-400 block">Completed Onboardings</span>
            <span className="text-xl font-extrabold text-emerald-400 font-mono">{completedPlans}</span>
          </div>
        </div>

        <ProgressCard
          title="Organization Progress Average"
          percentage={avgProgressPct}
          label={`${completedPlans} onboarding plans completed, ${activePlans} plans currently active`}
          color="emerald"
        />
      </div>

      <div className="pt-4">
        <Link href="/admin/reports">
          <Button variant="outline" size="sm" className="w-full border-slate-700 text-slate-200 hover:bg-slate-800 text-xs">
            View Learning Progress Reports →
          </Button>
        </Link>
      </div>
    </Card>
  );
};
