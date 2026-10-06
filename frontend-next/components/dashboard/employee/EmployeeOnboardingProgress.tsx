'use client';

import React from 'react';
import { BackendEmployeeDashboardResponse } from '@/lib/services/employeeDashboard';
import { CheckCircle, Clock, AlertTriangle, Flag, Award } from 'lucide-react';

interface EmployeeOnboardingProgressProps {
  dashboard: BackendEmployeeDashboardResponse | null;
  loading: boolean;
  error?: string;
}

export function EmployeeOnboardingProgress({ dashboard, loading, error }: EmployeeOnboardingProgressProps) {
  if (loading) {
    return (
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-slate-200 rounded w-full mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-20 bg-slate-800/60 rounded-lg"></div>
          <div className="h-20 bg-slate-800/60 rounded-lg"></div>
          <div className="h-20 bg-slate-800/60 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-100 mb-2">Onboarding Progress</h2>
        <div className="flex items-center text-amber-600 bg-amber-50 p-4 rounded-lg text-sm">
          <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
          <span>{error || 'Onboarding progress data is currently unavailable.'}</span>
        </div>
      </div>
    );
  }

  const overallPct = Math.min(100, Math.max(0, dashboard.overall_progress_percentage || 0));
  const checklistPct = Math.min(100, Math.max(0, dashboard.checklist_completion_percentage || 0));
  const milestones = dashboard.milestones || [];
  const milestonesReached = milestones.filter((m) => m.is_reached).length;

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-600" />
            My Onboarding Journey
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Current Stage: <span className="font-semibold text-slate-200">{dashboard.current_stage || 'N/A'}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            {dashboard.overall_status || 'In Progress'}
          </span>
        </div>
      </div>

      {/* Main Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-slate-300">Overall Onboarding Completion</span>
          <span className="text-lg font-bold text-indigo-600">{overallPct}%</span>
        </div>
        <div className="w-full bg-slate-800/60 rounded-full h-3.5 overflow-hidden border border-slate-800">
          <div
            className="bg-indigo-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${overallPct}%` }}
          ></div>
        </div>
      </div>

      {/* Progress Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-lg bg-slate-950 border border-slate-800/60 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-700">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-400">Modules Completed</div>
            <div className="text-lg font-bold text-slate-100">
              {dashboard.completed_modules_count} / {dashboard.assigned_modules_count}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-slate-950 border border-slate-800/60 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-blue-100 text-blue-700">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-400">Checklist Tasks</div>
            <div className="text-lg font-bold text-slate-100">
              {dashboard.completed_tasks_count} / {dashboard.total_tasks_count} ({checklistPct}%)
            </div>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-slate-950 border border-slate-800/60 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-purple-100 text-purple-700">
            <Flag className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-400">Milestones Reached</div>
            <div className="text-lg font-bold text-slate-100">
              {milestonesReached} / {milestones.length || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Milestones list */}
      {milestones.length > 0 && (
        <div className="border-t border-slate-800/60 pt-4">
          <h3 className="text-sm font-semibold text-slate-200 mb-3">Key Onboarding Milestones</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {milestones.map((m) => (
              <div
                key={m.milestone_id}
                className={`p-3 rounded-lg border flex items-start gap-3 ${
                  m.is_reached
                    ? 'bg-emerald-50/50 border-emerald-200'
                    : 'bg-slate-950 border-slate-800'
                }`}
              >
                <CheckCircle
                  className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                    m.is_reached ? 'text-emerald-600' : 'text-slate-300'
                  }`}
                />
                <div>
                  <div className="text-sm font-medium text-slate-100">{m.title}</div>
                  <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                    <span>Stage: {m.stage_name}</span>
                    <span>•</span>
                    <span>Target: {m.target_completion_days} days</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
