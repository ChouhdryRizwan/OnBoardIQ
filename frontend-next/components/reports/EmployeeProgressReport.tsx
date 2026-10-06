'use client';

import React from 'react';
import { EmployeeProgressReportResponse } from '@/lib/services/reports';
import { Users, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

interface EmployeeProgressReportProps {
  data: EmployeeProgressReportResponse | null;
  loading: boolean;
  onPageChange?: (newPage: number) => void;
}

export function EmployeeProgressReport({
  data,
  loading,
  onPageChange,
}: EmployeeProgressReportProps) {
  if (loading) {
    return (
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm animate-pulse space-y-4">
        <div className="h-6 bg-slate-200 rounded w-1/3"></div>
        <div className="h-40 bg-slate-800/60 rounded"></div>
      </div>
    );
  }

  if (!data || data.items.length === 0) {
    return (
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-8 shadow-sm text-center">
        <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-200">No Employee Progress Records Found</h3>
        <p className="text-sm text-slate-400 mt-1">Adjust search query or active filter criteria.</p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'on_track':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3 mr-1" /> On Track
          </span>
        );
      case 'requires_attention':
      case 'behind_schedule':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <AlertCircle className="w-3 h-3 mr-1" /> Attention
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
            <Clock className="w-3 h-3 mr-1" /> {status.replace(/_/g, ' ')}
          </span>
        );
    }
  };

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            Employee Learning Progress Report ({data.total})
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Individual learner completion rates, module counts, task progression, and quiz performance.
          </p>
        </div>

        <span className="text-xs font-semibold text-slate-400 bg-slate-800/60 px-3 py-1 rounded-lg border border-slate-800 font-mono">
          Page {data.page} of {Math.ceil(data.total / data.size) || 1}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 border-b border-slate-800 text-slate-300 font-bold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="p-3.5">Employee</th>
              <th className="p-3.5">Role & Dept</th>
              <th className="p-3.5">Plan Version</th>
              <th className="p-3.5">Progress</th>
              <th className="p-3.5">Modules (Done/Total)</th>
              <th className="p-3.5">Tasks (Done/Total)</th>
              <th className="p-3.5">Quiz Score Avg</th>
              <th className="p-3.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {data.items.map((emp) => (
              <tr key={emp.employee_id} className="hover:bg-slate-950/80 transition-colors">
                <td className="p-3.5">
                  <div className="font-bold text-slate-100">{emp.employee_name}</div>
                  <div className="text-[11px] text-slate-400 font-mono">{emp.email}</div>
                </td>
                <td className="p-3.5">
                  <div className="font-semibold text-slate-200">{emp.role_title}</div>
                  <div className="text-[11px] text-slate-400">{emp.department} • (<span className="font-mono text-slate-300">{emp.role_code}</span>)</div>
                </td>
                <td className="p-3.5 font-mono text-slate-400">
                  {emp.plan_version || 'v1.0'}
                </td>
                <td className="p-3.5">
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-slate-800/60 h-2 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="bg-indigo-500 h-full rounded-full"
                        style={{ width: `${Math.min(100, emp.overall_progress_percentage)}%` }}
                      />
                    </div>
                    <span className="font-bold text-slate-100 font-mono">
                      {Math.round(emp.overall_progress_percentage)}%
                    </span>
                  </div>
                </td>
                <td className="p-3.5 font-semibold text-slate-200 font-mono">
                  {emp.completed_modules} / {emp.total_modules}
                </td>
                <td className="p-3.5 font-semibold text-slate-200 font-mono">
                  {emp.completed_tasks} / {emp.total_tasks}
                </td>
                <td className="p-3.5">
                  <span className="font-bold text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/30 font-mono">
                    {Math.round(emp.assessment_score_avg)}%
                  </span>
                </td>
                <td className="p-3.5">
                  {getStatusBadge(emp.current_status)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {data.total > data.size && onPageChange && (
        <div className="p-4 border-t border-slate-800/60 flex items-center justify-between text-xs">
          <button
            onClick={() => onPageChange(data.page - 1)}
            disabled={data.page <= 1}
            className="px-3 py-1.5 bg-slate-800/60 hover:bg-slate-800 hover:text-slate-100 border border-slate-700 disabled:opacity-50 text-slate-300 font-semibold rounded-lg transition-colors"
          >
            Previous
          </button>
          <span className="text-slate-400">
            Showing {(data.page - 1) * data.size + 1} to {Math.min(data.page * data.size, data.total)} of {data.total}
          </span>
          <button
            onClick={() => onPageChange(data.page + 1)}
            disabled={data.page * data.size >= data.total}
            className="px-3 py-1.5 bg-slate-800/60 hover:bg-slate-800 hover:text-slate-100 border border-slate-700 disabled:opacity-50 text-slate-300 font-semibold rounded-lg transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
