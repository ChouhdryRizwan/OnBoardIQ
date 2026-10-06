'use client';

import React from 'react';
import { TraceabilityReportItem } from '@/lib/services/reports';
import { CheckCircle2, Link2 } from 'lucide-react';

interface TraceabilityReportProps {
  items: TraceabilityReportItem[];
  loading: boolean;
}

export function TraceabilityReport({ items, loading }: TraceabilityReportProps) {
  if (loading) {
    return (
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm animate-pulse space-y-4">
        <div className="h-6 bg-slate-800 rounded w-1/3"></div>
        <div className="h-32 bg-slate-800/60 rounded"></div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-8 shadow-sm text-center">
        <Link2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-200">No Traceability Records Found</h3>
        <p className="text-sm text-slate-400 mt-1">Traceability links Document Chunk → Requirement → Plan Module → Validation.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-800/60 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Link2 className="w-5 h-5 text-indigo-400" />
            Requirement-to-Source Traceability Audit Matrix ({items.length} Tracked Nodes)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            End-to-end chain of custody: Ground-Truth Requirement → Document Chunk → Module → Deterministic Validation.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 border-b border-slate-800 text-slate-300 font-bold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="p-3.5">Requirement ID</th>
              <th className="p-3.5">Role Code</th>
              <th className="p-3.5">Source Document & Version</th>
              <th className="p-3.5">Section / Chunk ID</th>
              <th className="p-3.5">Assigned Module Title</th>
              <th className="p-3.5">Plan ID</th>
              <th className="p-3.5">Validation Status</th>
              <th className="p-3.5">Human Review</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {items.map((item, idx) => (
              <tr key={`${item.chunk_id}-${idx}`} className="hover:bg-slate-950/80 transition-colors">
                <td className="p-3.5">
                  <span className="font-mono font-bold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/30 text-[11px]">
                    {item.requirement_id}
                  </span>
                </td>
                <td className="p-3.5 font-mono text-slate-300 font-semibold">{item.role_code}</td>
                <td className="p-3.5">
                  <div className="font-bold text-slate-100">{item.source_document_title}</div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    ID: {item.source_document_id} (v{item.source_document_version})
                  </div>
                </td>
                <td className="p-3.5 font-mono text-slate-400">
                  <div>{item.section_id}</div>
                  <div className="text-[10px] text-slate-400 font-mono">Chunk: {item.chunk_id.slice(0, 10)}...</div>
                </td>
                <td className="p-3.5 font-semibold text-slate-100">{item.module_title}</td>
                <td className="p-3.5 font-mono text-slate-400 text-[11px]">{item.plan_id.slice(0, 10)}...</td>
                <td className="p-3.5">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> {item.validation_status}
                  </span>
                </td>
                <td className="p-3.5 font-semibold text-slate-400 capitalize">
                  {item.human_review_status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
