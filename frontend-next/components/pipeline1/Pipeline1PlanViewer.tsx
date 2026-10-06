'use client';

import React, { useState } from 'react';
import { Pipeline1PlanDetails, Pipeline1PlanSources } from '@/lib/services/pipeline1';
import {
  BookOpen,
  FileCode,
  Layers,
  Award,
  HelpCircle,
  Code2,
  FileText,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface Pipeline1PlanViewerProps {
  plan: Pipeline1PlanDetails | null;
  rawJson?: Record<string, unknown>;
  sources?: Pipeline1PlanSources | null;
}

export function Pipeline1PlanViewer({ plan, rawJson, sources }: Pipeline1PlanViewerProps) {
  const [viewMode, setViewMode] = useState<'plan' | 'json' | 'sources'>('plan');
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

  if (!plan) return null;

  const toggleModule = (modId: string) => {
    setExpandedModules((prev) => ({ ...prev, [modId]: !prev[modId] }));
  };

  const stages = plan.stages || [];
  const totalModules = stages.reduce((acc, stg) => acc + (stg.modules?.length || 0), 0);

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-sm overflow-hidden mb-6">
      {/* Top Banner */}
      <div className="p-6 border-b border-slate-800 bg-slate-950/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-indigo-100 text-indigo-900 border border-indigo-200 font-mono">
              Plan ID: {plan.plan_id}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-emerald-100 text-emerald-800">
              {plan.verification_status}
            </span>
          </div>

          <h2 className="text-xl font-bold text-slate-100 mt-2">
            Generated Onboarding Plan for {plan.employee_name || plan.employee_id}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Role: <span className="font-semibold text-slate-200">{plan.role_title} ({plan.role_code})</span> • Model: {plan.genai_model} • Prompt: {plan.prompt_version}
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center bg-slate-200/80 p-1 rounded-lg text-xs font-semibold">
          <button
            onClick={() => setViewMode('plan')}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
              viewMode === 'plan' ? 'bg-slate-900 text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Plan Roadmap ({totalModules})
          </button>

          <button
            onClick={() => setViewMode('sources')}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
              viewMode === 'sources' ? 'bg-slate-900 text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Citations ({sources?.total_sources_cited || 0})
          </button>

          <button
            onClick={() => setViewMode('json')}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
              viewMode === 'json' ? 'bg-slate-900 text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            Raw JSON
          </button>
        </div>
      </div>

      {/* VIEW MODE 1: VISUAL PLAN ROADMAP */}
      {viewMode === 'plan' && (
        <div className="p-6 space-y-6">
          {stages.map((stg, sIdx) => (
            <div key={stg.stage_id || sIdx} className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
              <div className="p-4 bg-slate-800/60/80 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-100">
                    Stage {stg.stage_order || sIdx + 1}: {stg.stage_name}
                  </h3>
                </div>
                <span className="text-xs text-slate-400 font-medium">
                  {stg.modules?.length || 0} Module(s)
                </span>
              </div>

              <div className="p-4 space-y-4">
                {stg.modules?.map((mod) => {
                  const isExpanded = !!expandedModules[mod.module_id];

                  return (
                    <div
                      key={mod.module_id}
                      className="bg-slate-900 rounded-xl border border-slate-800 p-4 shadow-sm space-y-3"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                              {mod.module_code || mod.module_id}
                            </span>
                            {mod.is_mandatory && (
                              <span className="px-2 py-0.5 text-[10px] uppercase font-bold bg-amber-100 text-amber-800 rounded">
                                Mandatory
                              </span>
                            )}
                            <span className="px-2 py-0.5 text-[10px] capitalize font-medium bg-slate-800/60 text-slate-400 rounded">
                              {mod.difficulty}
                            </span>
                          </div>
                          <h4 className="text-base font-bold text-slate-100">{mod.title}</h4>
                          {mod.purpose && <p className="text-xs text-slate-400 mt-0.5">{mod.purpose}</p>}
                        </div>

                        <button
                          onClick={() => toggleModule(mod.module_id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-400 hover:bg-slate-800/60 transition-colors"
                        >
                          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>
                      </div>

                      {/* Source Citation Badge */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 bg-slate-950 p-2.5 rounded-lg border border-slate-800/60">
                        <span className="flex items-center gap-1 font-mono font-semibold text-slate-200">
                          <FileCode className="w-3.5 h-3.5 text-indigo-600" />
                          Source: {mod.source_document_id} (Sec {mod.source_section_id})
                        </span>
                        <span>•</span>
                        <span>Ground Truth Requirement: <span className="font-mono text-indigo-700 font-semibold">{mod.requirement_id}</span></span>
                      </div>

                      {/* Detailed Module Expandable Section */}
                      {isExpanded && (
                        <div className="space-y-4 pt-3 border-t border-slate-800/60 text-xs">
                          {/* Objectives */}
                          {mod.objectives && mod.objectives.length > 0 && (
                            <div>
                              <h5 className="font-bold text-slate-200 mb-1.5 uppercase text-[10px] tracking-wider">
                                Learning Objectives
                              </h5>
                              <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1">
                                {mod.objectives.map((obj, i) => (
                                  <li key={i}>{obj}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Practical Tasks */}
                          {mod.tasks && mod.tasks.length > 0 && (
                            <div>
                              <h5 className="font-bold text-slate-200 mb-1.5 uppercase text-[10px] tracking-wider flex items-center gap-1">
                                <Award className="w-3.5 h-3.5 text-indigo-600" /> Practical Tasks ({mod.tasks.length})
                              </h5>
                              <div className="space-y-2">
                                {mod.tasks.map((t) => (
                                  <div key={t.task_id} className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                                    <div className="font-bold text-slate-100 mb-0.5">{t.description}</div>
                                    <div className="text-slate-400">Expected Outcome: {t.expected_outcome}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Quizzes */}
                          {mod.quizzes && mod.quizzes.length > 0 && (
                            <div>
                              <h5 className="font-bold text-slate-200 mb-1.5 uppercase text-[10px] tracking-wider flex items-center gap-1">
                                <HelpCircle className="w-3.5 h-3.5 text-blue-600" /> Quiz Assessments ({mod.quizzes.length})
                              </h5>
                              <div className="space-y-2">
                                {mod.quizzes.map((q) => (
                                  <div key={q.question_id} className="p-3 rounded-lg bg-blue-50/40 border border-blue-100">
                                    <div className="font-bold text-slate-100 mb-1">{q.question_text}</div>
                                    <div className="text-emerald-700 font-semibold mb-0.5">
                                      Correct Answer: {q.correct_answer}
                                    </div>
                                    <div className="text-slate-400 text-[11px] italic">Explanation: {q.explanation}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW MODE 2: SOURCE CITATIONS */}
      {viewMode === 'sources' && (
        <div className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-100 mb-3">Cited Source Policy Documents</h3>
          {sources?.source_citations && sources.source_citations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {sources.source_citations.map((c, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-800 bg-slate-950/50 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      {c.source_document_id} (v{c.source_document_version})
                    </span>
                    {c.is_mandatory && (
                      <span className="px-2 py-0.5 text-[10px] uppercase font-bold bg-amber-100 text-amber-800 rounded">
                        Mandatory
                      </span>
                    )}
                  </div>
                  <div className="font-bold text-slate-100 text-sm">{c.source_document_title}</div>
                  <div className="text-slate-400">
                    Section: <span className="font-semibold">{c.source_section_id}</span> • Module: {c.module_title} ({c.module_code})
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-slate-400 text-xs">No citation breakdown recorded for this plan.</div>
          )}
        </div>
      )}

      {/* VIEW MODE 3: RAW JSON */}
      {viewMode === 'json' && (
        <div className="p-6">
          <pre className="p-4 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto max-h-[500px]">
            {JSON.stringify(rawJson || plan, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
