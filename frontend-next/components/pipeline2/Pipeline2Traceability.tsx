'use client';

import React from 'react';
import { ValidationReportResponse } from '@/lib/services/pipeline2';
import { ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface Pipeline2TraceabilityProps {
  report: ValidationReportResponse | null;
}

export function Pipeline2Traceability({ report }: Pipeline2TraceabilityProps) {
  if (!report) return null;

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm mb-6">
      <h2 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
        <ShieldCheck className="w-5 h-5 text-indigo-600" />
        End-to-End Ground Truth Traceability Chain
      </h2>

      <div className="p-4 rounded-xl bg-slate-900 text-white space-y-4">
        <div className="text-xs text-slate-300">
          OnBoardIQ maintains verifiable proof of compliance through 4 deterministic verification stages:
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          {/* Step 1 */}
          <div className="p-3 rounded-lg bg-slate-900/10 border border-white/10 space-y-1">
            <div className="text-emerald-400 font-bold uppercase text-[10px] tracking-wider">Step 1: Source PDF</div>
            <div className="font-bold text-white">Policy Documents</div>
            <div className="text-slate-300 text-[11px]">SOP & Policy PDF Documents</div>
          </div>

          {/* Step 2 */}
          <div className="p-3 rounded-lg bg-slate-900/10 border border-white/10 space-y-1">
            <div className="text-emerald-400 font-bold uppercase text-[10px] tracking-wider">Step 2: Ground Truth</div>
            <div className="font-bold text-white">RRM Matrix</div>
            <div className="text-slate-300 text-[11px]">Mandatory & Must-Know Reqs</div>
          </div>

          {/* Step 3 */}
          <div className="p-3 rounded-lg bg-slate-900/10 border border-white/10 space-y-1">
            <div className="text-amber-400 font-bold uppercase text-[10px] tracking-wider">Step 3: Pipeline 1</div>
            <div className="font-bold text-white">Gemini LLM Plan</div>
            <div className="text-slate-300 text-[11px]">Stages, Modules, Tasks, Quizzes</div>
          </div>

          {/* Step 4 */}
          <div className="p-3 rounded-lg bg-slate-900/10 border border-white/10 space-y-1">
            <div className="text-indigo-400 font-bold uppercase text-[10px] tracking-wider">Step 4: Pipeline 2</div>
            <div className="font-bold text-white">Python Verification</div>
            <div className="text-slate-300 text-[11px]">Deterministic Match: {report.source_traceability_score}%</div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs text-slate-300">
          <span>Target Employee ID: <strong className="text-white font-mono">{report.employee_id}</strong></span>
          <span className="flex items-center gap-1 text-emerald-400 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" /> Verification Report ID: {report.report_id} <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
}
