'use client';

import React from 'react';
import { Activity, CheckCircle2, FileUp, UserCheck, Award } from 'lucide-react';
import {
  EmployeeProgressReportItem,
  AssessmentReportSummary,
  AssessmentReportItem,
  PolicyUpdateSummaryResponse,
} from '../../../lib/services/managerDashboard';

interface RecentTeamActivityProps {
  progressItems: EmployeeProgressReportItem[];
  assessments: AssessmentReportSummary | null;
  policyUpdates: PolicyUpdateSummaryResponse[];
  loading: boolean;
}

export const RecentTeamActivity: React.FC<RecentTeamActivityProps> = ({
  progressItems,
  assessments,
  policyUpdates,
  loading,
}) => {
  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 animate-pulse">
        <div className="h-6 bg-slate-800 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-10 bg-slate-800/50 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  const activities: Array<{
    id: string;
    title: string;
    description: string;
    time: string;
    icon: React.ElementType;
    color: string;
    bgColor: string;
  }> = [];

  // 1. Completed training
  progressItems
    .filter((emp) => emp.current_status === 'completed')
    .slice(0, 2)
    .forEach((emp) => {
      activities.push({
        id: `act-comp-${emp.employee_id}`,
        title: `${emp.employee_name} completed training plan`,
        description: `Role: ${emp.role_title || emp.role_code} (100% completed)`,
        time: emp.last_activity_at ? 'Recently' : 'Today',
        icon: CheckCircle2,
        color: 'text-emerald-400',
        bgColor: 'bg-emerald-500/10',
      });
    });

  // 2. Assessment attempt
  if (assessments?.items) {
    assessments.items.slice(0, 2).forEach((item: AssessmentReportItem, idx: number) => {
      activities.push({
        id: `act-quiz-${idx}`,
        title: `${item.employee_name} completed assessment`,
        description: `Topic: ${item.module_title || item.assessment_topic} (${item.latest_score}%)`,
        time: item.completion_date ? new Date(item.completion_date).toLocaleDateString() : 'Recent attempt',
        icon: Award,
        color: 'text-sky-400',
        bgColor: 'bg-sky-500/10',
      });
    });
  }

  // 3. Active progress
  progressItems
    .filter((emp) => emp.current_status === 'on_track')
    .slice(0, 2)
    .forEach((emp) => {
      activities.push({
        id: `act-on-${emp.employee_id}`,
        title: `${emp.employee_name} active in onboarding`,
        description: `Completed ${emp.completed_modules}/${emp.total_modules} modules (${Math.round(emp.overall_progress_percentage)}%)`,
        time: 'Active',
        icon: UserCheck,
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/10',
      });
    });

  // 4. Policy updates
  policyUpdates.slice(0, 1).forEach((pol) => {
    activities.push({
      id: `act-pol-${pol.update_id || pol.document_id}`,
      title: `Policy updated: ${pol.document_title || pol.document_id}`,
      description: `v${pol.old_version} → v${pol.new_version} (${pol.affected_employees_count} employees impacted)`,
      time: pol.detected_at ? new Date(pol.detected_at).toLocaleDateString() : 'Update event',
      icon: FileUp,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10',
    });
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Activity className="h-5 w-5 text-indigo-400" />
          <h3 className="font-semibold text-slate-100">Recent Team Activity Stream</h3>
        </div>
        <span className="text-xs text-slate-400">Activity log</span>
      </div>

      {activities.length === 0 ? (
        <div className="py-6 text-center text-slate-400 text-xs">No recent team activity events logged.</div>
      ) : (
        <div className="relative border-l border-slate-800 ml-3 pl-4 space-y-4 py-1">
          {activities.slice(0, 5).map((act) => {
            const Icon = act.icon;
            return (
              <div key={act.id} className="relative">
                <div
                  className={`absolute -left-[23px] top-0.5 p-1 rounded-full ${act.bgColor} border border-slate-900`}
                >
                  <Icon className={`h-3.5 w-3.5 ${act.color}`} />
                </div>
                <div className="text-xs">
                  <div className="font-medium text-slate-200 flex items-center justify-between">
                    <span>{act.title}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{act.time}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{act.description}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
