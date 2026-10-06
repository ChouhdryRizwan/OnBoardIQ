'use client';

import React from 'react';
import { RequirementComparisonDetail } from '@/lib/services/pipeline2';
import { CheckCircle2, XCircle, FileCode } from 'lucide-react';

interface Pipeline2RequirementCoverageProps {
  comparisonDetails: RequirementComparisonDetail[];
  loading: boolean;
}

export function Pipeline2RequirementCoverage({
  comparisonDetails,
  loading,
}: Pipeline2RequirementCoverageProps) {
  if (loading) {
    return (
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm mb-6 animate-pulse">
        <div className="h-6 bg-slate-800 rounded w-1/3 mb-4"></div>
        <div className="h-20 bg-slate-800/60 rounded"></div>
      </div>
    );
  }

  if (!comparisonDetails || comparisonDetails.length === 0) {
    return (
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm mb-6">
        <h2 className="text-lg font-bold text-slate-100 mb-2">Ground Truth vs GenAI Requirement Comparison</h2>
        <div className="p-4 text-center border border-dashed border-slate-800 rounded-lg text-slate-400 text-xs">
          No detailed requirement comparison items recorded for this validation run.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm mb-6">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <FileCode className="w-5 h-5 text-indigo-400" />
            Ground Truth RRM vs GenAI Requirement Comparison ({comparisonDetails.length})
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Deterministic Python verification matching GenAI citations against Python expected ground truth
          </p>
        </div>
      </div>

      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
        {comparisonDetails.map((cd, idx) => {
          const isMatch = cd.match_result === 'match' || cd.match_result === 'MATCH';

          return (
            <div
              key={cd.comparison_id || idx}
              className={`p-4 rounded-xl border text-xs space-y-2.5 transition-colors ${
                isMatch ? 'bg-slate-950/50 border-slate-800' : 'bg-rose-950/20 border-rose-900/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold px-2 py-0.5 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-800/60">
                    {cd.requirement_id}
                  </span>
                  {cd.python_expected_mandatory && (
                    <span className="px-2 py-0.5 text-[10px] uppercase font-bold bg-amber-950/60 text-amber-300 border border-amber-800/60 rounded">
                      Mandatory
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 font-bold uppercase text-[11px]">
                  {isMatch ? (
                    <span className="flex items-center gap-1 text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-800/60">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Match (Covered)
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-rose-400 bg-rose-950/60 px-2.5 py-0.5 rounded-full border border-rose-800/60">
                      <XCircle className="w-3.5 h-3.5" /> Mismatch / Disagreement
                    </span>
                  )}
                </div>
              </div>

              {/* Side-by-Side Comparison Box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-[11px]">
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                  <div className="font-bold text-slate-400 uppercase text-[10px]">
                    Python Expected Ground Truth
                  </div>
                  <div>
                    Document: <strong className="font-mono text-slate-200">{cd.python_expected_source_doc || 'N/A'}</strong>
                  </div>
                  <div>
                    Section: <strong className="font-mono text-slate-200">{cd.python_expected_source_sec || 'N/A'}</strong>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                  <div className="font-bold text-slate-400 uppercase text-[10px]">
                    GenAI Plan Output Citation
                  </div>
                  <div>
                    Document: <strong className="font-mono text-slate-200">{cd.genai_output_source_doc || 'Missing / Unsupported'}</strong>
                  </div>
                  <div>
                    Section: <strong className="font-mono text-slate-200">{cd.genai_output_source_sec || 'N/A'}</strong>
                  </div>
                </div>
              </div>

              {/* Disagreement explanation if any */}
              {cd.disagreement_explanation && !isMatch && (
                <div className="p-2.5 rounded-lg bg-rose-950/60 border border-rose-800/60 text-rose-200 text-[11px] font-medium">
                  <strong>Validation Disagreement:</strong> {cd.disagreement_explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
