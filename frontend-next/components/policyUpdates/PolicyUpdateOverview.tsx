'use client';

import React from 'react';
import { PolicyUpdateSummaryResponse } from '@/lib/services/policyUpdates';
import { FileText, Database, BookOpen, Users } from 'lucide-react';

interface PolicyUpdateOverviewProps {
  updates: PolicyUpdateSummaryResponse[];
  loading: boolean;
}

export function PolicyUpdateOverview({ updates, loading }: PolicyUpdateOverviewProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-slate-900 p-4 rounded-xl border border-slate-800 h-24"></div>
        ))}
      </div>
    );
  }

  const totalUpdates = updates.length;
  const activeImpacts = updates.reduce((acc, u) => acc + u.affected_plans_count, 0);
  const totalAffectedModules = updates.reduce((acc, u) => acc + u.affected_modules_count, 0);
  const totalAffectedEmployees = updates.reduce((acc, u) => acc + u.affected_employees_count, 0);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Policy Updates */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-sm space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
          <span>Detected Updates</span>
          <FileText className="w-4 h-4 text-blue-400" />
        </div>
        <div className="text-2xl font-black text-slate-100">{totalUpdates}</div>
        <div className="text-[11px] text-slate-400">Document version change events</div>
      </div>

      {/* Affected Plans */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-sm space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
          <span>Affected Plans</span>
          <BookOpen className="w-4 h-4 text-indigo-400" />
        </div>
        <div className="text-2xl font-black text-indigo-400">{activeImpacts}</div>
        <div className="text-[11px] text-slate-400">Onboarding plans requiring update</div>
      </div>

      {/* Affected Modules */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-sm space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
          <span>Affected Modules</span>
          <Database className="w-4 h-4 text-amber-400" />
        </div>
        <div className="text-2xl font-black text-amber-400">{totalAffectedModules}</div>
        <div className="text-[11px] text-slate-400">Targeted modules for selective regen</div>
      </div>

      {/* Affected Employees */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-sm space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
          <span>Affected Employees</span>
          <Users className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="text-2xl font-black text-emerald-400">{totalAffectedEmployees}</div>
        <div className="text-[11px] text-slate-400">Active learners with outdated modules</div>
      </div>
    </div>
  );
}
