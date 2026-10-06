'use client';

import React from 'react';
import { CheckCircle2, AlertTriangle, Scale, Info } from 'lucide-react';
import { GenAIPythonComparisonSummary } from '../../../lib/services/reviewerDashboard';

interface GenAIValidationComparisonProps {
  comparison: GenAIPythonComparisonSummary | null;
  loading: boolean;
  error?: string;
}

export const GenAIValidationComparison: React.FC<GenAIValidationComparisonProps> = ({
  comparison,
  loading,
  error,
}) => {
  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 animate-pulse">
        <div className="h-6 bg-slate-800 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={`comparison-skeleton-${i}`} className="h-12 bg-slate-800/50 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error && !comparison) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center space-x-2 text-slate-300 font-semibold mb-3">
          <Scale className="h-5 w-5 text-indigo-400" />
          <h3>GenAI Generation vs Python Ground-Truth Validation</h3>
        </div>
        <p className="text-sm text-slate-400">Data unavailable: {error}</p>
      </div>
    );
  }

  const items = comparison?.items || [];
  const agreementPct = comparison?.agreement_percentage !== undefined ? Math.round(comparison.agreement_percentage) : 'Unavailable';
  const hallRate = comparison?.hallucination_rate_percentage !== undefined ? Math.round(comparison.hallucination_rate_percentage) : 'Unavailable';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Scale className="h-5 w-5 text-indigo-400" />
            <h3 className="font-semibold text-slate-100">GenAI vs Python Deterministic Validation</h3>
          </div>
          <span className="text-xs font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-1 rounded-full">
            {agreementPct}% Agreement Rate
          </span>
        </div>

        {/* Informational banner emphasizing system architecture */}
        <div className="bg-slate-950/80 border border-indigo-500/20 rounded-lg p-3 text-xs text-slate-300 flex items-start space-x-2.5 mb-4">
          <Info className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-indigo-300">Pipeline Isolation Principle:</strong> GenAI generates candidate training content based on RRM rules. An independent Python engine performs deterministic ground-truth validation. The Human Reviewer makes the final release decision.
          </p>
        </div>

        {/* Summary metric pills */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 text-center">
            <div className="text-[10px] text-slate-400 font-medium uppercase">Full Agreement</div>
            <div className="text-lg font-bold text-emerald-400 font-mono mt-0.5">
              {comparison?.full_agreement_count ?? 0} plans
            </div>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 text-center">
            <div className="text-[10px] text-slate-400 font-medium uppercase">Discrepancies</div>
            <div className="text-lg font-bold text-amber-400 font-mono mt-0.5">
              {comparison?.severe_discrepancy_count ?? 0} plans
            </div>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 text-center">
            <div className="text-[10px] text-slate-400 font-medium uppercase">Hallucination Rate</div>
            <div className="text-lg font-bold text-rose-400 font-mono mt-0.5">
              {hallRate}%
            </div>
          </div>
        </div>

        {/* List of recent comparisons */}
        {items.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">No comparison records found.</p>
        ) : (
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-300 mb-2">Evaluated Plan Discrepancy Log</div>
            {items.slice(0, 4).map((item, idx) => {
              const genaiPct = Math.round((item.genai_claimed_coverage || 0) * 100);
              const pythonPct = Math.round((item.python_verified_coverage || 0) * 100);
              const uniqueKey = `${item.plan_id ?? 'comparison'}-${item.requirement_id ?? item.comparison_id ?? item.module_id ?? item.employee_id ?? item.role_id ?? idx}`;

              return (
                <div
                  key={uniqueKey}
                  className="p-3 rounded-lg bg-slate-950/40 border border-slate-800/80 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-semibold text-slate-200">
                      {item.employee_name} ({item.role_code})
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      GenAI Claim: <span className="font-mono text-indigo-300">{genaiPct}%</span> vs Python Ground-Truth: <span className="font-mono text-emerald-400">{pythonPct}%</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {item.is_agreement ? (
                      <span className="inline-flex items-center text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded font-mono">
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Full Agreement
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded font-mono">
                        <AlertTriangle className="h-3 w-3 mr-1" /> Discrepancy
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
