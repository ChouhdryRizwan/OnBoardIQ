'use client';

import React from 'react';
import { ValidationIssue, HallucinationFlag, ContradictionFlag } from '@/lib/services/pipeline2';
import { AlertOctagon, FileWarning, Scale } from 'lucide-react';

interface Pipeline2ValidationIssuesProps {
  issues: ValidationIssue[];
  hallucinationFlags: HallucinationFlag[];
  contradictionFlags: ContradictionFlag[];
  loading: boolean;
}

export function Pipeline2ValidationIssues({
  issues,
  hallucinationFlags,
  contradictionFlags,
  loading,
}: Pipeline2ValidationIssuesProps) {
  if (loading) {
    return (
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm mb-6 animate-pulse">
        <div className="h-6 bg-slate-800 rounded w-1/3 mb-4"></div>
        <div className="h-16 bg-slate-800/60 rounded"></div>
      </div>
    );
  }

  const hasContent = issues.length > 0 || hallucinationFlags.length > 0 || contradictionFlags.length > 0;

  if (!hasContent) {
    return (
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm mb-6">
        <h2 className="text-lg font-bold text-slate-100 mb-2">Deterministic Validation Issues & Flags</h2>
        <div className="p-4 text-center border border-dashed border-slate-800 rounded-lg text-emerald-400 bg-emerald-950/40 text-xs font-semibold">
          ✓ No validation issues, hallucination flags, or contradiction conflicts detected for this plan.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm mb-6 space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <AlertOctagon className="w-5 h-5 text-rose-400" />
          Deterministic Validation Issues & Security Flags
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Detailed issue findings requiring reviewer attention before plan release
        </p>
      </div>

      {/* Hallucination Flags List */}
      {hallucinationFlags.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
            <FileWarning className="w-4 h-4 text-amber-400" /> Unsupported Claim / Citation Flags ({hallucinationFlags.length})
          </h3>
          <div className="space-y-2">
            {hallucinationFlags.map((hf, i) => (
              <div key={hf.flag_id || i} className="p-3.5 rounded-lg border border-amber-800/50 bg-amber-950/40 text-xs space-y-1">
                <div className="flex items-center justify-between font-bold text-amber-300">
                  <span>Claimed Source: {hf.claimed_source_doc} (Sec {hf.claimed_source_sec})</span>
                  <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-amber-900/60 text-amber-300 border border-amber-700/60">
                    {hf.is_resolved ? 'RESOLVED' : 'ACTIVE FLAG'}
                  </span>
                </div>
                <p className="text-amber-200 font-semibold">{hf.flagged_statement}</p>
                {hf.reason && <p className="text-slate-400 italic">Reason: {hf.reason}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contradiction Flags List */}
      {contradictionFlags.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
            <Scale className="w-4 h-4 text-rose-400" /> Policy Contradiction Conflicts ({contradictionFlags.length})
          </h3>
          <div className="space-y-2">
            {contradictionFlags.map((cf, i) => (
              <div key={cf.contradiction_id || i} className="p-3.5 rounded-lg border border-rose-800/50 bg-rose-950/40 text-xs space-y-2">
                <div className="flex items-center justify-between font-bold text-rose-300">
                  <span>Conflict between {cf.primary_document_id} and {cf.conflicting_document_id}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-rose-900/60 text-rose-300 border border-rose-700/60">
                    Precedence: {cf.applied_precedence_rule || 'Default'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 p-2 bg-slate-950 rounded border border-rose-800/40 text-[11px]">
                  <div>
                    <span className="font-semibold text-rose-400">Primary Clause:</span> {cf.primary_clause}
                  </div>
                  <div>
                    <span className="font-semibold text-rose-400">Conflicting Clause:</span> {cf.conflicting_clause}
                  </div>
                </div>
                {cf.description && <p className="text-slate-300">{cf.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Specific Issue Items List */}
      {issues.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            General Validation Issues ({issues.length})
          </h3>
          <div className="space-y-2">
            {issues.map((iss) => (
              <div key={iss.issue_id} className="p-3.5 rounded-lg border border-slate-800 bg-slate-950 text-xs space-y-1">
                <div className="flex items-center justify-between font-bold">
                  <span className="font-mono text-indigo-300">{iss.requirement_id || iss.issue_type}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-rose-950/60 text-rose-300 border border-rose-800/60">
                    {iss.severity}
                  </span>
                </div>
                <p className="text-slate-200 leading-relaxed">{iss.explanation}</p>
                {(iss.expected_value || iss.generated_value) && (
                  <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1 border-t border-slate-800/60 font-mono">
                    <span>Expected: <strong className="text-emerald-400">{iss.expected_value}</strong></span>
                    <span>•</span>
                    <span>Generated: <strong className="text-amber-400">{iss.generated_value}</strong></span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
