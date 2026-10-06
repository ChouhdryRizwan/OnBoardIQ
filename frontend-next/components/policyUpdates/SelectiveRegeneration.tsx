'use client';

import React from 'react';
import { RegenerationStatusResponse } from '@/lib/services/policyUpdates';
import { RotateCcw, Play, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';

interface SelectiveRegenerationProps {
  updateId: string;
  onTriggerRegeneration: () => void;
  status: RegenerationStatusResponse | null;
  regenerating: boolean;
  errorMsg: string | null;
}

export function SelectiveRegeneration({
  updateId,
  onTriggerRegeneration,
  status,
  regenerating,
  errorMsg,
}: SelectiveRegenerationProps) {
  const handleConfirmRegeneration = () => {
    if (
      confirm(
        `Execute selective module regeneration for Policy Update '${updateId}'?\n\nThis will trigger Pipeline 1 LLM plan synthesis and Pipeline 2 Python validation for affected modules.`
      )
    ) {
      onTriggerRegeneration();
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-xl p-6 shadow-md mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-1">
            <RotateCcw className="w-4 h-4 text-blue-400" />
            Selective Module Regeneration Control
          </div>
          <h3 className="text-lg font-bold text-white">Trigger Targeted Content Regeneration</h3>
          <p className="text-blue-200 text-xs mt-1 max-w-2xl">
            Only affected modules linked to updated ground-truth policy clauses will be re-synthesized via Gemini LLM (Pipeline 1) and re-validated via Python verification (Pipeline 2). Unaffected content remains intact.
          </p>
        </div>

        <button
          onClick={handleConfirmRegeneration}
          disabled={regenerating || !updateId}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl shadow-lg transition-colors disabled:opacity-50 shrink-0"
        >
          {regenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-white" />
              Regenerating Content...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current text-white" />
              Trigger Selective Regeneration
            </>
          )}
        </button>
      </div>

      {errorMsg && (
        <div className="mt-4 p-3 bg-rose-900/60 border border-rose-500/50 text-rose-100 rounded-lg text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Regeneration Progress Box */}
      {status && (
        <div className="mt-5 p-4 rounded-xl bg-slate-900/10 border border-white/15 text-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Selective Regeneration Status
            </span>
            <span className="px-2.5 py-0.5 rounded-full font-bold uppercase bg-blue-500/30 text-blue-300 border border-blue-400/40">
              {status.status}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-blue-100">
            <div className="p-2.5 rounded bg-black/30 border border-white/10">
              <div className="text-[11px] text-blue-300">Total Affected</div>
              <div className="text-base font-bold text-white mt-0.5">{status.total_affected_modules} Modules</div>
            </div>

            <div className="p-2.5 rounded bg-black/30 border border-white/10">
              <div className="text-[11px] text-blue-300">Regenerated</div>
              <div className="text-base font-bold text-blue-300 mt-0.5">{status.regenerated_count} Modules</div>
            </div>

            <div className="p-2.5 rounded bg-black/30 border border-white/10">
              <div className="text-[11px] text-blue-300">Validated (Pipeline 2)</div>
              <div className="text-base font-bold text-emerald-400 mt-0.5">{status.validated_count} Modules</div>
            </div>

            <div className="p-2.5 rounded bg-black/30 border border-white/10">
              <div className="text-[11px] text-blue-300">Review Required</div>
              <div className="text-base font-bold text-amber-400 mt-0.5">{status.review_required_count} Queue Items</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
