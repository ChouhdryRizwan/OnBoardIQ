'use client';

import React from 'react';
import { CheckCircle2, XCircle, Edit, ShieldAlert } from 'lucide-react';
import { ReviewQueueItemResponse } from '../../../lib/services/reviewerDashboard';

interface ReviewerDecisionSummaryProps {
  reviewQueue: ReviewQueueItemResponse[];
  loading: boolean;
  error?: string;
}

export const ReviewerDecisionSummary: React.FC<ReviewerDecisionSummaryProps> = ({
  reviewQueue,
  loading,
  error,
}) => {
  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 animate-pulse">
        <div className="h-6 bg-slate-800 rounded w-1/3 mb-4"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="h-14 bg-slate-800/50 rounded"></div>
          <div className="h-14 bg-slate-800/50 rounded"></div>
          <div className="h-14 bg-slate-800/50 rounded"></div>
          <div className="h-14 bg-slate-800/50 rounded"></div>
        </div>
      </div>
    );
  }

  if (error && reviewQueue.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center space-x-2 text-slate-300 font-semibold mb-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          <h3>Reviewer Decisions Summary</h3>
        </div>
        <p className="text-sm text-slate-400">Data unavailable: {error}</p>
      </div>
    );
  }

  const approved = reviewQueue.filter((i) => i.status === 'approved').length;
  const rejected = reviewQueue.filter((i) => i.status === 'rejected').length;
  const edited = reviewQueue.filter((i) => i.status === 'edited').length;
  const pending = reviewQueue.filter((i) => i.status === 'pending').length;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          <h3 className="font-semibold text-slate-100">Reviewer Decisions Summary</h3>
        </div>
        <span className="text-xs font-mono bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full">
          {reviewQueue.length} Total Processed
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3.5 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-400 font-medium uppercase">Approved</div>
            <div className="text-xl font-bold text-emerald-400 font-mono mt-0.5">{approved}</div>
          </div>
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
          </div>
        </div>

        <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3.5 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-400 font-medium uppercase">Rejected</div>
            <div className="text-xl font-bold text-rose-400 font-mono mt-0.5">{rejected}</div>
          </div>
          <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
            <XCircle className="h-4 w-4" />
          </div>
        </div>

        <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3.5 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-400 font-medium uppercase">Edited</div>
            <div className="text-xl font-bold text-blue-400 font-mono mt-0.5">{edited}</div>
          </div>
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
            <Edit className="h-4 w-4" />
          </div>
        </div>

        <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3.5 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-400 font-medium uppercase">Pending</div>
            <div className="text-xl font-bold text-amber-400 font-mono mt-0.5">{pending}</div>
          </div>
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
            <ShieldAlert className="h-4 w-4" />
          </div>
        </div>
      </div>
    </div>
  );
};
