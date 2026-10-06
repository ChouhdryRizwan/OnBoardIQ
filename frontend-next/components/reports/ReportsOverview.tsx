'use client';

import React from 'react';
import { OverviewMetricsResponse } from '@/lib/services/reports';
import {
  Users,
  Briefcase,
  CheckCircle2,
  AlertTriangle,
  Award,
  ShieldAlert,
  Layers,
  BarChart2,
} from 'lucide-react';

interface ReportsOverviewProps {
  metrics: OverviewMetricsResponse | null;
  loading: boolean;
}

export function ReportsOverview({ metrics, loading }: ReportsOverviewProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse mb-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-sm space-y-2">
            <div className="h-4 bg-slate-800 rounded w-1/2"></div>
            <div className="h-8 bg-slate-800/60 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!metrics) {
    return null;
  }

  const kpis = [
    {
      title: 'Total Workforce',
      value: metrics.total_employees,
      subtext: `${metrics.active_employees} Active Learners`,
      icon: Users,
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    },
    {
      title: 'Configured Job Roles',
      value: metrics.total_roles,
      subtext: `${metrics.total_requirements} Ground Truth Reqs`,
      icon: Briefcase,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    },
    {
      title: 'Active Training Plans',
      value: metrics.active_training_plans,
      subtext: `${metrics.completed_plans} Fully Completed`,
      icon: Layers,
      color: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
    },
    {
      title: 'Workforce Progress Avg',
      value: `${Math.round(metrics.average_progress_percentage)}%`,
      subtext: `Target: 100% Onboarding`,
      icon: BarChart2,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      title: 'Mandatory Requirements',
      value: metrics.mandatory_requirements,
      subtext: `Strict Compliance Enforced`,
      icon: CheckCircle2,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    },
    {
      title: 'Assessment Completion',
      value: `${Math.round(metrics.assessment_completion_rate)}%`,
      subtext: `Quiz Pass Rate Average`,
      icon: Award,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    },
    {
      title: 'Review Queue Pending',
      value: metrics.pending_reviews,
      subtext: `${metrics.validation_failures} Rule Flags`,
      icon: AlertTriangle,
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    },
    {
      title: 'Policy Changes Impact',
      value: metrics.policy_changes_count,
      subtext: `${metrics.outdated_plans} Outdated Plans`,
      icon: ShieldAlert,
      color: 'text-slate-300 bg-slate-800/80 border-slate-700',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        return (
          <div key={idx} className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-sm hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {kpi.title}
              </span>
              <div className={`p-2 rounded-lg border ${kpi.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-100 mt-2">
              {kpi.value}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {kpi.subtext}
            </div>
          </div>
        );
      })}
    </div>
  );
}
