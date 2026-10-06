'use client';

import React from 'react';
import { ShieldCheck, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { MandatoryTrainingReportItem } from '../../../lib/services/trainingDashboard';

interface MandatoryTrainingProps {
  items: MandatoryTrainingReportItem[];
  loading: boolean;
  error?: string;
}

export const MandatoryTraining: React.FC<MandatoryTrainingProps> = ({ items, loading, error }) => {
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
          <ShieldCheck className="h-5 w-5 text-amber-400" />
          <h3>Mandatory Compliance Training</h3>
        </div>
        <p className="text-sm text-slate-400">Data unavailable: {error}</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="h-5 w-5 text-amber-400" />
          <h3 className="font-semibold text-slate-100">Mandatory Compliance Requirements</h3>
        </div>
        <span className="text-xs font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-full">
          {items.length} Mandatory Modules
        </span>
      </div>

      {items.length === 0 ? (
        <div className="py-8 text-center text-slate-400 text-xs">
          No mandatory training requirement items found.
        </div>
      ) : (
        <div className="space-y-3">
          {items.slice(0, 5).map((item, idx) => (
            <div
              key={item.requirement_id || idx}
              className="p-3 rounded-lg bg-slate-950/40 border border-slate-800/80 flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-medium text-slate-200">
                    {item.requirement_title}
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center space-x-2 mt-0.5">
                    <span>Role: {item.role_title || item.role_code}</span>
                    <span>•</span>
                    <span>Doc ID: {item.source_document_id || 'Ref Standard'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {item.completion_status === 'completed' ? (
                  <span className="inline-flex items-center text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded font-mono">
                    <CheckCircle2 className="h-3 w-3 mr-1" /> Verified Complete
                  </span>
                ) : (
                  <span className="inline-flex items-center text-[11px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded font-mono">
                    <AlertCircle className="h-3 w-3 mr-1" /> Compliance Pending
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
