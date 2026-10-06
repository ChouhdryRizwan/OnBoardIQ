'use client';

import React from 'react';
import { ValidationReportResponse } from '@/lib/services/pipeline2';
import { CheckCircle2, ShieldAlert, Scale, Layers } from 'lucide-react';

interface Pipeline2RuleResultsProps {
  report: ValidationReportResponse | null;
}

export function Pipeline2RuleResults({ report }: Pipeline2RuleResultsProps) {
  if (!report) return null;

  const hallucinationCount = report.hallucination_flags?.length || 0;
  const contradictionCount = report.contradiction_flags?.length || 0;

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm mb-6">
      <h2 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
        <Scale className="w-5 h-5 text-indigo-400" />
        Deterministic Python Validation Rules Evaluation
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Rule 1: Mandatory Requirements Coverage */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/50 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              1. Mandatory Ground Truth Coverage
            </h3>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                report.missing_requirements_count === 0
                  ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60'
                  : 'bg-rose-950/60 text-rose-400 border-rose-800/60'
              }`}
            >
              {report.missing_requirements_count === 0 ? 'PASS' : 'FAIL'}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Verifies that 100% of approved mandatory RRM requirements exist within the generated onboarding stages.
          </p>
          <div className="text-xs font-semibold text-slate-200 pt-1">
            Result: {report.covered_mandatory_requirements} / {report.total_mandatory_requirements} Covered ({report.mandatory_coverage_score}%)
          </div>
        </div>

        {/* Rule 2: Citation Accuracy & Hallucination Flags */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/50 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              2. Source Citation & Hallucination Scan
            </h3>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                hallucinationCount === 0
                  ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60'
                  : 'bg-amber-950/60 text-amber-300 border-amber-800/60'
              }`}
            >
              {hallucinationCount === 0 ? 'CLEAN' : `${hallucinationCount} FLAGGED`}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Cross-checks GenAI module citation clauses against active policy documents to detect unsupported or fabricated section claims.
          </p>
          <div className="text-xs font-semibold text-slate-200 pt-1">
            Traceability Score: {report.source_traceability_score}% ({hallucinationCount} flags)
          </div>
        </div>

        {/* Rule 3: Policy Contradiction & Precedence Rule */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/50 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
              <Scale className="w-4 h-4 text-indigo-400" />
              3. Policy Precedence & Contradiction Resolution
            </h3>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                contradictionCount === 0
                  ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60'
                  : 'bg-rose-950/60 text-rose-400 border-rose-800/60'
              }`}
            >
              {contradictionCount === 0 ? 'NO CONFLICTS' : `${contradictionCount} CONFLICTS`}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Evaluates version precedence when multiple policy documents contain conflicting compliance guidelines.
          </p>
          <div className="text-xs font-semibold text-slate-200 pt-1">
            Result: {contradictionCount} contradiction flags detected
          </div>
        </div>

        {/* Rule 4: Structural Deduplication & Consistency */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/50 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-400" />
              4. Module Deduplication & Structural Integrity
            </h3>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                report.duplicate_count === 0
                  ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60'
                  : 'bg-amber-950/60 text-amber-300 border-amber-800/60'
              }`}
            >
              {report.duplicate_count === 0 ? 'OPTIMAL' : `${report.duplicate_count} DUPLICATES`}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Ensures module IDs, task codes, and assessment topics are free of duplicate redundancies across onboarding stages.
          </p>
          <div className="text-xs font-semibold text-slate-200 pt-1">
            Consistency Score: {report.consistency_score}%
          </div>
        </div>
      </div>
    </div>
  );
}
