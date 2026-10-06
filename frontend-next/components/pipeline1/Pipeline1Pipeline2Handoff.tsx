'use client';

import React, { useState } from 'react';
import { submitToPipeline2Validation, Pipeline2ValidationHandoffResult } from '@/lib/services/pipeline1';
import { ShieldCheck, ArrowRight, Loader2, CheckCircle2, AlertTriangle, Scale } from 'lucide-react';

interface Pipeline1Pipeline2HandoffProps {
  planId: string;
}

export function Pipeline1Pipeline2Handoff({ planId }: Pipeline1Pipeline2HandoffProps) {
  const [validating, setValidating] = useState(false);
  const [validationReport, setValidationReport] = useState<Pipeline2ValidationHandoffResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleValidateHandoff = async () => {
    if (!confirm('Submit this generated onboarding plan to the independent deterministic Python verification engine (Pipeline 2)?')) {
      return;
    }

    setValidating(true);
    setErrorMsg(null);

    try {
      const res = await submitToPipeline2Validation(planId);
      setValidationReport(res);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Pipeline 2 validation request failed.');
    } finally {
      setValidating(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-xl p-6 shadow-md mb-6 relative overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-1">
            <Scale className="w-4 h-4 text-emerald-400" />
            Next Pipeline Step: Pipeline 2 Deterministic Verification
          </div>
          <h3 className="text-lg font-bold text-white">Independent Ground-Truth Validation Handoff</h3>
          <p className="text-indigo-200 text-xs mt-1 max-w-2xl">
            Submit this generated plan to Python validation algorithms that verify mandatory requirement coverage, detect hallucinated citations, and resolve policy contradictions.
          </p>
        </div>

        <button
          onClick={handleValidateHandoff}
          disabled={validating}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg shadow-md transition-colors disabled:opacity-50 shrink-0"
        >
          {validating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Running Pipeline 2...
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" /> Send to Pipeline 2 Validation <ArrowRight className="w-4 h-4" />
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

      {/* Validation Result Summary Box */}
      {validationReport && (
        <div className="mt-5 p-4 rounded-xl bg-slate-900/10 border border-white/20 text-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Pipeline 2 Report Generated (ID: {validationReport.report_id})
            </span>
            <span className="px-2.5 py-0.5 rounded-full font-bold uppercase bg-emerald-500/30 text-emerald-300 border border-emerald-400/40">
              {validationReport.verification_status}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-indigo-100">
            <div className="p-2.5 rounded bg-black/30 border border-white/10">
              <div className="text-[11px] text-indigo-300">Mandatory Coverage</div>
              <div className="text-base font-bold text-emerald-400 mt-0.5">
                {validationReport.mandatory_coverage_score}%
              </div>
            </div>

            <div className="p-2.5 rounded bg-black/30 border border-white/10">
              <div className="text-[11px] text-indigo-300">Source Traceability</div>
              <div className="text-base font-bold text-indigo-300 mt-0.5">
                {validationReport.source_traceability_score}%
              </div>
            </div>

            <div className="p-2.5 rounded bg-black/30 border border-white/10">
              <div className="text-[11px] text-indigo-300">Hallucination Flags</div>
              <div className="text-base font-bold text-amber-400 mt-0.5">
                {validationReport.unsupported_requirements_count || 0}
              </div>
            </div>

            <div className="p-2.5 rounded bg-black/30 border border-white/10">
              <div className="text-[11px] text-indigo-300">Contradictions</div>
              <div className="text-base font-bold text-amber-400 mt-0.5">
                {validationReport.contradiction_count || 0}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
