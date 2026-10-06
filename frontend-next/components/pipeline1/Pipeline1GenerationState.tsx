'use client';

import React from 'react';
import { Sparkles, Loader2, ShieldCheck } from 'lucide-react';

interface Pipeline1GenerationStateProps {
  roleCode?: string;
  employeeId?: string;
}

export function Pipeline1GenerationState({ roleCode, employeeId }: Pipeline1GenerationStateProps) {
  return (
    <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white rounded-xl p-8 shadow-xl mb-6 relative overflow-hidden text-center">
      {/* Decorative background glow */}
      <div className="absolute -left-10 -top-10 w-48 h-48 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none"></div>
      <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>

      <div className="relative z-10 max-w-md mx-auto space-y-4">
        <div className="p-4 rounded-full bg-indigo-500/20 text-amber-400 border border-indigo-400/30 w-16 h-16 mx-auto flex items-center justify-center shadow-lg">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>

        <div>
          <h3 className="text-xl font-bold text-white flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            Generating Onboarding Plan...
          </h3>
          <p className="text-indigo-200 text-xs mt-1">
            Pipeline 1 is synthesizing multi-stage modules, practical tasks, rubrics, and quizzes for employee{' '}
            <span className="font-mono font-bold text-white">{employeeId || 'Target'}</span> ({roleCode || 'Role'}).
          </p>
        </div>

        <div className="p-3.5 rounded-lg bg-slate-900/10 border border-white/10 text-xs text-indigo-100 space-y-1 text-left">
          <div className="flex items-center gap-2 font-semibold text-amber-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Ground Truth Active Context:
          </div>
          <p className="text-[11px] text-indigo-200">
            Extracted RRM requirements & source document citations are currently being formatted into Pydantic schema contracts.
          </p>
        </div>
      </div>
    </div>
  );
}
