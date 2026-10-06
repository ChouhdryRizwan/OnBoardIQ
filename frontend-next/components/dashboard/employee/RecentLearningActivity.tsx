'use client';

import React from 'react';
import {
  BackendEmployeeDashboardResponse,
  ModuleProgressItem,
  AssessmentReportSummary,
} from '@/lib/services/employeeDashboard';
import { Activity, CheckCircle2, Award, Clock } from 'lucide-react';

interface RecentLearningActivityProps {
  dashboard: BackendEmployeeDashboardResponse | null;
  modules: ModuleProgressItem[];
  assessments: AssessmentReportSummary | null;
  loading: boolean;
}

interface ActivityEntry {
  id: string;
  type: 'module_completed' | 'milestone_reached' | 'assessment_taken';
  title: string;
  subtitle: string;
  timestamp: string;
}

export function RecentLearningActivity({
  dashboard,
  modules,
  assessments,
  loading,
}: RecentLearningActivityProps) {
  if (loading) {
    return (
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-10 bg-slate-800/60 rounded"></div>
          <div className="h-10 bg-slate-800/60 rounded"></div>
        </div>
      </div>
    );
  }

  // Construct activities timeline
  const activities: ActivityEntry[] = [];

  // Completed modules
  modules
    .filter((m) => m.completion_status === 'completed')
    .forEach((m) => {
      activities.push({
        id: `mod-${m.module_id}`,
        type: 'module_completed',
        title: `Completed Module: ${m.title}`,
        subtitle: m.purpose || 'Assigned role requirement completed',
        timestamp: m.completed_at ? new Date(m.completed_at).toLocaleDateString() : 'Recent',
      });
    });

  // Reached milestones
  if (dashboard?.milestones) {
    dashboard.milestones
      .filter((ms) => ms.is_reached)
      .forEach((ms) => {
        activities.push({
          id: `ms-${ms.milestone_id}`,
          type: 'milestone_reached',
          title: `Milestone Reached: ${ms.title}`,
          subtitle: `Stage: ${ms.stage_name}`,
          timestamp: ms.reached_at ? new Date(ms.reached_at).toLocaleDateString() : 'Recent',
        });
      });
  }

  // Quiz assessments
  if (assessments?.items) {
    assessments.items.forEach((ast, idx) => {
      activities.push({
        id: `ast-${idx}`,
        type: 'assessment_taken',
        title: `Quiz Attempted: ${ast.assessment_topic || ast.module_title}`,
        subtitle: `Score: ${ast.best_score}% (${ast.pass_fail_result.toUpperCase()})`,
        timestamp: ast.completion_date ? new Date(ast.completion_date).toLocaleDateString() : 'Recent',
      });
    });
  }

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-600" />
            Recent Activity Log
          </h2>
          <p className="text-sm text-slate-400 mt-1">Timeline of completed milestones, modules, and quiz attempts</p>
        </div>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-6 border border-dashed border-slate-800 rounded-lg text-slate-400 text-sm">
          No recent learning activity logged yet.
        </div>
      ) : (
        <div className="relative pl-6 border-l-2 border-slate-800 space-y-6">
          {activities.slice(0, 6).map((act) => (
            <div key={act.id} className="relative">
              {/* Icon dot on border line */}
              <div className="absolute -left-[31px] top-0.5 p-1 rounded-full bg-slate-900 border-2 border-indigo-600 text-indigo-600">
                {act.type === 'module_completed' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                {act.type === 'milestone_reached' && <Award className="w-3.5 h-3.5 text-indigo-600" />}
                {act.type === 'assessment_taken' && <Clock className="w-3.5 h-3.5 text-blue-600" />}
              </div>

              <div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-slate-100">{act.title}</span>
                  <span className="text-xs text-slate-400 font-medium">{act.timestamp}</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{act.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
