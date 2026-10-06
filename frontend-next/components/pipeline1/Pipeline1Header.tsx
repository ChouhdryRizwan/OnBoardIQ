'use client';

import React from 'react';
import { Sparkles, ShieldCheck, RefreshCw, Cpu } from 'lucide-react';

interface Pipeline1HeaderProps {
  onRefresh: () => void;
  loading: boolean;
}

export function Pipeline1Header({ onRefresh, loading }: Pipeline1HeaderProps) {
  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Sparkles className="w-5 h-5 text-amber-500" />
            </span>
            <h1 className="text-2xl font-bold text-slate-100">Pipeline 1 — AI Onboarding Plan Generation</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
              <Cpu className="w-3 h-3 text-indigo-600" />
              Gemini GenAI Engine
            </span>
          </div>
          <p className="text-slate-400 text-sm">
            Synthesize role-specific onboarding plans, learning modules, practical tasks, and quizzes grounded in verified company policy documents and Role Requirement Matrix (RRM) ground truth.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 text-sm font-semibold text-slate-300 bg-slate-800/60 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh roles and context data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Context
          </button>
        </div>
      </div>

      {/* Informational Ground Truth Notice */}
      <div className="mt-4 p-3 rounded-lg bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-900 flex items-start gap-2">
        <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Organizational Ground Truth Enforcement:</span> Pipeline 1 extracts approved policy requirements from RRM before constructing prompt contexts, guaranteeing complete source document traceability across generated modules.
        </div>
      </div>
    </div>
  );
}
