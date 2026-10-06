'use client';

import React from 'react';
import { RefreshCw, RotateCcw, FileText, Cpu } from 'lucide-react';

interface PolicyUpdatesHeaderProps {
  onRefresh: () => void;
  loading: boolean;
  totalUpdates: number;
}

export function PolicyUpdatesHeader({ onRefresh, loading, totalUpdates }: PolicyUpdatesHeaderProps) {
  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <RotateCcw className="w-5 h-5 text-blue-400" />
            </span>
            <h1 className="text-2xl font-bold text-slate-100">Policy Updates & Impact Analysis</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-blue-400" />
              Selective Regeneration Engine
            </span>
          </div>
          <p className="text-slate-400 text-sm">
            Detect company policy document version updates, measure deterministic RRM impact across roles and plans, and execute targeted GenAI plan updates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 text-sm font-semibold text-slate-300 bg-slate-800/60 hover:bg-slate-800 hover:text-slate-100 border border-slate-700 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh policy updates"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
        </div>
      </div>

      <div className="mt-4 p-3 rounded-lg bg-blue-950/40 border border-blue-800/60 text-xs text-blue-300 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-400 shrink-0" />
          <span>
            <strong className="text-blue-200">Deterministic Version Propagation:</strong> Document updates automatically propagate through RRM ground truth to identify affected employee modules without regenerating unaffected content.
          </span>
        </div>
        <span className="px-2.5 py-1 rounded bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30 shrink-0">
          {totalUpdates} Active Policy Updates
        </span>
      </div>
    </div>
  );
}
