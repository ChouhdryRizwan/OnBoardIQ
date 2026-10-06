'use client';

import React from 'react';
import { ShieldAlert, CheckCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { HumanReviewQueueItem } from '../../../types';

interface TrainingReviewQueueProps {
  reviewQueue: HumanReviewQueueItem[];
  loading: boolean;
  error?: string;
}

export const TrainingReviewQueue: React.FC<TrainingReviewQueueProps> = ({
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
          <h3>Human Review & Approval Queue</h3>
        </div>
        <p className="text-sm text-slate-400">Data unavailable: {error}</p>
      </div>
    );
  }

  const pendingItems = reviewQueue.filter((item) => item.status === 'pending');

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="h-5 w-5 text-rose-400" />
            <h3 className="font-semibold text-slate-100">Review & Approval Queue</h3>
          </div>
          <Link
            href="/review/queue"
            className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {pendingItems.length === 0 ? (
          <div className="py-6 text-center text-slate-400 text-xs">
            <CheckCircle className="h-6 w-6 text-emerald-500/50 mx-auto mb-2" />
            No pending plan reviews in queue. All generated plans meet validation constraints.
          </div>
        ) : (
          <div className="space-y-3">
            {pendingItems.slice(0, 4).map((item) => (
              <div
                key={item.review_id || item.plan_id}
                className="p-3 rounded-lg bg-slate-950/40 border border-slate-800/80 flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-semibold text-slate-200">
                    Plan ID: {item.plan_id} (Role: {item.job_role_id})
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Status: {item.verification_status} • Coverage Score: {Math.round(item.coverage_score * 100)}%
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    Needs Approval
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
