'use client';

import React from 'react';
import { ShieldCheck, RefreshCw, Cpu, CheckSquare } from 'lucide-react';

interface Pipeline2HeaderProps {
  onRefresh: () => void;
  loading: boolean;
}

export function Pipeline2Header({ onRefresh, loading }: Pipeline2HeaderProps) {
  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-lg bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </span>
            <h1 className="text-2xl font-bold text-slate-100">Pipeline 2 — Deterministic Validation</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 flex items-center gap-1">
              <Cpu className="w-3 h-3 text-emerald-400" />
              Python Engine
            </span>
          </div>
          <p className="text-slate-400 text-sm">
            Independently verify generated onboarding plans against organizational ground truth, verifying mandatory coverage and detecting hallucinated citations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 text-sm font-semibold text-slate-300 bg-slate-800/60 hover:bg-slate-800 rounded-lg border border-slate-700/50 transition-colors disabled:opacity-50"
            title="Refresh validation data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
        </div>
      </div>

      {/* Informational Ground Truth Notice */}
      <div className="mt-4 p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/50 text-xs text-emerald-300 flex items-start gap-2">
        <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Deterministic Python Verification:</span> Pipeline 2 runs non-LLM Python algorithms to independently cross-reference plan output against approved RRM policy matrices. It never uses LLM self-evaluation.
        </div>
      </div>
    </div>
  );
}
