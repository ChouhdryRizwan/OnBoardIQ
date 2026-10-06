'use client';

import React from 'react';
import { UpcomingActivityItem } from '@/lib/services/employeeDashboard';
import { ListTodo, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface EmployeeActionItemsProps {
  upcomingActivities: UpcomingActivityItem[];
  pendingModulesCount: number;
  loading: boolean;
}

export function EmployeeActionItems({
  upcomingActivities,
  pendingModulesCount,
  loading,
}: EmployeeActionItemsProps) {
  if (loading) {
    return (
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="h-12 bg-slate-800/60 rounded mb-2"></div>
        <div className="h-12 bg-slate-800/60 rounded"></div>
      </div>
    );
  }

  const activities = upcomingActivities || [];

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <ListTodo className="w-5 h-5 text-indigo-600" />
            Pending Action Items
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Immediate tasks requiring your attention to keep onboarding on schedule
          </p>
        </div>
        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
          {activities.length + (pendingModulesCount > 0 ? 1 : 0)} Pending
        </span>
      </div>

      {activities.length === 0 && pendingModulesCount === 0 ? (
        <div className="p-6 text-center border border-dashed border-slate-800 rounded-lg text-slate-400 text-sm">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
          <p className="font-semibold text-slate-300">All caught up!</p>
          <p className="text-xs text-slate-400 mt-0.5">No pending action items requiring immediate attention.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pendingModulesCount > 0 && (
            <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-950 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <div>
                  <div className="text-sm font-semibold text-slate-100">Complete Assigned Modules</div>
                  <div className="text-xs text-slate-400">
                    You have {pendingModulesCount} module(s) remaining in your training queue.
                  </div>
                </div>
              </div>
              <a
                href="/employee/learning"
                className="px-3 py-1 text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg transition-colors"
              >
                Go to Modules
              </a>
            </div>
          )}

          {activities.map((act) => (
            <div
              key={act.activity_id}
              className="p-3.5 rounded-lg border border-slate-800 bg-slate-950 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                {act.is_mandatory ? (
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                ) : (
                  <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                )}
                <div>
                  <div className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                    {act.title}
                    {act.is_mandatory && (
                      <span className="px-1.5 py-0.5 text-[10px] uppercase font-bold bg-amber-100 text-amber-800 rounded">
                        Mandatory
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Target Stage: {act.due_stage} • Type: {act.activity_type}
                  </div>
                </div>
              </div>
              <span className="text-xs font-medium text-slate-400 bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
                Action Required
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
