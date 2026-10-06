'use client';

import React from 'react';
import { Activity, Database, CheckCircle2, AlertTriangle, Users } from 'lucide-react';
import {
  HealthCheckResponse,
  EmployeeProgressReportItem,
  AssessmentReportSummary,
} from '../../../lib/services/managerDashboard';

interface ManagerHealthProps {
  health: HealthCheckResponse | null;
  progressItems: EmployeeProgressReportItem[];
  assessments: AssessmentReportSummary | null;
  loading: boolean;
  error?: string;
}

export const ManagerHealth: React.FC<ManagerHealthProps> = ({
  health,
  progressItems,
  assessments,
  loading,
  error,
}) => {
  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 animate-pulse">
        <div className="h-4 bg-slate-800 rounded w-1/3 mb-2"></div>
        <div className="h-4 bg-slate-800 rounded w-1/2"></div>
      </div>
    );
  }

  const isHealthy = health?.status === 'ok' || health?.status === 'healthy';

  const total = progressItems.length;
  const completed = progressItems.filter((emp) => emp.current_status === 'completed').length;
  const teamCompletionRate = total > 0 ? `${Math.round((completed / total) * 100)}%` : 'Unavailable';

  const passRate = assessments?.pass_rate_percentage !== undefined ? `${Math.round(assessments.pass_rate_percentage)}%` : 'Unavailable';
  const needingAttention = progressItems.filter(
    (emp) => emp.current_status === 'requires_attention' || emp.current_status === 'behind_schedule'
  ).length;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-lg ${isHealthy ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
          {isHealthy ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
        </div>
        <div>
          <div className="text-xs font-semibold text-slate-200 flex items-center space-x-2">
            <span>OnBoardIQ Team Learning Engine</span>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                isHealthy
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}
            >
              {health?.status ? health.status.toUpperCase() : 'UNKNOWN'}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5 flex items-center space-x-3 font-mono">
            <span>Service: {health?.service || 'OnBoardIQ Backend'}</span>
            <span>•</span>
            <span className="flex items-center space-x-1">
              <Database className="h-3 w-3 text-slate-400" />
              <span>DB: {health?.database || (error ? 'Disconnected' : 'Connected')}</span>
            </span>
            <span>•</span>
            <span>v{health?.version || '1.0.0'}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
        <div className="bg-slate-950/60 border border-slate-800 px-3 py-1.5 rounded-lg flex items-center space-x-2">
          <Users className="h-3.5 w-3.5 text-blue-400" />
          <span className="text-slate-400">Team Completion:</span>
          <span className="text-slate-100 font-bold">{teamCompletionRate}</span>
        </div>
        <div className="bg-slate-950/60 border border-slate-800 px-3 py-1.5 rounded-lg flex items-center space-x-2">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-slate-400">Pass Rate:</span>
          <span className="text-slate-100 font-bold">{passRate}</span>
        </div>
        {needingAttention > 0 && (
          <div className="bg-amber-950/40 border border-amber-500/20 px-3 py-1.5 rounded-lg flex items-center space-x-2 text-amber-300">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
            <span>Needing Attention: {needingAttention}</span>
          </div>
        )}
        <div className="hidden lg:flex items-center space-x-2 text-slate-400">
          <Activity className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
          <span>Active</span>
        </div>
      </div>
    </div>
  );
};
