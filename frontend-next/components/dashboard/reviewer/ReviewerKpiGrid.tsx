'use client';

import React from 'react';
import {
  Clock,
  AlertTriangle,
  FileCheck,
  RefreshCw,
  ShieldAlert,
  Search,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import {
  ReportsOverviewResponse,
  ReviewQueueItemResponse,
  HallucinationReportItem,
  TraceabilityReportItem,
} from '../../../lib/services/reviewerDashboard';

interface ReviewerKpiGridProps {
  overview: ReportsOverviewResponse | null;
  reviewQueue: ReviewQueueItemResponse[];
  validationIssues: HallucinationReportItem[];
  traceability: TraceabilityReportItem[];
  loading: boolean;
  error?: string;
}

export const ReviewerKpiGrid: React.FC<ReviewerKpiGridProps> = ({
  overview,
  reviewQueue,
  validationIssues,
  traceability,
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

  if (error && !overview && reviewQueue.length === 0) {
    return (
      <div className="bg-amber-950/30 border border-amber-800/50 rounded-xl p-4 text-amber-300 text-sm flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0" />
          <span>Reviewer metrics could not be loaded: {error}</span>
        </div>
        <span className="text-xs text-amber-400 font-mono bg-amber-900/50 px-2 py-1 rounded">Unavailable</span>
      </div>
    );
  }

  const pendingCount = reviewQueue.filter((item) => item.status === 'pending').length;
  const approvedCount = reviewQueue.filter((item) => item.status === 'approved').length;
  const rejectedCount = reviewQueue.filter((item) => item.status === 'rejected').length;

  const valFailures = overview?.validation_failures !== undefined ? overview.validation_failures : 'Unavailable';

  const unsupportedFlags = validationIssues.filter(
    (i) => i.flag_type === 'unsupported_claim' || i.flag_type === 'unsupported_content'
  ).length;

  const contradictionFlags = validationIssues.filter(
    (i) => i.flag_type === 'contradiction'
  ).length;

  const untraceableCount = traceability.filter((t) => !t.is_verified_traceable).length;

  const kpis = [
    {
      title: 'Pending Reviews',
      value: reviewQueue.length > 0 ? pendingCount : (overview?.pending_reviews ?? 'Unavailable'),
      subtitle: 'In review queue',
      icon: Clock,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20',
    },
    {
      title: 'Validation Failures',
      value: valFailures,
      subtitle: 'Failed ground-truth',
      icon: ShieldAlert,
      color: 'text-rose-400',
      bgColor: 'bg-rose-500/10',
      borderColor: 'border-rose-500/20',
    },
    {
      title: 'Awaiting Approval',
      value: pendingCount,
      subtitle: 'Needs reviewer decision',
      icon: FileCheck,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
    },
    {
      title: 'Regeneration Req.',
      value: rejectedCount,
      subtitle: 'Rejected or outdated',
      icon: RefreshCw,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
    },
    {
      title: 'Unsupported Flags',
      value: validationIssues.length > 0 ? unsupportedFlags : 'Unavailable',
      subtitle: 'Unbacked claims',
      icon: AlertTriangle,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/20',
    },
    {
      title: 'Traceability Issues',
      value: traceability.length > 0 ? untraceableCount : 'Unavailable',
      subtitle: 'Unverified source link',
      icon: Search,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/20',
    },
    {
      title: 'Contradictions',
      value: validationIssues.length > 0 ? contradictionFlags : 'Unavailable',
      subtitle: 'Policy conflict',
      icon: FileText,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/20',
    },
    {
      title: 'Recently Approved',
      value: approvedCount,
      subtitle: 'Verified & released',
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
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
