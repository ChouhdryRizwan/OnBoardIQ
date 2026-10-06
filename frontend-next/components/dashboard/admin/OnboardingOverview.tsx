import React from 'react';
import { Card } from '../../ui/Card';
import { StatusBadge } from '../shared/StatusBadge';
import { AdminDashboardData } from '../../../lib/services/adminDashboard';

export interface OnboardingOverviewProps {
  data: AdminDashboardData;
  isLoading: boolean;
}

export const OnboardingOverview: React.FC<OnboardingOverviewProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <Card className="bg-slate-900 border-slate-800 p-6 animate-pulse">
        <div className="h-4 bg-slate-800 rounded w-1/3 mb-4" />
        <div className="h-20 bg-slate-800 rounded" />
      </Card>
    );
  }

  const overview = data.overview;
  const reviewQueue = data.reviewQueue || [];

  const activePlans = overview?.active_training_plans ?? overview?.active_onboarding_plans ?? 0;
  const completedPlans = overview?.completed_plans ?? overview?.completed_onboarding_plans ?? 0;
  const pendingReviews =
    reviewQueue.length > 0
      ? reviewQueue.length
      : (overview?.pending_reviews ?? overview?.pending_human_reviews_count ?? 0);

  return (
    <Card className="bg-slate-900 border-slate-800 p-6 shadow-lg flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-white">Onboarding Lifecycle Status</h3>
            <p className="text-xs text-slate-400 mt-0.5">Plan generation, review queues, and release statuses</p>
          </div>
          <span className="text-xs font-mono text-slate-400">Pipeline 1 & 2</span>
        </div>

        <div className="space-y-3 mb-4">
          <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <StatusBadge status="in_progress" label="In Progress" />
              <span className="text-xs text-slate-300 font-medium">Active Trainee Plans</span>
            </div>
            <span className="text-sm font-bold text-white font-mono">{activePlans}</span>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <StatusBadge status="pending" label="Pending Review" />
              <span className="text-xs text-slate-300 font-medium">Human Approval Queue</span>
            </div>
            <span className="text-sm font-bold text-amber-400 font-mono">{pendingReviews}</span>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <StatusBadge status="completed" label="Completed" />
              <span className="text-xs text-slate-300 font-medium">Finished Onboarding</span>
            </div>
            <span className="text-sm font-bold text-emerald-400 font-mono">{completedPlans}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
