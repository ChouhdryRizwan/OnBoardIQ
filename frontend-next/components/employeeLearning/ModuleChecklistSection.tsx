'use client';

import React from 'react';
import { ChecklistProgressResponse } from '@/lib/services/employeeLearning';
import { CheckSquare, CheckCircle2, ShieldCheck, UserCheck } from 'lucide-react';

interface ModuleChecklistSectionProps {
  checklists: ChecklistProgressResponse[];
  loading: boolean;
  onToggleChecklist: (checklistId: string) => Promise<void>;
}

export function ModuleChecklistSection({
  checklists,
  loading,
  onToggleChecklist,
}: ModuleChecklistSectionProps) {
  if (loading) {
    return (
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm animate-pulse space-y-3">
        <div className="h-6 bg-slate-200 rounded w-1/3"></div>
        <div className="h-10 bg-slate-800/60 rounded"></div>
        <div className="h-10 bg-slate-800/60 rounded"></div>
      </div>
    );
  }

  const completedCount = checklists.filter((c) => c.is_completed).length;
  const totalCount = checklists.length;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/60">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            Mandatory Onboarding Checklists ({completedCount}/{totalCount})
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Administrative, security, and policy compliance verification steps.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-28 bg-slate-800/60 h-2.5 rounded-full overflow-hidden border border-slate-800">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <span className="text-sm font-bold text-slate-100">{percentage}%</span>
        </div>
      </div>

      {checklists.length === 0 ? (
        <div className="text-center py-6 text-slate-400">
          <CheckSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm">No mandatory checklist items found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {checklists.map((item) => (
            <div
              key={item.checklist_id}
              className={`p-4 rounded-xl border flex items-center justify-between gap-4 transition-all ${
                item.is_completed
                  ? 'bg-emerald-50/30 border-emerald-200'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => onToggleChecklist(item.checklist_id)}
                  disabled={item.is_completed}
                  className={`w-6 h-6 rounded-md flex items-center justify-center border transition-colors flex-shrink-0 ${
                    item.is_completed
                      ? 'bg-emerald-600 border-emerald-600 text-white cursor-default'
                      : 'border-slate-700 hover:border-indigo-600 text-transparent hover:text-indigo-600'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                </button>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-semibold truncate ${
                        item.is_completed ? 'line-through text-slate-400' : 'text-slate-100'
                      }`}
                    >
                      {item.activity_name}
                    </span>
                    {item.is_required && (
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 flex-shrink-0">
                        Required
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                    <span className="capitalize">Stage: {item.due_stage.replace(/_/g, ' ')}</span>
                    {item.responsible_person && (
                      <span className="flex items-center gap-1">
                        <UserCheck className="w-3 h-3 text-slate-400" />
                        Verify with: {item.responsible_person}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div>
                {item.is_completed ? (
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                  </span>
                ) : (
                  <button
                    onClick={() => onToggleChecklist(item.checklist_id)}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-lg border border-indigo-200 transition-colors"
                  >
                    Mark Done
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
