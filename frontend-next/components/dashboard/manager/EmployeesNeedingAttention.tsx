'use client';

import React from 'react';
import { AlertTriangle, AlertCircle, ArrowRight } from 'lucide-react';
import { EmployeeProgressReportItem } from '../../../lib/services/managerDashboard';

interface EmployeesNeedingAttentionProps {
  items: EmployeeProgressReportItem[];
  loading: boolean;
  error?: string;
}

export const EmployeesNeedingAttention: React.FC<EmployeesNeedingAttentionProps> = ({
  items,
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

  if (error && items.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center space-x-2 text-slate-300 font-semibold mb-3">
          <AlertTriangle className="h-5 w-5 text-amber-400" />
          <h3>Employees Needing Attention</h3>
        </div>
        <p className="text-sm text-slate-400">Data unavailable: {error}</p>
      </div>
    );
  }

  const flaggedEmployees = items.filter(
    (emp) =>
      emp.current_status === 'requires_attention' ||
      emp.current_status === 'behind_schedule' ||
      emp.current_status === 'assessment_required' ||
      (emp.overall_progress_percentage || 0) < 50
  );

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
            <h3 className="font-semibold text-slate-100">Employees Needing Attention</h3>
          </div>
          <span className="text-xs font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-full">
            {flaggedEmployees.length} Flagged
          </span>
        </div>

        {flaggedEmployees.length === 0 ? (
          <div className="py-6 text-center text-slate-400 text-xs flex flex-col items-center">
            <AlertCircle className="h-6 w-6 text-emerald-500/50 mb-2" />
            No employees currently require attention. All team members are on track!
          </div>
        ) : (
          <div className="space-y-3">
            {flaggedEmployees.slice(0, 5).map((emp) => {
              const pct = Math.round(emp.overall_progress_percentage || 0);
              const reason =
                emp.current_status === 'behind_schedule'
                  ? 'Behind training schedule milestone'
                  : emp.current_status === 'requires_attention'
                  ? 'High risk / validation issue'
                  : emp.current_status === 'assessment_required'
                  ? 'Assessment retry or pending quiz'
                  : 'Low overall progress completion';

              return (
                <div
                  key={emp.employee_id}
                  className="p-3 rounded-lg bg-slate-950/40 border border-slate-800/80 flex items-center justify-between hover:border-slate-700 transition-colors"
                >
                  <div>
                    <div className="text-xs font-semibold text-slate-200">
                      {emp.employee_name} ({emp.role_title || emp.role_code})
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {reason} • <span className="font-mono text-amber-300">{pct}% complete</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-right">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 capitalize">
                      {emp.current_status.replace(/_/g, ' ')}
                    </span>
                    <button
                      onClick={() => alert(`Reviewing employee ${emp.employee_name}`)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                      title="Inspect Progress"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </button>
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
