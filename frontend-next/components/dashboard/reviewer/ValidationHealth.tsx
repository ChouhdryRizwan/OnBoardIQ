'use client';

import React from 'react';
import { ShieldCheck, CheckCircle2, XCircle, AlertTriangle, Cpu } from 'lucide-react';
import {
  GenAIPythonComparisonSummary,
  HallucinationReportItem,
  TraceabilityReportItem,
} from '../../../lib/services/reviewerDashboard';

interface ValidationHealthProps {
  comparison: GenAIPythonComparisonSummary | null;
  validationIssues: HallucinationReportItem[];
  traceability: TraceabilityReportItem[];
  loading: boolean;
  error?: string;
}

export const ValidationHealth: React.FC<ValidationHealthProps> = ({
  comparison,
  validationIssues,
  traceability,
  loading,
  error,
}) => {
  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 animate-pulse">
        <div className="h-6 bg-slate-800 rounded w-1/3 mb-4"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="h-14 bg-slate-800/50 rounded"></div>
          <div className="h-14 bg-slate-800/50 rounded"></div>
          <div className="h-14 bg-slate-800/50 rounded"></div>
          <div className="h-14 bg-slate-800/50 rounded"></div>
        </div>
      </div>
    );
  }

  if (error && !comparison) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center space-x-2 text-slate-300 font-semibold mb-3">
          <ShieldCheck className="h-5 w-5 text-indigo-400" />
          <h3>Pipeline 2 Deterministic Validation Health</h3>
        </div>
        <p className="text-sm text-slate-400">Data unavailable: {error}</p>
      </div>
    );
  }

  const totalValidated = comparison?.total_plans_evaluated ?? 'Unavailable';
  const passedCount = comparison?.full_agreement_count ?? 'Unavailable';
  const failedCount = comparison?.severe_discrepancy_count ?? 'Unavailable';
  const warningCount = comparison?.partial_disagreement_count ?? 'Unavailable';

  const unsupportedCount = validationIssues.filter((v) => v.flag_type === 'unsupported_claim').length;
  const contradictionCount = validationIssues.filter((v) => v.flag_type === 'contradiction').length;
  const untraceableCount = traceability.filter((t) => !t.is_verified_traceable).length;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Cpu className="h-5 w-5 text-indigo-400" />
            <h3 className="font-semibold text-slate-100">Pipeline 2 Ground-Truth Validation</h3>
          </div>
          <span className="text-xs font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-1 rounded-full">
            Independent Python Engine
          </span>
        </div>

        <p className="text-xs text-slate-400 mb-4">
          Deterministic validation verifies AST structure, mandatory coverage, document traceability, and prerequisite chains.
        </p>

        {/* 4 Core metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 text-center">
            <div className="text-[10px] text-slate-400 font-medium uppercase">Total Evaluated</div>
            <div className="text-xl font-bold text-slate-100 font-mono mt-0.5">{totalValidated}</div>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 text-center">
            <div className="text-[10px] text-slate-400 font-medium uppercase">Passed</div>
            <div className="text-xl font-bold text-emerald-400 font-mono mt-0.5 flex items-center justify-center space-x-1">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{passedCount}</span>
            </div>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 text-center">
            <div className="text-[10px] text-slate-400 font-medium uppercase">Warning / Flagged</div>
            <div className="text-xl font-bold text-amber-400 font-mono mt-0.5 flex items-center justify-center space-x-1">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{warningCount}</span>
            </div>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 text-center">
            <div className="text-[10px] text-slate-400 font-medium uppercase">Failed</div>
            <div className="text-xl font-bold text-rose-400 font-mono mt-0.5 flex items-center justify-center space-x-1">
              <XCircle className="h-4 w-4 shrink-0" />
              <span>{failedCount}</span>
            </div>
          </div>
        </div>

        {/* Breakdown of issue types */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-slate-300">Ground-Truth Defect Breakdown</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Unsupported Claims</span>
              <span className="font-mono font-bold text-amber-400">{unsupportedCount}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Policy Contradictions</span>
              <span className="font-mono font-bold text-rose-400">{contradictionCount}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Untraceable Sources</span>
              <span className="font-mono font-bold text-yellow-400">{untraceableCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
