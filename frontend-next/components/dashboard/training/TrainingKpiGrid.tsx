'use client';

import React from 'react';
import { Users, BookOpen, CheckCircle2, AlertTriangle, FileText, Award } from 'lucide-react';
import { ReportsOverviewResponse } from '../../../lib/services/trainingDashboard';

interface TrainingKpiGridProps {
  overview: ReportsOverviewResponse | null;
  loading: boolean;
  error?: string;
}

export const TrainingKpiGrid: React.FC<TrainingKpiGridProps> = ({ overview, loading, error }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-4 animate-pulse">
            <div className="h-4 bg-slate-800 rounded w-2/3 mb-3"></div>
            <div className="h-8 bg-slate-800 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-slate-800 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error && !overview) {
    return (
      <div className="bg-amber-950/30 border border-amber-800/50 rounded-xl p-4 text-amber-300 text-sm flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0" />
          <span>Training overview metrics could not be loaded: {error}</span>
        </div>
        <span className="text-xs text-amber-400 font-mono bg-amber-900/50 px-2 py-1 rounded">Unavailable</span>
      </div>
    );
  }

  const kpis = [
    {
      title: 'Active Onboarding',
      value: overview?.active_training_plans ?? 'Unavailable',
      subtitle: `${overview?.total_employees ?? 0} total employees`,
      icon: Users,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
    },
    {
      title: 'Avg Progress',
      value: overview?.average_progress_percentage !== undefined ? `${Math.round(overview.average_progress_percentage)}%` : 'Unavailable',
      subtitle: 'Across all active plans',
      icon: BookOpen,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10',
      borderColor: 'border-indigo-500/20',
    },
    {
      title: 'Completed Plans',
      value: overview?.completed_plans ?? 'Unavailable',
      subtitle: 'Fully completed modules',
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
    },
    {
      title: 'Assessment Pass Rate',
      value: overview?.assessment_completion_rate !== undefined ? `${Math.round(overview.assessment_completion_rate)}%` : 'Unavailable',
      subtitle: 'First-time & retries',
      icon: Award,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
    },
    {
      title: 'Mandatory Requirements',
      value: overview?.mandatory_requirements ?? 'Unavailable',
      subtitle: `Out of ${overview?.total_requirements ?? 0} requirements`,
      icon: FileText,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20',
    },
    {
      title: 'Pending Reviews',
      value: overview?.pending_reviews ?? 'Unavailable',
      subtitle: overview?.outdated_plans ? `${overview.outdated_plans} policy updates` : 'Human review queue',
      icon: AlertTriangle,
      color: 'text-rose-400',
      bgColor: 'bg-rose-500/10',
      borderColor: 'border-rose-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 min-w-0">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon;
        return (
          <div
            key={index}
            className={`bg-slate-900/90 border ${kpi.borderColor} rounded-xl p-4 transition-all duration-200 hover:border-slate-700 hover:shadow-lg flex flex-col justify-between min-w-0`}
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider line-clamp-2 leading-tight">
                  {kpi.title}
                </span>
                <div className={`p-2 rounded-lg ${kpi.bgColor} shrink-0`}>
                  <Icon className={`h-4 w-4 ${kpi.color}`} />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-100 tracking-tight font-mono truncate">
                {kpi.value}
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-1.5 truncate">{kpi.subtitle}</p>
          </div>
        );
      })}
    </div>
  );
};
