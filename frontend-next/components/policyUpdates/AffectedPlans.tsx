'use client';

import React from 'react';
import { AffectedPlanResponse } from '@/lib/services/policyUpdates';
import { BookOpen, User, Briefcase } from 'lucide-react';

interface AffectedPlansProps {
  plans: AffectedPlanResponse[];
  loading: boolean;
}

export function AffectedPlans({ plans, loading }: AffectedPlansProps) {
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
            <BookOpen className="w-4 h-4 text-amber-400" />
            Affected Onboarding Plans ({plans.length})
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Onboarding plans containing modules linked to the updated policy document
          </p>
        </div>
      </div>

      {plans.length === 0 ? (
        <div className="p-4 text-center border border-dashed border-slate-800 rounded-lg text-slate-400 text-xs">
          No onboarding plans affected by this policy update.
        </div>
      ) : (
        <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
          {plans.map((p) => (
            <div
              key={p.plan_id}
              className="p-3.5 rounded-lg border border-slate-800 bg-slate-950/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/30">
                    {p.plan_id}
                  </span>
                  <span className="font-bold text-slate-200 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" /> {p.employee_name} ({p.employee_id})
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 mt-1">
                  <span className="flex items-center gap-1 font-semibold text-slate-300">
                    <Briefcase className="w-3 h-3 text-slate-400" /> {p.role_title} ({p.department})
                  </span>
                  <span>•</span>
                  <span className="text-amber-400 font-bold">{p.affected_modules_count} Affected Module(s)</span>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded text-[10px] uppercase font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 shrink-0">
                {p.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
