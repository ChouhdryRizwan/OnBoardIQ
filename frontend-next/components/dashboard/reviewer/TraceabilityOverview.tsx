'use client';

import React from 'react';
import { Search, CheckCircle2, AlertCircle, FileText } from 'lucide-react';
import { TraceabilityReportItem } from '../../../lib/services/reviewerDashboard';

interface TraceabilityOverviewProps {
  items: TraceabilityReportItem[];
  loading: boolean;
  error?: string;
}

export const TraceabilityOverview: React.FC<TraceabilityOverviewProps> = ({
  items,
  loading,
  error,
}) => {
  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 animate-pulse">
        <div className="h-6 bg-slate-800 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-10 bg-slate-800/50 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error && items.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center space-x-2 text-slate-300 font-semibold mb-3">
          <Search className="h-5 w-5 text-indigo-400" />
          <h3>Traceability & Source Evidence</h3>
        </div>
        <p className="text-sm text-slate-400">Data unavailable: {error}</p>
      </div>
    );
  }

  const verifiedCount = items.filter((i) => i.is_verified_traceable).length;
  const total = items.length;
  const traceRate = total > 0 ? Math.round((verifiedCount / total) * 100) : 0;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Search className="h-5 w-5 text-indigo-400" />
            <h3 className="font-semibold text-slate-100">Traceability & Source Evidence</h3>
          </div>
          <span className="text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full">
            {traceRate}% Traceable
          </span>
        </div>

        {total === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">No traceability data available.</p>
        ) : (
          <div className="space-y-3">
            {items.slice(0, 5).map((item, idx) => (
              <div
                key={item.requirement_id || idx}
                className="p-3 rounded-lg bg-slate-950/40 border border-slate-800/80 flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-200">
                      {item.requirement_title}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Role: {item.role_title || item.role_code} • Doc: {item.source_document_title || item.source_document_id}
                    </div>
                    {item.source_section_heading && (
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        Section: {item.source_section_heading} {item.page_number ? `(p. ${item.page_number})` : ''}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {item.is_verified_traceable ? (
                    <span className="inline-flex items-center text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded font-mono">
                      <CheckCircle2 className="h-3 w-3 mr-1" /> Verified Link
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded font-mono">
                      <AlertCircle className="h-3 w-3 mr-1" /> Missing Source
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
