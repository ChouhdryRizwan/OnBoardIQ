import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

export const DualPipeline: React.FC = () => {
  return (
    <section id="dual-pipeline" className="py-20 bg-slate-950 text-white border-y border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="indigo" className="mb-4 bg-indigo-950 text-indigo-300 border-indigo-700">
            Core Architectural Differentiator
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            AI-generated. Independently validated.
          </h2>
          <p className="mt-4 text-slate-300 text-base sm:text-lg">
            OnBoardIQ pairs LLM context creation with a 100% non-LLM ground-truth Python audit engine for uncompromised policy compliance.
          </p>
        </div>

        {/* Side-by-Side Dual Pipeline Grid */}
        <div className="grid md:grid-cols-2 gap-8 items-stretch">
          {/* PIPELINE 1 */}
          <Card className="bg-slate-900/90 border-indigo-900/60 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-indigo-900/50 pb-4 mb-6">
                <div>
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block">Pipeline 1</span>
                  <h3 className="text-xl font-extrabold text-white">GenAI Generation Engine</h3>
                </div>
                <Badge variant="indigo" className="bg-indigo-950 text-indigo-300 border-indigo-700">
                  AI Context Creator
                </Badge>
              </div>

              <ul className="space-y-4 text-sm text-slate-300">
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-indigo-950 text-indigo-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 border border-indigo-800">✓</span>
                  <span><strong>Contextual Ingestion:</strong> Reads approved document chunks, SOP manuals, and role specifications.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-indigo-950 text-indigo-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 border border-indigo-800">✓</span>
                  <span><strong>Structured Plan Output:</strong> Generates multi-day onboarding schedules, tasks, and quizzes in Pydantic JSON.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-indigo-950 text-indigo-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 border border-indigo-800">✓</span>
                  <span><strong>Source Traceability:</strong> Attaches exact document section and chunk IDs to generated learning objectives.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-indigo-950 text-indigo-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 border border-indigo-800">✓</span>
                  <span><strong>Zero Self-Approval:</strong> Outputs initial candidate status <code className="bg-slate-800 text-indigo-300 px-1.5 py-0.5 rounded text-xs font-mono">manual_review_required</code>.</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-800 text-xs text-slate-400 bg-slate-950/50 p-3 rounded-lg">
              <span className="font-semibold text-slate-300">Role:</span> Creative personalized onboarding generator. Never approves its own outputs.
            </div>
          </Card>

          {/* PIPELINE 2 */}
          <Card className="bg-slate-900/90 border-emerald-900/60 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-emerald-900/50 pb-4 mb-6">
                <div>
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">Pipeline 2</span>
                  <h3 className="text-xl font-extrabold text-white">Deterministic Python Audit</h3>
                </div>
                <Badge variant="emerald" className="bg-emerald-950 text-emerald-300 border-emerald-700">
                  100% Non-LLM Shield
                </Badge>
              </div>

              <ul className="space-y-4 text-sm text-slate-300">
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 border border-emerald-800">✓</span>
                  <span><strong>Independent Rule Verification:</strong> Evaluates mandatory coverage % against Role Requirement Matrix deterministically.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 border border-emerald-800">✓</span>
                  <span><strong>Citation Audit:</strong> Verifies every section and page number against ingested document chunk checksums.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 border border-emerald-800">✓</span>
                  <span><strong>Defect Detection:</strong> Flags missing requirements, unreferenced claims, and policy contradictions.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 border border-emerald-800">✓</span>
                  <span><strong>Zero Third-Party LLM Calls:</strong> Operates using pure Python logic for deterministic, reproducible results.</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-800 text-xs text-slate-400 bg-slate-950/50 p-3 rounded-lg">
              <span className="font-semibold text-slate-300">Role:</span> Objective ground-truth mathematical auditor. Eliminates AI blind spots.
            </div>
          </Card>
        </div>

        {/* Highlight Callout Box */}
        <div className="mt-12 bg-gradient-to-r from-indigo-950 via-slate-900 to-emerald-950 border border-indigo-800/80 rounded-2xl p-6 sm:p-8 text-center max-w-4xl mx-auto shadow-2xl">
          <p className="text-base sm:text-xl font-bold text-white leading-relaxed">
            &ldquo;Pipeline 2 does not act as another AI opinion. It acts as an independent validation layer.&rdquo;
          </p>
          <p className="mt-2 text-xs sm:text-sm text-slate-300">
            By separating generation from audit, OnBoardIQ provides explainable, reproducible compliance scorecards.
          </p>
        </div>
      </div>
    </section>
  );
};
