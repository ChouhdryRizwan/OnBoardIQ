'use client';

import React from 'react';
import { Activity, CheckCircle2, FileUp, ShieldCheck, UserCheck } from 'lucide-react';
import { EmployeeProgressReportItem } from '../../../lib/services/trainingDashboard';
import { HumanReviewQueueItem, PolicyUpdate } from '../../../types';

interface RecentTrainingActivityProps {
  progressItems: EmployeeProgressReportItem[];
  reviewQueue: HumanReviewQueueItem[];
  policyUpdates: PolicyUpdate[];
  loading: boolean;
}

export const RecentTrainingActivity: React.FC<RecentTrainingActivityProps> = ({
  progressItems,
  reviewQueue,
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

  // Combine activity streams into timeline
  const activities: Array<{
    id: string;
    type: 'completion' | 'review' | 'policy' | 'enrollment';
    title: string;
    description: string;
    time: string;
    icon: React.ElementType;
    color: string;
    bgColor: string;
  }> = [];

  // Completed plans
  progressItems
    .filter((emp) => emp.current_status === 'completed')
    .slice(0, 2)
    .forEach((emp) => {
      activities.push({
        id: `comp-${emp.employee_id}`,
        type: 'completion',
        title: `${emp.employee_name} completed training plan`,
        description: `Role: ${emp.role_title || emp.role_code} (100% completed)`,
        time: emp.last_activity_at ? 'Recently' : 'Today',
        icon: CheckCircle2,
        color: 'text-emerald-400',
        bgColor: 'bg-emerald-500/10',
      });
    });

  // Recent review items
  reviewQueue.slice(0, 2).forEach((rev) => {
    activities.push({
      id: `rev-${rev.review_id || rev.plan_id}`,
      type: 'review',
      title: `Plan review status: ${rev.status}`,
      description: `Plan: ${rev.plan_id} • Verification: ${rev.verification_status}`,
      time: rev.submitted_at ? new Date(rev.submitted_at).toLocaleDateString() : 'In queue',
      icon: ShieldCheck,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
    });
  });

  // Recent policy updates
  policyUpdates.slice(0, 2).forEach((pol) => {
    activities.push({
      id: `pol-${pol.update_id || pol.document_id}`,
      type: 'policy',
      title: `Policy doc update v${pol.new_version}`,
      description: `Doc ID: ${pol.document_id} • ${pol.impacted_plans_count} plans impacted`,
      time: pol.detected_at ? new Date(pol.detected_at).toLocaleDateString() : 'Update event',
      icon: FileUp,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10',
    });
  });

  // Active enrollments
  progressItems
    .filter((emp) => emp.current_status === 'on_track')
    .slice(0, 2)
    .forEach((emp) => {
      activities.push({
        id: `enr-${emp.employee_id}`,
        type: 'enrollment',
        title: `${emp.employee_name} active in onboarding`,
        description: `${emp.completed_modules}/${emp.total_modules} modules completed (${Math.round(emp.overall_progress_percentage)}%)`,
        time: 'Active',
        icon: UserCheck,
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/10',
      });
    });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Activity className="h-5 w-5 text-indigo-400" />
          <h3 className="font-semibold text-slate-100">Recent Training Activity</h3>
        </div>
        <span className="text-xs text-slate-400">Real-time event stream</span>
      </div>

      {activities.length === 0 ? (
        <div className="py-6 text-center text-slate-400 text-xs">No recent activity events.</div>
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
