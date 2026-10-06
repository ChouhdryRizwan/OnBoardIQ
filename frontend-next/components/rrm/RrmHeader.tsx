'use client';

import React from 'react';
import { Database, RefreshCw, Plus, Shield } from 'lucide-react';

interface RrmHeaderProps {
  onRefresh: () => void;
  onOpenCreateRole: () => void;
  onOpenAddRequirement: () => void;
  loading: boolean;
  totalRoles: number;
  totalReqs: number;
}

export function RrmHeader({
  onRefresh,
  onOpenCreateRole,
  onOpenAddRequirement,
  loading,
  totalRoles,
  totalReqs,
}: RrmHeaderProps) {
  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-xl mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left Column: Title, Description, and Ground Truth Status Badge */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1.5">
            <span className="p-2 rounded-lg bg-indigo-950/80 text-indigo-300 border border-indigo-800/60 shrink-0">
              <Database className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
              Role & Requirement Matrix (RRM) Workspace
            </h1>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed max-w-3xl">
            Manage trusted role requirements used as ground truth for onboarding generation, LLM pipeline validation, and policy compliance. ({totalRoles} Roles, {totalReqs} Requirements)
          </p>
          <div className="mt-3 flex items-center">
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md bg-emerald-950/60 border border-emerald-800/80 text-emerald-400"
              title="Verified 100% Python Ground Truth Data Repository"
            >
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Ground Truth Repository</span>
            </span>
          </div>
        </div>

        {/* Right Column: Professional Enterprise Action Toolbar */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0 lg:self-center">
          {/* Utility Action: Refresh */}
          <button
            onClick={onRefresh}
            disabled={loading}
            className="h-10 px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
            title="Refresh RRM data"
          >
            <RefreshCw className={`w-4 h-4 text-slate-300 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          {/* Secondary Action: New Job Role */}
          <button
            onClick={onOpenCreateRole}
            className="h-10 px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-800/90 hover:bg-slate-700 border border-slate-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-indigo-400" />
            <span>New Job Role</span>
          </button>

          {/* Primary Action CTA: Add Requirement */}
          <button
            onClick={onOpenAddRequirement}
            className="h-10 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 border border-indigo-500/80 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>Add Requirement</span>
          </button>
        </div>
      </div>
    </div>
  );
}
