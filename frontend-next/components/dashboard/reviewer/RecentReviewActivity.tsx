'use client';

import React from 'react';
import { Activity, CheckCircle2, XCircle, Edit } from 'lucide-react';
import { ReviewQueueItemResponse } from '../../../lib/services/reviewerDashboard';

interface RecentReviewActivityProps {
  reviewQueue: ReviewQueueItemResponse[];
  loading: boolean;
}

export const RecentReviewActivity: React.FC<RecentReviewActivityProps> = ({
  reviewQueue,
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

  // Filter resolved items
  const resolvedItems = reviewQueue.filter((item) => item.status !== 'pending');

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Activity className="h-5 w-5 text-indigo-400" />
          <h3 className="font-semibold text-slate-100">Recent Audit & Review Activity</h3>
        </div>
        <span className="text-xs text-slate-400">Audit trail log</span>
      </div>

      {resolvedItems.length === 0 ? (
        <div className="py-6 text-center text-slate-400 text-xs">
          No review activity logged yet. Pending items are waiting in the queue.
        </div>
      ) : (
        <div className="relative border-l border-slate-800 ml-3 pl-4 space-y-4 py-1">
          {resolvedItems.slice(0, 5).map((item) => {
            const isApproved = item.status === 'approved';
            const isRejected = item.status === 'rejected';

            const Icon = isApproved ? CheckCircle2 : isRejected ? XCircle : Edit;
            const color = isApproved ? 'text-emerald-400' : isRejected ? 'text-rose-400' : 'text-blue-400';
            const bgColor = isApproved ? 'bg-emerald-500/10' : isRejected ? 'bg-rose-500/10' : 'bg-blue-500/10';

            return (
              <div key={item.review_id} className="relative">
                <div
                  className={`absolute -left-[23px] top-0.5 p-1 rounded-full ${bgColor} border border-slate-900`}
                >
                  <Icon className={`h-3.5 w-3.5 ${color}`} />
                </div>
                <div className="text-xs">
                  <div className="font-medium text-slate-200 flex items-center justify-between">
                    <span>
                      Plan <strong className="font-mono">{item.plan_id}</strong> {item.status}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {item.resolved_at ? new Date(item.resolved_at).toLocaleDateString() : 'Recently'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Employee: {item.employee_name || 'N/A'} • Role: {item.role_title} • Reviewer: {item.assigned_reviewer_id || 'System Admin'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
