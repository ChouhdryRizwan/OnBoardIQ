'use client';

import React from 'react';
import { GenAIPythonComparisonSummary } from '@/lib/services/reports';
import { Cpu, ShieldCheck, CheckCircle2, AlertTriangle, ArrowRightLeft, Sparkles } from 'lucide-react';

interface GenAIVsPythonReportProps {
  data: GenAIPythonComparisonSummary | null;
  loading: boolean;
}

export function GenAIVsPythonReport({ data, loading }: GenAIVsPythonReportProps) {
  if (loading) {
    return (
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm animate-pulse space-y-4">
        <div className="h-6 bg-slate-800 rounded w-1/3"></div>
        <div className="h-32 bg-slate-800/60 rounded"></div>
      </div>
    );
  }

  if (!data || data.items.length === 0) {
    return (
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-8 shadow-sm text-center">
        <ArrowRightLeft className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-200">No Dual-Pipeline Comparison Data</h3>
        <p className="text-sm text-slate-400 mt-1">Run Pipeline 1 GenAI generation & Pipeline 2 Python validation to produce comparative analytics.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dual Pipeline Architecture Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 rounded-xl p-6 text-white shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 rounded bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Pipeline 1: GenAI Synthesis
              </span>
              <span className="text-slate-400 font-bold">VS</span>
              <span className="px-2.5 py-1 rounded bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30 flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-purple-400" /> Pipeline 2: Python Verification
              </span>
            </div>
            <h2 className="text-xl font-bold">Dual-Pipeline Verification & Quality Engine</h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              GenAI generates rich onboarding plans; Python independently validates requirement coverage, mandatory flags, and policy traceability without hallucination risk.
            </p>
          </div>

          <div className="text-right border-t md:border-t-0 border-slate-800 pt-3 md:pt-0">
            <div className="text-xs text-slate-400 uppercase font-bold">Overall Agreement</div>
            <div className="text-3xl font-black text-emerald-400 mt-0.5 font-mono">
              {Math.round(data.agreement_percentage)}%
            </div>
            <div className="text-xs text-slate-300 font-mono">
              {data.agreements_count} Agreements • {data.disagreements_count} Disagreements
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Items Table */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-800/60 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              GenAI Output vs Python Deterministic Ground-Truth Log ({data.items.length} Evaluated Rules)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Side-by-side breakdown of classification, priority, due-stage, and traceability matches.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-300 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3.5">Requirement ID</th>
                <th className="p-3.5">GenAI Classification</th>
                <th className="p-3.5">Python Ground-Truth</th>
                <th className="p-3.5">GenAI vs Python Priority</th>
                <th className="p-3.5">Traceability Match</th>
                <th className="p-3.5">Overall Agreement</th>
                <th className="p-3.5">Validation Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {data.items.map((item, idx) => (
                <tr key={`${item.requirement_id}-${idx}`} className="hover:bg-slate-950/80 transition-colors">
                  <td className="p-3.5 font-mono font-bold text-indigo-400">
                    {item.requirement_id}
                  </td>
                  <td className="p-3.5 font-semibold text-slate-200 capitalize">
                    {item.genai_classification}
                  </td>
                  <td className="p-3.5 font-semibold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 p-2 rounded capitalize">
                    {item.python_classification}
                  </td>
                  <td className="p-3.5">
                    <span className="font-mono text-slate-400">{item.genai_priority}</span> vs{' '}
                    <span className="font-mono text-indigo-400 font-bold">{item.python_priority}</span>
                  </td>
                  <td className="p-3.5">
                    {item.traceability_match ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Matched
                      </span>
                    ) : (
                      <span className="text-rose-400 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Mismatch
                      </span>
                    )}
                  </td>
                  <td className="p-3.5">
                    {item.overall_match ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Agreed
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold bg-rose-500/10 text-rose-300 border border-rose-500/30">
                        <AlertTriangle className="w-3 h-3 mr-1" /> Disagreed
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 font-semibold capitalize text-slate-300">
                    {item.validation_status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
