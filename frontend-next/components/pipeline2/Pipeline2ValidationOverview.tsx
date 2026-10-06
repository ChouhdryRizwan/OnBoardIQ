'use client';

import React from 'react';
import { ValidationReportResponse } from '@/lib/services/pipeline2';
import { ShieldCheck, AlertTriangle, FileWarning, CheckCircle2, Clock } from 'lucide-react';

interface Pipeline2ValidationOverviewProps {
  report: ValidationReportResponse | null;
  loading: boolean;
}

export function Pipeline2ValidationOverview({ report, loading }: Pipeline2ValidationOverviewProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-slate-900 p-4 rounded-xl border border-slate-800 h-24"></div>
        ))}
      </div>
    );
  }

  if (!report) return null;

  const status = (report.verification_status || 'UNKNOWN').toUpperCase();

  const getStatusBadge = (st: string) => {
    switch (st) {
      case 'VERIFIED':
      case 'PASSED':
        return 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60';
      case 'NEEDS_REVIEW':
      case 'REVIEW_REQUIRED':
      case 'OUTDATED_SOURCE':
      case 'SOURCE_SUPPORT_MISSING':
      case 'REQUIREMENT_MISSING':
      case 'CONTRADICTION_DETECTED':
      case 'MANUAL_REVIEW_REQUIRED':
        return 'bg-amber-950/60 text-amber-300 border-amber-800/60';
      case 'FAILED':
      case 'REJECTED':
        return 'bg-rose-950/60 text-rose-400 border-rose-800/60';
      default:
        return 'bg-slate-800/60 text-slate-200 border-slate-700';
    }
  };

  return (
    <div className="space-y-6 mb-6">
      {/* Overview Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Verification Status Card */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
            <span>Overall Verification</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(status)}`}>
              {status}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 truncate">
            Report ID: <span className="font-mono text-slate-300 font-semibold">{report.report_id}</span>
          </div>
        </div>

        {/* Mandatory Requirement Coverage Score */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
            <span>Mandatory Coverage</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
            {report.mandatory_coverage_score}%
          </div>
          <div className="text-[11px] text-slate-400">
            {report.covered_mandatory_requirements} of {report.total_mandatory_requirements} mandatory reqs covered
          </div>
        </div>

        {/* Source Document Traceability Score */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
            <span>Source Traceability</span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
            {report.source_traceability_score}%
          </div>
          <div className="text-[11px] text-slate-400">
            Ground-truth document citation precision
          </div>
        </div>

        {/* Hallucination / Unsupported Claims Count */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
            <span>Unsupported Flags</span>
            <FileWarning className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
            {report.unsupported_requirements_count || 0}
          </div>
          <div className="text-[11px] text-slate-400">
            Hallucinated or unsupported citations
          </div>
        </div>
      </div>

      {/* Secondary Metric Bar */}
      <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 text-xs grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <span className="text-slate-400">Consistency Score:</span>{' '}
          <strong className="text-white font-mono font-bold">{report.consistency_score}%</strong>
        </div>
        <div>
          <span className="text-slate-400">Missing Mandatory:</span>{' '}
          <strong className="text-rose-400 font-mono font-bold">{report.missing_requirements_count}</strong>
        </div>
        <div>
          <span className="text-slate-400">Contradictions Found:</span>{' '}
          <strong className="text-amber-400 font-mono font-bold">{report.contradiction_count}</strong>
        </div>
        <div>
          <span className="text-slate-400">Duplicate Modules:</span>{' '}
          <strong className="text-white font-mono font-bold">{report.duplicate_count}</strong>
        </div>
      </div>

      {/* Manual Review Required Banner */}
      {report.requires_manual_review && (
        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/60 text-xs text-amber-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <span className="font-bold">Manual Review Required:</span> Python validation engine flagged policy contradictions, outdated citations, or missing mandatory requirements.
            </div>
          </div>
          <span className="px-3 py-1 bg-amber-900/60 text-amber-300 border border-amber-700/60 font-bold rounded-lg shrink-0 uppercase text-[10px]">
            Review Queue Active
          </span>
        </div>
      )}
    </div>
  );
}
