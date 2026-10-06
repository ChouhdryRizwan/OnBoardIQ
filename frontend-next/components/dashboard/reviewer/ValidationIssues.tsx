'use client';

import React from 'react';
import { AlertTriangle, AlertCircle, ShieldAlert } from 'lucide-react';
import { HallucinationReportItem } from '../../../lib/services/reviewerDashboard';

interface ValidationIssuesProps {
  items: HallucinationReportItem[];
  loading: boolean;
  error?: string;
}

export const ValidationIssues: React.FC<ValidationIssuesProps> = ({
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
          <AlertTriangle className="h-5 w-5 text-rose-400" />
          <h3>Validation Issues Requiring Attention</h3>
        </div>
        <p className="text-sm text-slate-400">Data unavailable: {error}</p>
      </div>
    );
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
            CRITICAL
          </span>
        );
      case 'high':
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
            HIGH
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
            {severity?.toUpperCase() || 'MEDIUM'}
          </span>
        );
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="h-5 w-5 text-rose-400" />
            <h3 className="font-semibold text-slate-100">Validation Issues Requiring Attention</h3>
          </div>
          <span className="text-xs font-mono bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2.5 py-1 rounded-full">
            {items.length} Issues Detected
          </span>
        </div>

        {items.length === 0 ? (
          <div className="py-6 text-center text-slate-400 text-xs flex flex-col items-center">
            <AlertCircle className="h-6 w-6 text-emerald-500/50 mb-2" />
            No active ground-truth validation issues flagged. All generated plans pass structural constraints.
          </div>
        ) : (
          <div className="space-y-3">
            {items.slice(0, 5).map((item) => (
              <div
                key={item.flag_id}
                className="p-3 rounded-lg bg-slate-950/40 border border-slate-800/80 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold text-slate-200">
                      {item.employee_name || 'Employee'} ({item.role_code})
                    </span>
                    {getSeverityBadge(item.severity)}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Flag Type: <span className="font-mono text-slate-300">{item.flag_type}</span> • Claimed Doc: {item.claimed_source_doc || 'None'}
                  </div>
                  <div className="text-[11px] text-amber-300/80 mt-0.5 truncate max-w-md">
                    {item.reason || item.flagged_statement}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                    {item.review_status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
