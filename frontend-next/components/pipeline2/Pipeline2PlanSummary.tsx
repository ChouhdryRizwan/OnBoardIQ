'use client';

import React from 'react';
import { Pipeline1PlanDetails } from '@/lib/services/pipeline1';
import { BookOpen, Calendar, User, Briefcase } from 'lucide-react';

interface Pipeline2PlanSummaryProps {
  plan: Pipeline1PlanDetails | null;
  loading: boolean;
}

export function Pipeline2PlanSummary({ plan, loading }: Pipeline2PlanSummaryProps) {
  if (loading) {
    return (
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm mb-6 animate-pulse">
        <div className="h-6 bg-slate-800 rounded w-1/3 mb-3"></div>
        <div className="h-10 bg-slate-800/60 rounded"></div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="bg-slate-900 rounded-xl border border-dashed border-slate-700 p-6 shadow-sm mb-6 text-center text-slate-400 text-xs">
        No onboarding plan selected or loaded. Enter a valid Plan ID above to load plan metadata.
      </div>
    );
  }

  const stagesCount = plan.stages?.length || 0;
  const modulesCount = plan.stages?.reduce((acc, s) => acc + (s.modules?.length || 0), 0) || 0;

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs font-bold bg-indigo-950/60 text-indigo-300 border border-indigo-800/60 px-2.5 py-0.5 rounded">
              Plan ID: {plan.plan_id}
            </span>
            <span className="px-2.5 py-0.5 text-xs font-bold uppercase rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
              {plan.verification_status}
            </span>
          </div>

          <h2 className="text-xl font-bold text-slate-100 mt-1">
            Onboarding Plan: {plan.role_title} ({plan.role_code})
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-1 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span>Employee: <strong className="text-slate-100">{plan.employee_name || plan.employee_id}</strong></span>
          </div>
          <div className="flex items-center gap-1 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
            <span>Model: <strong className="text-slate-100">{plan.genai_model}</strong></span>
          </div>
          <div className="flex items-center gap-1 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Prompt: <strong className="text-mono text-slate-100">{plan.prompt_version}</strong></span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-800/60 text-xs">
        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/60">
          <div className="text-slate-400 text-[11px]">Onboarding Stages</div>
          <div className="text-base font-bold text-slate-100 mt-0.5">{stagesCount} Stages</div>
        </div>
        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/60">
          <div className="text-slate-400 text-[11px]">Total Modules</div>
          <div className="text-base font-bold text-slate-100 mt-0.5">{modulesCount} Modules</div>
        </div>
        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/60">
          <div className="text-slate-400 text-[11px]">Pipeline 1 Status</div>
          <div className="text-base font-bold text-emerald-400 mt-0.5 capitalize">{plan.verification_status}</div>
        </div>
        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/60 flex items-center justify-between">
          <div>
            <div className="text-slate-400 text-[11px]">Generated Date</div>
            <div className="text-xs font-semibold text-slate-200 mt-0.5">
              {new Date(plan.created_at).toLocaleDateString()}
            </div>
          </div>
          <BookOpen className="w-4 h-4 text-indigo-400" />
        </div>
      </div>
    </div>
  );
}
