'use client';

import React from 'react';
import { Pipeline1ExecutionRun } from '@/lib/services/pipeline1';
import { Cpu, CheckCircle2, Clock, Hash, RefreshCw } from 'lucide-react';

interface Pipeline1GenerationMetadataProps {
  executionRun: Pipeline1ExecutionRun | null;
  loading: boolean;
}

export function Pipeline1GenerationMetadata({ executionRun, loading }: Pipeline1GenerationMetadataProps) {
  if (loading) {
    return (
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm mb-6 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/4 mb-4"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="h-16 bg-slate-800/60 rounded"></div>
          <div className="h-16 bg-slate-800/60 rounded"></div>
        </div>
      </div>
    );
  }

  if (!executionRun) return null;

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm mb-6">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-indigo-600" />
            GenAI Execution Telemetry & Metadata
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Technical telemetry recorded during LLM plan synthesis
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
          <div className="text-slate-400 flex items-center gap-1">
            <Hash className="w-3.5 h-3.5 text-slate-400" /> Execution ID
          </div>
          <div className="font-mono font-bold text-slate-100 mt-1 line-clamp-1">
            {executionRun.execution_id}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
          <div className="text-slate-400 flex items-center gap-1">
            <Cpu className="w-3.5 h-3.5 text-slate-400" /> Model Name
          </div>
          <div className="font-bold text-slate-100 mt-1">{executionRun.model_name}</div>
        </div>

        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
          <div className="text-slate-400">Prompt Version</div>
          <div className="font-mono font-bold text-slate-100 mt-1">{executionRun.prompt_version}</div>
        </div>

        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
          <div className="text-slate-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" /> Latency
          </div>
          <div className="font-bold text-indigo-600 mt-1">{executionRun.latency_ms} ms</div>
        </div>

        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
          <div className="text-slate-400 flex items-center gap-1">
            <RefreshCw className="w-3.5 h-3.5 text-slate-400" /> Retry Attempts
          </div>
          <div className="font-bold text-slate-100 mt-1">{executionRun.retry_count} retries</div>
        </div>

        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
          <div className="text-slate-400">Pydantic Schema</div>
          <div className="font-bold text-emerald-600 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {executionRun.schema_validation_passed ? 'Valid JSON' : 'Failed'}
          </div>
        </div>
      </div>
    </div>
  );
}
