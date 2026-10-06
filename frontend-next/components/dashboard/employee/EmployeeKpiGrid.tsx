'use client';

import React from 'react';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Award,
  AlertTriangle,
  FileCheck,
  Layers,
} from 'lucide-react';
import {
  BackendEmployeeDashboardResponse,
  ModuleProgressItem,
  MandatoryTrainingReportItem,
  AssessmentReportSummary,
  BackendLearningPlanResponse,
} from '../../../lib/services/employeeDashboard';

interface EmployeeKpiGridProps {
  dashboard: BackendEmployeeDashboardResponse | null;
  learningPlan: BackendLearningPlanResponse | null;
  modules: ModuleProgressItem[];
  mandatoryItems: MandatoryTrainingReportItem[];
  assessments: AssessmentReportSummary | null;
  loading: boolean;
  error?: string;
}

export const EmployeeKpiGrid: React.FC<EmployeeKpiGridProps> = ({
  dashboard,
  learningPlan,
  modules,
  mandatoryItems,
  assessments,
  loading,
  error,
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 min-w-0">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-4 animate-pulse">
            <div className="h-3 bg-slate-800 rounded w-2/3 mb-3"></div>
            <div className="h-7 bg-slate-800 rounded w-1/2 mb-2"></div>
            <div className="h-2 bg-slate-800 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error && !dashboard && modules.length === 0) {
    return (
      <div className="bg-amber-950/30 border border-amber-800/50 rounded-xl p-4 text-amber-300 text-sm flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0" />
          <span>Personal learning metrics could not be loaded: {error}</span>
        </div>
        <span className="text-xs text-amber-400 font-mono bg-amber-900/50 px-2 py-1 rounded">Unavailable</span>
      </div>
    );
  }

  const overallProgress = dashboard?.overall_progress_percentage !== undefined
    ? `${Math.round(dashboard.overall_progress_percentage)}%`
    : 'Unavailable';

  const assignedCount = dashboard?.assigned_modules_count ?? modules.length ?? 'Unavailable';
  const completedCount = dashboard?.completed_modules_count ?? modules.filter((m) => m.completion_status === 'completed').length;
  const activeCount = modules.filter((m) => m.completion_status === 'started' || m.completion_status === 'in_progress').length;

  const mandatoryOutstanding = mandatoryItems.filter((m) => m.completion_status !== 'completed').length;

  const quizPassed = assessments?.passed_assessments ?? 'Unavailable';
  const quizPending = assessments?.items ? assessments.items.filter((i) => i.pass_fail_result !== 'passed').length : 'Unavailable';

  const planVersion = learningPlan?.plan_id ? 'v1.0' : 'Assigned';
  const learningStatus = dashboard?.overall_status ? dashboard.overall_status.replace(/_/g, ' ').toUpperCase() : 'ON TRACK';

  const kpis = [
    {
      title: 'Overall Progress',
      value: overallProgress,
      subtitle: 'Total plan completion',
      icon: BookOpen,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
    },
    {
      title: 'Active Modules',
      value: modules.length > 0 ? activeCount : 'Unavailable',
      subtitle: 'In progress',
      icon: Clock,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10',
      borderColor: 'border-indigo-500/20',
    },
    {
      title: 'Completed Modules',
      value: completedCount,
      subtitle: `Out of ${assignedCount} total`,
      icon: CheckCircle2,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
    },
    {
      title: 'Mandatory Outstanding',
      value: mandatoryItems.length > 0 ? mandatoryOutstanding : 'Unavailable',
      subtitle: 'Compliance items',
      icon: ShieldCheck,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20',
    },
    {
      title: 'Assessments Passed',
      value: quizPassed,
      subtitle: 'Passed quizzes',
      icon: Award,
      color: 'text-sky-400',
      bgColor: 'bg-sky-500/10',
      borderColor: 'border-sky-500/20',
    },
    {
      title: 'Assessments Pending',
      value: quizPending,
      subtitle: 'Quizzes / Retries',
      icon: AlertTriangle,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
    },
    {
      title: 'Plan Version',
      value: planVersion,
      subtitle: 'Verified RRM plan',
      icon: FileCheck,
      color: 'text-teal-400',
      bgColor: 'bg-teal-500/10',
      borderColor: 'border-teal-500/20',
    },
    {
      title: 'Learning Status',
      value: learningStatus,
      subtitle: 'Current pace',
      icon: Layers,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 min-w-0">
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
            <p className="text-xs text-slate-400 mt-2 truncate">{kpi.subtitle}</p>
          </div>
        );
      })}
    </div>
  );
};
