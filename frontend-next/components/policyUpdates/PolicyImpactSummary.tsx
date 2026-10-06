'use client';

import React from 'react';
import { PolicyUpdateSummaryResponse } from '@/lib/services/policyUpdates';

interface PolicyImpactSummaryProps {
  update: PolicyUpdateSummaryResponse | null;
  loading: boolean;
}

export function PolicyImpactSummary({ update, loading }: PolicyImpactSummaryProps) {
  if (loading) {
    return (
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm mb-6 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/3 mb-2"></div>
        <div className="h-16 bg-slate-800/60 rounded"></div>
      </div>
    );
  }

  if (!update) return null;

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/60 pb-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-0.5 rounded">
              Update ID: {update.update_id}
            </span>
            <span className="px-2.5 py-0.5 text-xs font-bold uppercase rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
              {update.status}
            </span>
          </div>

          <h2 className="text-xl font-bold text-slate-100 mt-2">
            Impact Analysis: {update.document_title} ({update.document_id})
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Document updated from <strong className="font-mono text-slate-200">v{update.old_version}</strong> to{' '}
            <strong className="font-mono text-blue-400">v{update.new_version}</strong> ({update.change_type})
          </p>
        </div>

        <div className="text-xs text-slate-400 text-right">
          Detected: <strong className="text-slate-200 font-mono">{new Date(update.detected_at).toLocaleString()}</strong>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
          <div className="text-slate-400 text-[11px] font-semibold uppercase tracking-wide">Affected Roles</div>
          <div className="text-xl font-black text-indigo-400 mt-1">{update.affected_roles_count} Roles</div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
          <div className="text-slate-400 text-[11px] font-semibold uppercase tracking-wide">Affected Plans</div>
          <div className="text-xl font-black text-amber-400 mt-1">{update.affected_plans_count} Plans</div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
          <div className="text-slate-400 text-[11px] font-semibold uppercase tracking-wide">Affected Modules</div>
          <div className="text-xl font-black text-blue-400 mt-1">{update.affected_modules_count} Modules</div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
          <div className="text-slate-400 text-[11px] font-semibold uppercase tracking-wide">Affected Employees</div>
          <div className="text-xl font-black text-emerald-400 mt-1">{update.affected_employees_count} Learners</div>
        </div>
      </div>
    </div>
  );
}
