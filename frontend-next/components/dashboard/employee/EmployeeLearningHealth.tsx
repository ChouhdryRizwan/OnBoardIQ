'use client';

import React from 'react';
import { Activity, Database, CheckCircle2, AlertTriangle, BookOpen } from 'lucide-react';
import {
  HealthCheckResponse,
  BackendEmployeeDashboardResponse,
  ModuleProgressItem,
} from '../../../lib/services/employeeDashboard';

interface EmployeeLearningHealthProps {
  health: HealthCheckResponse | null;
  dashboard: BackendEmployeeDashboardResponse | null;
  modules: ModuleProgressItem[];
  loading: boolean;
  error?: string;
}

export const EmployeeLearningHealth: React.FC<EmployeeLearningHealthProps> = ({
  health,
  dashboard,
  modules,
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

  const progressPct = dashboard?.overall_progress_percentage !== undefined
    ? `${Math.round(dashboard.overall_progress_percentage)}%`
    : 'Unavailable';

  const quizScore = dashboard?.quiz_assessment_score !== undefined && dashboard.quiz_assessment_score > 0
    ? `${Math.round(dashboard.quiz_assessment_score)}%`
    : 'Unavailable';

  const pendingModules = modules.filter((m) => m.completion_status !== 'completed').length;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 h-full flex flex-col justify-between gap-3 min-w-0 shadow-sm">
      <div className="flex items-start space-x-3 min-w-0">
        <div className={`p-2 rounded-lg shrink-0 ${isHealthy ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
          {isHealthy ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold text-slate-200 flex flex-wrap items-center justify-between gap-1.5 min-w-0">
            <span className="truncate">OnBoardIQ Personal Learning Engine</span>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-full shrink-0 ${
                isHealthy
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}
            >
              {health?.status ? health.status.toUpperCase() : 'UNKNOWN'}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono min-w-0">
            <span className="truncate">Service: {health?.service || 'OnBoardIQ Backend'}</span>
            <span>•</span>
            <span className="flex items-center space-x-1 shrink-0">
              <Database className="h-3 w-3 text-slate-400" />
              <span>DB: {health?.database || (error ? 'Disconnected' : 'Connected')}</span>
            </span>
            <span>•</span>
            <span className="shrink-0">v{health?.version || '1.0.0'}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs font-mono pt-1 min-w-0 border-t border-slate-800/80">
        <div className="bg-slate-950/60 border border-slate-800 px-2.5 py-1 rounded-lg flex items-center space-x-1.5 shrink-0">
          <BookOpen className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-slate-400 text-[11px]">Progress:</span>
          <span className="text-slate-100 font-bold text-[11px]">{progressPct}</span>
        </div>
        <div className="bg-slate-950/60 border border-slate-800 px-2.5 py-1 rounded-lg flex items-center space-x-1.5 shrink-0">
          <CheckCircle2 className="h-3.5 w-3.5 text-sky-400" />
          <span className="text-slate-400 text-[11px]">Quiz Score:</span>
          <span className="text-slate-100 font-bold text-[11px]">{quizScore}</span>
        </div>
        {pendingModules > 0 && (
          <div className="bg-indigo-950/40 border border-indigo-500/20 px-2.5 py-1 rounded-lg flex items-center space-x-1.5 text-indigo-300 shrink-0">
            <span className="text-[11px]">Pending: {pendingModules}</span>
          </div>
        )}
        <div className="flex items-center space-x-1.5 text-slate-400 text-[11px] ml-auto">
          <Activity className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
          <span>Active</span>
        </div>
      </div>
    </div>
  );
};
