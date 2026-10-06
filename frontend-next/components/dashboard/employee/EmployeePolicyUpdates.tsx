'use client';

import React from 'react';
import { PolicyUpdateSummaryResponse } from '@/lib/services/employeeDashboard';
import { FileUp, FileText, ArrowRight } from 'lucide-react';

interface EmployeePolicyUpdatesProps {
  policyUpdates: PolicyUpdateSummaryResponse[];
  loading: boolean;
}

export function EmployeePolicyUpdates({ policyUpdates, loading }: EmployeePolicyUpdatesProps) {
  if (loading) {
    return (
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="h-16 bg-slate-800/60 rounded mb-2"></div>
      </div>
    );
  }

  const updates = policyUpdates || [];

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <FileUp className="w-5 h-5 text-indigo-600" />
            Policy Updates & Changes ({updates.length})
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Recent document updates triggering learning plan modifications
          </p>
        </div>
      </div>

      {updates.length === 0 ? (
        <div className="text-center py-6 border border-dashed border-slate-800 rounded-lg text-slate-400 text-sm">
          No policy updates currently impacting your training plan.
        </div>
      ) : (
        <div className="space-y-3">
          {updates.map((upd) => (
            <div
              key={upd.update_id}
              className="p-4 rounded-lg border border-slate-800 bg-slate-950/50 hover:bg-slate-950 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span className="font-bold text-sm text-slate-100">{upd.document_title}</span>
                  <span className="px-2 py-0.5 text-[10px] uppercase font-bold bg-blue-100 text-blue-800 rounded">
                    {upd.change_type.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span>
                    Version bump: <span className="font-mono text-slate-300">v{upd.old_version}</span> →{' '}
                    <span className="font-mono font-bold text-slate-100">v{upd.new_version}</span>
                  </span>
                  <span>•</span>
                  <span>Affected modules: {upd.affected_modules_count}</span>
                  <span>•</span>
                  <span>
                    Detected: {upd.detected_at ? new Date(upd.detected_at).toLocaleDateString() : 'Recent'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-slate-200 text-slate-300 capitalize">
                  {upd.status.replace('_', ' ')}
                </span>
                <a
                  href="/employee/policy-updates"
                  className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors"
                  title="View details"
                >
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
