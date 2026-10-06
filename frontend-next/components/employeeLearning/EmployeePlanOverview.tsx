'use client';

import React from 'react';
import Link from 'next/link';
import { LearningPlanResponse, OnboardingStageItem } from '@/lib/services/employeeLearning';
import { CheckCircle2, Clock, PlayCircle, BookOpen, ArrowRight, Award } from 'lucide-react';

interface EmployeePlanOverviewProps {
  plan: LearningPlanResponse | null;
  loading: boolean;
  onStartModule?: (moduleId: string) => void;
  onCompleteModule?: (moduleId: string) => void;
}

export function EmployeePlanOverview({
  plan,
  loading,
  onStartModule,
  onCompleteModule,
}: EmployeePlanOverviewProps) {
  if (loading) {
    return (
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm animate-pulse space-y-4">
        <div className="h-6 bg-slate-200 rounded w-1/3"></div>
        <div className="h-20 bg-slate-800/60 rounded"></div>
        <div className="h-20 bg-slate-800/60 rounded"></div>
      </div>
    );
  }

  if (!plan || !plan.stages || plan.stages.length === 0) {
    return (
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm text-center">
        <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-200">No Active Onboarding Roadmap</h3>
        <p className="text-sm text-slate-400 max-w-md mx-auto mt-1">
          Your active role onboarding plan will appear here once generated and assigned by your Training Manager.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/60">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-600" />
            Active Onboarding Plan Roadmap
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Assignment ID: <span className="font-mono text-slate-300">{plan.assignment_id.slice(0, 8)}...</span> • Assigned on {new Date(plan.assigned_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
            {plan.overall_status}
          </span>
          <span className="text-sm font-bold text-slate-100">
            {Math.round(plan.overall_progress_percentage)}% Overall
          </span>
        </div>
      </div>

      {/* Stages Pipeline */}
      <div className="space-y-6">
        {plan.stages.map((stage: OnboardingStageItem, idx: number) => {
          const completedCount = stage.modules.filter((m) => m.completion_status === 'completed').length;
          const totalCount = stage.modules.length;
          const stagePct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
          const isStageDone = completedCount === totalCount && totalCount > 0;

          return (
            <div key={stage.stage_id || idx} className="border border-slate-800 rounded-xl p-5 bg-slate-950/50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <span className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                    isStageDone
                      ? 'bg-emerald-600 text-white'
                      : 'bg-indigo-600 text-white'
                  }`}>
                    {idx + 1}
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-slate-100 capitalize">
                      {stage.stage_name.replace(/_/g, ' ')}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {completedCount} of {totalCount} modules completed ({stagePct}%)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-24 bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isStageDone ? 'bg-emerald-500' : 'bg-indigo-600'
                      }`}
                      style={{ width: `${stagePct}%` }}
                    />
                  </div>
                  {isStageDone && (
                    <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Stage Completed
                    </span>
                  )}
                </div>
              </div>

              {/* Stage Modules List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {stage.modules.map((m) => {
                  const isCompleted = m.completion_status === 'completed';
                  const isStarted = m.completion_status === 'started' || m.completion_status === 'in_progress';

                  return (
                    <div
                      key={m.module_id}
                      className={`p-4 rounded-lg border transition-all ${
                        isCompleted
                          ? 'bg-emerald-50/40 border-emerald-200'
                          : isStarted
                          ? 'bg-indigo-50/40 border-indigo-200 shadow-sm'
                          : 'bg-slate-900 border-slate-800'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm text-slate-100 line-clamp-1">
                              {m.title}
                            </span>
                            {m.is_mandatory && (
                              <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-rose-100 text-rose-700">
                                Mandatory
                              </span>
                            )}
                          </div>
                          {m.purpose && (
                            <p className="text-xs text-slate-400 line-clamp-2 mb-2">
                              {m.purpose}
                            </p>
                          )}
                        </div>

                        {/* Status Icon */}
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                        ) : isStarted ? (
                          <Clock className="w-5 h-5 text-indigo-600 flex-shrink-0 animate-pulse" />
                        ) : (
                          <BookOpen className="w-5 h-5 text-slate-400 flex-shrink-0" />
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
                        <span className="text-slate-400 capitalize">
                          Status: <span className="font-semibold text-slate-300">{m.completion_status}</span>
                        </span>

                        <div className="flex items-center gap-2">
                          {!isCompleted && !isStarted && onStartModule && (
                            <button
                              onClick={() => onStartModule(m.module_id)}
                              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded text-xs inline-flex items-center gap-1"
                            >
                              <PlayCircle className="w-3.5 h-3.5" /> Start
                            </button>
                          )}
                          {!isCompleted && isStarted && onCompleteModule && (
                            <button
                              onClick={() => onCompleteModule(m.module_id)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded text-xs inline-flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Complete
                            </button>
                          )}
                          <Link
                            href={`/employee/learning/module/${m.module_id}`}
                            className="px-2.5 py-1 bg-slate-800/60 hover:bg-slate-200 text-slate-300 font-medium rounded text-xs inline-flex items-center gap-1"
                          >
                            View <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
