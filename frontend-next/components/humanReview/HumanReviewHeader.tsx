'use client';

import React from 'react';
import { Scale, RefreshCw, UserCheck, ShieldCheck } from 'lucide-react';

interface HumanReviewHeaderProps {
  onRefresh: () => void;
  loading: boolean;
  totalPending: number;
}

export function HumanReviewHeader({ onRefresh, loading, totalPending }: HumanReviewHeaderProps) {
  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-lg bg-purple-950/60 text-purple-400 border border-purple-800/60">
              <Scale className="w-5 h-5 text-purple-400" />
            </span>
            <h1 className="text-2xl font-bold text-slate-100">Human Review & Governance Workspace</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-950/60 text-purple-300 border border-purple-800/60 flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-purple-400" />
              Human Oversight Active
            </span>
          </div>
          <p className="text-slate-400 text-sm">
            Inspect generated onboarding plans, evaluate ground-truth validation flags, apply manual overrides, and grant final approval for employee assignment.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 text-sm font-semibold text-slate-300 bg-slate-800/60 hover:bg-slate-800 rounded-lg border border-slate-700/50 transition-colors disabled:opacity-50"
            title="Refresh review queue"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Queue
          </button>
        </div>
      </div>

      {/* Queue Metric Notice */}
      <div className="mt-4 p-3 rounded-lg bg-purple-950/40 border border-purple-800/50 text-xs text-purple-200 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0" />
          <span>
            <strong>Authoritative Governance:</strong> Approved plans automatically assign to the employee learning portal with complete audit trails.
          </span>
        </div>
        <span className="px-2.5 py-1 rounded bg-purple-900/60 text-purple-300 border border-purple-700/60 font-bold shrink-0">
          {totalPending} Pending Items
        </span>
      </div>
    </div>
  );
}
