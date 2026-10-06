'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Pipeline1PlanDetails, Pipeline1GenerationResult, Pipeline1ExecutionRun } from '@/lib/services/pipeline1';
import { CheckCircle2, Copy, Check, ArrowRight, ShieldCheck, Layers, Cpu, User, Briefcase, Sparkles } from 'lucide-react';

interface Pipeline1GenerationResultCardProps {
  generationResult: Pipeline1GenerationResult | null;
  planDetails: Pipeline1PlanDetails | null;
  executionRun: Pipeline1ExecutionRun | null;
}

export function Pipeline1GenerationResultCard({
  generationResult,
  planDetails,
  executionRun,
}: Pipeline1GenerationResultCardProps) {
  const router = useRouter();
  const [copiedPlanId, setCopiedPlanId] = useState(false);
  const [copiedExecId, setCopiedExecId] = useState(false);

  // If neither result nor planDetails exists, don't render
  if (!generationResult && !planDetails) return null;

  const planId = planDetails?.plan_id || generationResult?.plan_id || '';
  const executionId = executionRun?.execution_id || generationResult?.execution_id || '';
  const employeeName = planDetails?.employee_name || generationResult?.employee_id || 'N/A';
  const employeeId = planDetails?.employee_id || generationResult?.employee_id || 'N/A';
  const roleTitle = planDetails?.role_title || 'N/A';
  const roleCode = planDetails?.role_code || generationResult?.role_id || 'N/A';
  const modelName = planDetails?.genai_model || generationResult?.genai_model || 'Gemini 2.5 Flash';
  const promptVersion = planDetails?.prompt_version || generationResult?.prompt_version || 'v1.0.0';
  const verificationStatus = planDetails?.verification_status || generationResult?.verification_status || 'draft';

  const stagesCount = planDetails?.stages?.length || 0;
  const modulesCount = planDetails?.stages?.reduce((acc, stg) => acc + (stg.modules?.length || 0), 0) || 0;

  const handleCopyPlanId = () => {
    if (!planId) return;
    navigator.clipboard.writeText(planId);
    setCopiedPlanId(true);
    setTimeout(() => setCopiedPlanId(false), 2000);
  };

  const handleCopyExecId = () => {
    if (!executionId) return;
    navigator.clipboard.writeText(executionId);
    setCopiedExecId(true);
    setTimeout(() => setCopiedExecId(false), 2000);
  };

  const handleHandoffToPipeline2 = () => {
    if (!planId) return;
    router.push(`/admin/pipeline2?plan_id=${encodeURIComponent(planId)}`);
  };

  return (
    <div className="bg-slate-900 rounded-xl border border-emerald-500/40 p-6 shadow-xl mb-6 text-slate-100">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-bold text-white">Generation Successful</h3>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {verificationStatus}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Pipeline 1 synthesized onboarding plan has been generated and saved to the database.
            </p>
          </div>
        </div>

        <button
          onClick={handleHandoffToPipeline2}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl shadow-md transition-all shrink-0 hover:shadow-indigo-500/20"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Validate with Pipeline 2
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Grid Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mt-5 text-xs">
        {/* Plan ID Box */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
          <div className="text-slate-400 flex items-center justify-between">
            <span className="font-semibold">Plan ID</span>
            <button
              onClick={handleCopyPlanId}
              title="Copy Plan ID"
              className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition-colors"
            >
              {copiedPlanId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <div className="font-mono text-xs font-bold text-indigo-300 break-all mt-1.5 select-all">
            {planId || 'N/A'}
          </div>
        </div>

        {/* Execution ID Box */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
          <div className="text-slate-400 flex items-center justify-between">
            <span className="font-semibold">Execution ID</span>
            {executionId && (
              <button
                onClick={handleCopyExecId}
                title="Copy Execution ID"
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition-colors"
              >
                {copiedExecId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
          <div className="font-mono text-xs font-bold text-slate-300 break-all mt-1.5 select-all">
            {executionId || 'N/A'}
          </div>
        </div>

        {/* Employee Box */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
          <div className="text-slate-400 flex items-center gap-1 font-semibold">
            <User className="w-3.5 h-3.5 text-indigo-400" />
            <span>Target Employee</span>
          </div>
          <div className="font-bold text-slate-100 text-xs mt-1.5 truncate">
            {employeeName}
          </div>
          <div className="font-mono text-[11px] text-slate-400 mt-0.5 truncate">{employeeId}</div>
        </div>

        {/* Job Role Box */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
          <div className="text-slate-400 flex items-center gap-1 font-semibold">
            <Briefcase className="w-3.5 h-3.5 text-amber-400" />
            <span>Job Role</span>
          </div>
          <div className="font-bold text-slate-100 text-xs mt-1.5 truncate">
            {roleTitle}
          </div>
          <div className="font-mono text-[11px] text-slate-400 mt-0.5 truncate">{roleCode}</div>
        </div>

        {/* Stages & Modules Stats */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
          <div className="text-slate-400 flex items-center gap-1 font-semibold">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Structure</span>
          </div>
          <div className="font-bold text-slate-100 mt-1.5">
            <span className="text-indigo-400 font-bold">{stagesCount}</span> Stages •{' '}
            <span className="text-emerald-400 font-bold">{modulesCount}</span> Modules
          </div>
        </div>

        {/* Model */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
          <div className="text-slate-400 flex items-center gap-1 font-semibold">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            <span>GenAI Model</span>
          </div>
          <div className="font-bold text-slate-100 mt-1.5 truncate">
            {modelName}
          </div>
        </div>

        {/* System Prompt Version */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
          <div className="text-slate-400 flex items-center gap-1 font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Prompt Version</span>
          </div>
          <div className="font-mono font-bold text-slate-100 mt-1.5">
            {promptVersion}
          </div>
        </div>

        {/* Status */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
          <div className="text-slate-400 font-semibold">Status</div>
          <div className="font-bold text-emerald-400 capitalize mt-1.5">
            {verificationStatus}
          </div>
        </div>
      </div>
    </div>
  );
}
