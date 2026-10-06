import React from 'react';
import { Card } from '../../ui/Card';
import { AdminDashboardData } from '../../../lib/services/adminDashboard';

export interface AdminKpiGridProps {
  data: AdminDashboardData;
  isLoading: boolean;
}

export const AdminKpiGrid: React.FC<AdminKpiGridProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Card key={i} className="bg-slate-900 border-slate-800 p-5 animate-pulse">
            <div className="h-3 bg-slate-800 rounded w-1/2 mb-3" />
            <div className="h-7 bg-slate-800 rounded w-3/4 mb-2" />
            <div className="h-2 bg-slate-800 rounded w-1/3" />
          </Card>
        ))}
      </div>
    );
  }

  const employeeCount = data.employees.length > 0 ? data.employees.length : data.overview?.total_employees;
  const roleCount =
    data.jobRoles.length > 0
      ? data.jobRoles.length
      : (data.rrmSummary?.total_roles ?? data.rrmSummary?.total_job_roles ?? data.overview?.total_roles);
  const docCount = data.documents.length;
  const rrmReqCount =
    data.rrmSummary?.mandatory_requirements ??
    data.rrmSummary?.total_mandatory_requirements ??
    data.overview?.mandatory_requirements;
  const activePlansCount = data.overview?.active_training_plans ?? data.overview?.active_onboarding_plans;

  // Distinguish 0 from undefined using length > 0 check and nullish coalescing
  const pendingReviewsCount =
    data.reviewQueue.length > 0
      ? data.reviewQueue.length
      : (data.overview?.pending_reviews ?? data.overview?.pending_human_reviews_count);

  const policyUpdatesCount =
    data.policyUpdates.length > 0
      ? data.policyUpdates.length
      : (data.overview?.policy_changes_count ?? data.overview?.detected_policy_updates_count);

  const coverageScorePct = data.overview?.avg_mandatory_coverage_pct;

  const kpis = [
    {
      title: 'Employees Directory',
      value: employeeCount !== undefined ? employeeCount : 'Unavailable',
      subtitle: data.errors.employees ? 'API Unavailable' : 'Registered user accounts',
      icon: '👥',
      color: 'border-l-indigo-500',
    },
    {
      title: 'Active Job Roles',
      value: roleCount !== undefined ? roleCount : 'Unavailable',
      subtitle: data.errors.jobRoles ? 'API Unavailable' : 'Defined job role codes',
      icon: '🎯',
      color: 'border-l-sky-500',
    },
    {
      title: 'Company Documents',
      value: docCount !== undefined ? docCount : 'Unavailable',
      subtitle: data.errors.documents ? 'API Unavailable' : 'Ingested policy SOP manuals',
      icon: '📄',
      color: 'border-l-indigo-500',
    },
    {
      title: 'RRM Requirements',
      value: rrmReqCount !== undefined ? rrmReqCount : 'Unavailable',
      subtitle: data.errors.rrmSummary ? 'API Unavailable' : 'Mandatory competency rules',
      icon: '⚡',
      color: 'border-l-amber-500',
    },
    {
      title: 'Active Plans',
      value: activePlansCount !== undefined ? activePlansCount : 'Unavailable',
      subtitle: data.errors.overview ? 'API Unavailable' : 'Onboarding plans in progress',
      icon: '📋',
      color: 'border-l-emerald-500',
    },
    {
      title: 'Pending Reviews',
      value: pendingReviewsCount !== undefined ? pendingReviewsCount : 'Unavailable',
      subtitle: data.errors.reviewQueue ? 'API Unavailable' : 'Awaiting human review decision',
      icon: '⚖️',
      color: 'border-l-rose-500',
    },
    {
      title: 'Policy Updates',
      value: policyUpdatesCount !== undefined ? policyUpdatesCount : 'Unavailable',
      subtitle: data.errors.policyUpdates ? 'API Unavailable' : 'Detected policy version diffs',
      icon: '🔄',
      color: 'border-l-amber-500',
    },
    {
      title: 'Mandatory Coverage Score',
      value: coverageScorePct !== undefined ? `${coverageScorePct}%` : 'Unavailable',
      subtitle: data.errors.overview ? 'API Unavailable' : 'Pipeline 2 Ground Truth Average',
      icon: '🛡️',
      color: 'border-l-emerald-500',
    },
  ];

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi) => (
        <Card key={kpi.title} className={`bg-slate-900 border-slate-800 border-l-4 ${kpi.color} p-5 shadow-lg`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{kpi.title}</span>
            <span className="text-lg">{kpi.icon}</span>
          </div>

          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{kpi.value}</div>
          <p className="text-xs text-slate-400 mt-1 truncate">{kpi.subtitle}</p>
        </Card>
      ))}
    </div>
  );
};
