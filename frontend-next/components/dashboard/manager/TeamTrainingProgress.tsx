'use client';

import React from 'react';
import { BookOpen, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { EmployeeProgressReportItem, ReportsOverviewResponse } from '../../../lib/services/managerDashboard';

interface TeamTrainingProgressProps {
  overview: ReportsOverviewResponse | null;
  items: EmployeeProgressReportItem[];
  loading: boolean;
  error?: string;
}

export const TeamTrainingProgress: React.FC<TeamTrainingProgressProps> = ({
  overview,
  items,
  loading,
  error,
}) => {
  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 animate-pulse">
        <div className="h-6 bg-slate-800 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-10 bg-slate-800/50 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error && items.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center space-x-2 text-slate-300 font-semibold mb-3">
          <BookOpen className="h-5 w-5 text-indigo-400" />
          <h3>Team Training Completion & Milestones</h3>
        </div>
        <p className="text-sm text-slate-400">Data unavailable: {error}</p>
      </div>
    );
  }

  const completed = items.filter((i) => i.current_status === 'completed').length;
  const onTrack = items.filter((i) => i.current_status === 'on_track').length;
  const behind = items.filter((i) => i.current_status === 'behind_schedule' || i.current_status === 'requires_attention').length;

  const totalProgress = items.reduce((acc, i) => acc + (i.overall_progress_percentage || 0), 0);
  const avgProgress = items.length > 0
    ? Math.round(totalProgress / items.length)
    : overview?.average_progress_percentage !== undefined
    ? Math.round(overview.average_progress_percentage)
    : 'Unavailable';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-indigo-400" />
            <h3 className="font-semibold text-slate-100">Team Training Progress & Distribution</h3>
          </div>
          <span className="text-xs font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-1 rounded-full">
            Avg {avgProgress}%
          </span>
        </div>

        {/* Milestone cards */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 text-center">
            <div className="text-[10px] text-slate-400 font-medium uppercase">Fully Completed</div>
            <div className="text-xl font-bold text-emerald-400 font-mono mt-0.5 flex items-center justify-center space-x-1">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{completed}</span>
            </div>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 text-center">
            <div className="text-[10px] text-slate-400 font-medium uppercase">On Track</div>
            <div className="text-xl font-bold text-blue-400 font-mono mt-0.5 flex items-center justify-center space-x-1">
              <Clock className="h-4 w-4 shrink-0" />
              <span>{onTrack}</span>
            </div>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 text-center">
            <div className="text-[10px] text-slate-400 font-medium uppercase">Behind Target</div>
            <div className="text-xl font-bold text-rose-400 font-mono mt-0.5 flex items-center justify-center space-x-1">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{behind}</span>
            </div>
          </div>
        </div>

        {/* Individual completion meters */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-slate-300 mb-2">Team Member Milestones</div>
          {items.slice(0, 4).map((emp) => {
            const pct = Math.round(emp.overall_progress_percentage || 0);
            return (
              <div key={emp.employee_id} className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/60">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-slate-200">{emp.employee_name}</span>
                  <span className="font-mono text-slate-300 font-bold">{pct}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      pct === 100 ? 'bg-emerald-500' : pct >= 50 ? 'bg-indigo-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
