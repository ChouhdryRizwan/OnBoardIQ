'use client';

import React from 'react';
import { BackendLearningPlanResponse } from '@/lib/services/employeeDashboard';
import { BookOpen, Layers, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

interface CurrentTrainingPlanProps {
  plan: BackendLearningPlanResponse | null;
  loading: boolean;
  error?: string;
}

export function CurrentTrainingPlan({ plan, loading, error }: CurrentTrainingPlanProps) {
  if (loading) {
    return (
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="h-24 bg-slate-800/60 rounded-lg mb-4"></div>
        <div className="h-20 bg-slate-800/60 rounded-lg"></div>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-100 mb-2">Current Training Plan</h2>
        <div className="flex items-center text-amber-600 bg-amber-50 p-4 rounded-lg text-sm">
          <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
          <span>{error || 'No active training plan assigned currently.'}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            Assigned Training Plan
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Plan ID: <span className="font-mono text-xs font-semibold text-slate-300">{plan.plan_id}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            {plan.overall_status || 'Active'}
          </span>
          <span className="text-xs text-slate-400">
            Assigned: {plan.assigned_at ? new Date(plan.assigned_at).toLocaleDateString() : 'Recent'}
          </span>
        </div>
      </div>

      {/* Plan Stages Breakdown */}
      <div className="space-y-4">
        {plan.stages && plan.stages.length > 0 ? (
          plan.stages.map((stage, sIdx) => {
            const completedCount = stage.modules.filter((m) => m.completion_status === 'completed').length;
            const stagePct = stage.modules.length > 0 ? Math.round((completedCount / stage.modules.length) * 100) : 0;

            return (
              <div key={stage.stage_id || sIdx} className="border border-slate-800 rounded-lg p-4 bg-slate-950/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-sm font-bold text-slate-100">{stage.stage_name}</h3>
                  </div>
                  <span className="text-xs font-medium text-slate-400">
                    {completedCount} / {stage.modules.length} Modules ({stagePct}%)
                  </span>
                </div>

                {/* Modules under stage */}
                <div className="space-y-2">
                  {stage.modules.map((mod) => {
                    const isDone = mod.completion_status === 'completed';
                    const isStarted = mod.completion_status === 'in_progress' || mod.completion_status === 'started';

                    return (
                      <div
                        key={mod.module_id}
                        className="flex items-center justify-between p-2.5 rounded-md bg-slate-900 border border-slate-800 text-sm"
                      >
                        <div className="flex items-center gap-2.5">
                          {isDone ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          ) : isStarted ? (
                            <Clock className="w-4 h-4 text-blue-600 flex-shrink-0" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border-2 border-slate-700 flex-shrink-0" />
                          )}
                          <span className={`font-medium ${isDone ? 'text-slate-400 line-through' : 'text-slate-200'}`}>
                            {mod.title}
                          </span>
                          {mod.is_mandatory && (
                            <span className="px-1.5 py-0.5 text-[10px] uppercase font-bold bg-amber-100 text-amber-800 rounded">
                              Mandatory
                            </span>
                          )}
                        </div>

                        <span
                          className={`text-xs px-2 py-0.5 rounded capitalize font-medium ${
                            isDone
                              ? 'bg-emerald-100 text-emerald-800'
                              : isStarted
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-800/60 text-slate-400'
                          }`}
                        >
                          {mod.completion_status.replace('_', ' ')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-6 text-slate-400 text-sm">No specific stages detailed for this plan.</div>
        )}
      </div>
    </div>
  );
}
