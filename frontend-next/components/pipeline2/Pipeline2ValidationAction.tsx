'use client';

import React from 'react';
import { ShieldCheck, Play, Loader2, AlertCircle } from 'lucide-react';

interface Pipeline2ValidationActionProps {
  planId: string;
  onRunValidation: () => void;
  validating: boolean;
  errorMsg: string | null;
}

export function Pipeline2ValidationAction({
  planId,
  onRunValidation,
  validating,
  errorMsg,
}: Pipeline2ValidationActionProps) {
  const handleConfirmRun = () => {
    if (
      confirm(
        `Execute Pipeline 2 Independent Deterministic Python Verification Engine for Plan ID '${planId}'?`
      )
    ) {
      onRunValidation();
    }
  };

  return (
    <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-xl p-6 shadow-md mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            Independent Verification Trigger
          </div>
          <h3 className="text-lg font-bold text-white">Execute Deterministic Python Validation</h3>
          <p className="text-slate-300 text-xs mt-1 max-w-2xl">
            Runs deterministic Python logic to verify mandatory ground-truth coverage, check citation accuracy against uploaded policy PDFs, and detect precedence conflicts.
          </p>
        </div>

        <button
          onClick={handleConfirmRun}
          disabled={validating || !planId}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl shadow-lg transition-colors disabled:opacity-50 shrink-0"
        >
          {validating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-white" />
              Running Python Engine...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              Run Deterministic Validation
            </>
          )}
        </button>
      </div>

      {errorMsg && (
        <div className="mt-4 p-3 bg-rose-900/60 border border-rose-500/50 text-rose-100 rounded-lg text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
