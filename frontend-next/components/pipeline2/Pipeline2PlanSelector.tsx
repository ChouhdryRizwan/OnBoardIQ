'use client';

import React, { useState } from 'react';
import { Search, FileText } from 'lucide-react';

interface Pipeline2PlanSelectorProps {
  currentPlanId: string;
  onSelectPlanId: (planId: string) => void;
  loading: boolean;
}

export function Pipeline2PlanSelector({
  currentPlanId,
  onSelectPlanId,
  loading,
}: Pipeline2PlanSelectorProps) {
  const [inputPlanId, setInputPlanId] = useState(currentPlanId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPlanId.trim()) return;
    onSelectPlanId(inputPlanId.trim());
  };

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            Target Onboarding Plan
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Select or enter the Plan ID of a Pipeline 1 generated onboarding plan to validate
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-80">
            <input
              type="text"
              placeholder="e.g. 7e8cc594-f9a4-4e3c-924d-7fc7dbee705d"
              value={inputPlanId}
              onChange={(e) => setInputPlanId(e.target.value)}
              className="w-full py-2 px-3 text-xs font-mono bg-slate-950 text-slate-100 border border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !inputPlanId.trim()}
            className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors disabled:opacity-50 shrink-0 flex items-center gap-1.5"
          >
            <Search className="w-3.5 h-3.5" />
            Load Plan
          </button>
        </form>
      </div>
    </div>
  );
}
