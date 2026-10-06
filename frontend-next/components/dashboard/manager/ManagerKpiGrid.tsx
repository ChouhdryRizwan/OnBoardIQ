'use client';

import React from 'react';
import {
  Users,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Award,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import {
  ReportsOverviewResponse,
  EmployeeProgressReportItem,
  MandatoryTrainingReportItem,
  AssessmentReportSummary,
} from '../../../lib/services/managerDashboard';

interface ManagerKpiGridProps {
  overview: ReportsOverviewResponse | null;
  progressItems: EmployeeProgressReportItem[];
  mandatoryItems: MandatoryTrainingReportItem[];
  assessments: AssessmentReportSummary | null;
  loading: boolean;
  error?: string;
}

export const ManagerKpiGrid: React.FC<ManagerKpiGridProps> = ({
  overview,
  progressItems,
  mandatoryItems,
  assessments,
  loading,
  error,
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-3">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 animate-pulse">
            <div className="h-3 bg-slate-800 rounded w-2/3 mb-2"></div>
            <div className="h-6 bg-slate-800 rounded w-1/2 mb-1"></div>
            <div className="h-2 bg-slate-800 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error && progressItems.length === 0 && !overview) {
    return (
      <div className="bg-amber-950/30 border border-amber-800/50 rounded-xl p-4 text-amber-300 text-sm flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0" />
          <span>Manager KPI metrics could not be loaded: {error}</span>
        </div>
        <span className="text-xs text-amber-400 font-mono bg-amber-900/50 px-2 py-1 rounded">Unavailable</span>
      </div>
    );
  }

  const teamMembers = progressItems.length > 0 ? progressItems.length : (overview?.total_employees ?? 'Unavailable');
  const onboardingCount = progressItems.filter((emp) => emp.current_status !== 'completed').length;
  const activePlans = progressItems.filter((emp) => emp.plan_version).length;
  const completedPlans = progressItems.filter((emp) => emp.current_status === 'completed').length;

  const mandatoryOutstanding = mandatoryItems.filter((item) => item.completion_status !== 'completed').length;
  const pendingAssessments = assessments?.items ? assessments.items.filter((item) => item.pass_fail_result !== 'passed').length : (overview?.pending_reviews ?? 'Unavailable');

  const needingAttention = progressItems.filter(
    (emp) => emp.current_status === 'requires_attention' || emp.current_status === 'behind_schedule'
  ).length;

  const totalProgress = progressItems.reduce((acc, emp) => acc + (emp.overall_progress_percentage || 0), 0);
  const avgProgress = progressItems.length > 0
    ? `${Math.round(totalProgress / progressItems.length)}%`
    : overview?.average_progress_percentage !== undefined
    ? `${Math.round(overview.average_progress_percentage)}%`
    : 'Unavailable';

  const kpis = [
    {
      title: 'Team Members',
      value: teamMembers,
      subtitle: 'Active profiles',
      icon: Users,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
    },
    {
      title: 'In Onboarding',
      value: progressItems.length > 0 ? onboardingCount : 'Unavailable',
      subtitle: 'Active learning plans',
      icon: Clock,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10',
      borderColor: 'border-indigo-500/20',
    },
    {
      title: 'Active Plans',
      value: progressItems.length > 0 ? activePlans : (overview?.active_training_plans ?? 'Unavailable'),
      subtitle: 'Configured & verified',
      icon: BookOpen,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
    },
    {
      title: 'Completed Training',
      value: progressItems.length > 0 ? completedPlans : (overview?.completed_plans ?? 'Unavailable'),
      subtitle: '100% completed plans',
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
    },
    {
      title: 'Mandatory Outstanding',
      value: mandatoryItems.length > 0 ? mandatoryOutstanding : 'Unavailable',
      subtitle: 'Compliance pending',
      icon: ShieldCheck,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20',
    },
    {
      title: 'Assessments Pending',
      value: pendingAssessments,
      subtitle: 'Quizzes & retries',
      icon: Award,
      color: 'text-sky-400',
      bgColor: 'bg-sky-500/10',
      borderColor: 'border-sky-500/20',
    },
    {
      title: 'Needs Attention',
      value: progressItems.length > 0 ? needingAttention : 'Unavailable',
      subtitle: 'Behind or stalled',
      icon: AlertTriangle,
      color: 'text-rose-400',
      bgColor: 'bg-rose-500/10',
      borderColor: 'border-rose-500/20',
    },
    {
      title: 'Avg Team Progress',
      value: avgProgress,
      subtitle: 'Overall team completion',
      icon: FileText,
      color: 'text-teal-400',
      bgColor: 'bg-teal-500/10',
      borderColor: 'border-teal-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-3">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon;
        return (
          <div
            key={index}
            className={`bg-slate-900/90 border ${kpi.borderColor} rounded-xl p-3.5 transition-all duration-200 hover:border-slate-700 hover:shadow-lg`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider truncate">
                {kpi.title}
              </span>
              <div className={`p-1.5 rounded-lg ${kpi.bgColor} shrink-0`}>
                <Icon className={`h-3.5 w-3.5 ${kpi.color}`} />
              </div>
            </div>
            <div className="text-xl font-bold text-slate-100 tracking-tight">
              {kpi.value}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">{kpi.subtitle}</p>
          </div>
        );
      })}
    </div>
  );
};
