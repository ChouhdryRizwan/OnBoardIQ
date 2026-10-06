'use client';

import React from 'react';
import { FileUp, RefreshCw, CheckCircle2, Clock } from 'lucide-react';
import { PolicyUpdateSummaryResponse } from '../../../lib/services/reviewerDashboard';

interface ReviewerPolicyImpactProps {
  policyUpdates: PolicyUpdateSummaryResponse[];
  loading: boolean;
  error?: string;
}

export const ReviewerPolicyImpact: React.FC<ReviewerPolicyImpactProps> = ({
  policyUpdates,
  loading,
  error,
}) => {
  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 animate-pulse">
        <div className="h-6 bg-slate-800 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-slate-800/50 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error && policyUpdates.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center space-x-2 text-slate-300 font-semibold mb-3">
          <FileUp className="h-5 w-5 text-indigo-400" />
          <h3>Policy Updates Requiring Review</h3>
        </div>
        <p className="text-sm text-slate-400">Data unavailable: {error}</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <FileUp className="h-5 w-5 text-indigo-400" />
          <h3 className="font-semibold text-slate-100">Policy Updates Requiring Review</h3>
        </div>
        <span className="text-xs font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-1 rounded-full">
          {policyUpdates.length} Updates
        </span>
      </div>

      {policyUpdates.length === 0 ? (
        <div className="py-6 text-center text-slate-400 text-xs">
          No policy update events currently requiring re-validation or review.
        </div>
      ) : (
        <div className="space-y-3">
          {policyUpdates.slice(0, 4).map((update) => {
            const isCompleted = update.status === 'completed' || update.status === 'regenerated';
            const isAnalyzing = update.status === 'analyzing' || update.status === 'detected';

            return (
              <div
                key={update.update_id || update.document_id}
                className="p-3 rounded-lg bg-slate-950/40 border border-slate-800/80 flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0">
                    <FileUp className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-200">
                      {update.document_title || update.document_id} (v{update.old_version} → v{update.new_version})
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Type: {update.change_type} • Affected Plans: {update.affected_plans_count} • Employees: {update.affected_employees_count}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-right">
                  <div>
                    {isCompleted ? (
                      <span className="inline-flex items-center text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded font-mono">
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Re-validated
                      </span>
                    ) : isAnalyzing ? (
                      <span className="inline-flex items-center text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded font-mono">
                        <Clock className="h-3 w-3 mr-1" /> Re-review Req.
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-[10px] text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded font-mono">
                        <RefreshCw className="h-3 w-3 mr-1 animate-spin" /> In Progress
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
