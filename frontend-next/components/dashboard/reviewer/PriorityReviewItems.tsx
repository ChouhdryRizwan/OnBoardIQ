'use client';

import React from 'react';
import { AlertTriangle, ArrowRight, ShieldAlert } from 'lucide-react';
import { ReviewQueueItemResponse } from '../../../lib/services/reviewerDashboard';

interface PriorityReviewItemsProps {
  reviewQueue: ReviewQueueItemResponse[];
  loading: boolean;
  error?: string;
}

export const PriorityReviewItems: React.FC<PriorityReviewItemsProps> = ({
  reviewQueue,
  loading,
  error,
}) => {
  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 animate-pulse">
        <div className="h-6 bg-slate-800 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-slate-800/50 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error && reviewQueue.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center space-x-2 text-slate-300 font-semibold mb-3">
          <ShieldAlert className="h-5 w-5 text-rose-400" />
          <h3>Priority Review Items</h3>
        </div>
        <p className="text-sm text-slate-400">Data unavailable: {error}</p>
      </div>
    );
  }

  // Filter pending items or items with lower coverage scores
  const priorityItems = reviewQueue
    .filter((i) => i.status === 'pending')
    .sort((a, b) => (a.mandatory_coverage_score || 0) - (b.mandatory_coverage_score || 0));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-rose-400" />
          <h3 className="font-semibold text-slate-100">Priority Review Items</h3>
        </div>
        <span className="text-xs font-mono bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2.5 py-1 rounded-full">
          {priorityItems.length} High Priority
        </span>
      </div>

      {priorityItems.length === 0 ? (
        <div className="py-6 text-center text-slate-400 text-xs">
          No urgent high-priority review items currently pending.
        </div>
      ) : (
        <div className="space-y-3">
          {priorityItems.slice(0, 4).map((item) => {
            const covPct = Math.round((item.mandatory_coverage_score || 0) * 100);
            return (
              <div
                key={item.review_id}
                className="p-3 rounded-lg bg-slate-950/40 border border-slate-800/80 flex items-center justify-between hover:border-slate-700 transition-colors"
              >
                <div>
                  <div className="text-xs font-semibold text-slate-200">
                    {item.employee_name || 'Employee'} ({item.role_title})
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Plan ID: <span className="font-mono text-slate-300">{item.plan_id}</span> • Reason: {item.reason_for_review || 'Ground-Truth Verification'}
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-right">
                  <div>
                    <div className="text-xs font-mono font-bold text-amber-400">
                      {covPct}% Coverage
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {item.verification_status}
                    </div>
                  </div>

                  <button
                    onClick={() => alert(`Opening priority item ${item.review_id}`)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                    title="Review Item"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
