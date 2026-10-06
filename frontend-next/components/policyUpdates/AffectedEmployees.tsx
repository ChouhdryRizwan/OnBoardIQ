'use client';

import React from 'react';
import { AffectedEmployeeResponse } from '@/lib/services/policyUpdates';
import { Users } from 'lucide-react';

interface AffectedEmployeesProps {
  employees: AffectedEmployeeResponse[];
  loading: boolean;
}

export function AffectedEmployees({ employees, loading }: AffectedEmployeesProps) {
  if (loading) {
    return (
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm mb-6 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="h-16 bg-slate-800/60 rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm mb-6">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            Affected Learners & Employee Progress ({employees.length})
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Active employees with learning plan modules linked to the updated policy version
          </p>
        </div>
      </div>

      {employees.length === 0 ? (
        <div className="p-4 text-center border border-dashed border-slate-800 rounded-lg text-slate-400 text-xs">
          No employee active learning plans affected by this document update.
        </div>
      ) : (
        <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
          {employees.map((e, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-lg border border-slate-800 bg-slate-950/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div>
                <div className="flex items-center gap-2 font-bold text-slate-100">
                  <span>{e.employee_name} ({e.employee_id})</span>
                  <span className="font-mono text-[10px] text-slate-400 font-normal">Plan: {e.plan_id}</span>
                </div>
                <div className="text-slate-400 mt-0.5 font-medium">
                  Affected Module: <strong className="text-indigo-400">{e.affected_module_title}</strong>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">{e.reason}</div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Learning Progress</div>
                  <div className="text-xs font-bold text-emerald-400">{e.current_progress}%</div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  Outdated Module
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
