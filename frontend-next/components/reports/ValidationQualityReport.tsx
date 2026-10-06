'use client';

import React from 'react';
import { HallucinationReportItem } from '@/lib/services/reports';
import { AlertTriangle, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface ValidationQualityReportProps {
  items: HallucinationReportItem[];
  loading: boolean;
}

export function ValidationQualityReport({ items, loading }: ValidationQualityReportProps) {
  if (loading) {
    return (
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm animate-pulse space-y-4">
        <div className="h-6 bg-slate-800 rounded w-1/3"></div>
        <div className="h-32 bg-slate-800/60 rounded"></div>
      </div>
    );
  }

  const criticalCount = items.filter((i) => i.severity === 'critical' || i.severity === 'high').length;

  return (
    <div className="space-y-6">
      {/* Notice Hero */}
      <div className="bg-amber-950/40 rounded-xl border border-amber-800/60 p-5 flex items-start gap-4 text-amber-300">
        <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400 border border-amber-500/20 flex-shrink-0">
          <ShieldAlert className="w-6 h-6 text-amber-400" />
        </div>
        <div>
          <h3 className="font-bold text-amber-200 text-sm">
            Pipeline 2 Deterministic Rule Verification Results ({items.length} Active Flagged Issues)
          </h3>
          <p className="text-xs text-amber-300/80 mt-1 leading-relaxed">
            Every GenAI onboarding plan is independently parsed by Pipeline 2 Python verification rules. Flagged statements, missing policy citations, and unsupported content are trapped before deployment.
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-800/60 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              Validation Quality & Hallucination Flag Log
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Deterministic rule checks for GenAI hallucinations, policy contradictions, and missing traceability.
            </p>
          </div>

          <span className="text-xs font-bold text-rose-300 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/30 font-mono">
            {criticalCount} High/Critical Risk
          </span>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-200">Zero Validation Flags Detected</p>
            <p className="text-xs text-slate-400 mt-1">All generated content strictly matches ground-truth policy documents.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 border-b border-slate-800 text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3.5">Flag Type & Severity</th>
                  <th className="p-3.5">Learner & Plan ID</th>
                  <th className="p-3.5">Module & Requirement</th>
                  <th className="p-3.5">Flagged Statement</th>
                  <th className="p-3.5">Deterministic Reason</th>
                  <th className="p-3.5">Review Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {items.map((item, idx) => {
                  const isCritical = item.severity === 'critical' || item.severity === 'high';
                  return (
                    <tr key={`${item.plan_id}-${idx}`} className="hover:bg-slate-950/80 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                            isCritical ? 'bg-rose-500/10 text-rose-300 border-rose-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          }`}>
                            {item.severity}
                          </span>
                        </div>
                        <div className="font-bold text-slate-100 text-xs mt-1 capitalize">
                          {item.flag_type.replace(/_/g, ' ')}
                        </div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-slate-100">{item.employee_name}</div>
                        <div className="text-[11px] font-mono text-slate-400">Plan: {item.plan_id.slice(0, 8)}...</div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-100">{item.module_title || 'N/A'}</div>
                        <div className="text-[11px] font-mono text-indigo-400">{item.requirement_id || 'N/A'}</div>
                      </td>
                      <td className="p-3.5 font-mono text-slate-200 bg-slate-950 p-2 rounded border border-slate-800/60 max-w-xs text-[11px]">
                        &quot;{item.flagged_statement}&quot;
                      </td>
                      <td className="p-3.5 text-slate-400 max-w-xs">{item.reason}</td>
                      <td className="p-3.5">
                        <span className="font-semibold capitalize px-2.5 py-1 rounded bg-slate-800/60 text-slate-300">
                          {item.review_status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
