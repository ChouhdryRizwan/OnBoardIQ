'use client';

import React from 'react';
import { RRMSummaryResponseSchema, MatrixRequirementResponseSchema } from '@/lib/services/rrm';
import { ShieldCheck, FileCheck, Layers } from 'lucide-react';

interface RrmHealthProps {
  summary: RRMSummaryResponseSchema | null;
  requirements: MatrixRequirementResponseSchema[];
  loading: boolean;
}

export function RrmHealth({ summary, requirements, loading }: RrmHealthProps) {
  if (loading) {
    return (
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm mb-6 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="h-16 bg-slate-800/60 rounded"></div>
      </div>
    );
  }

  const total = requirements.length;
  const withSource = requirements.filter((r) => r.source_document_id && r.source_section_id).length;
  const mandatoryCount = requirements.filter((r) => r.is_mandatory).length;
  const totalRolesConfigured = summary?.total_roles || 0;

  const traceabilityPct = total > 0 ? Math.round((withSource / total) * 100) : 100;

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            Ground Truth Matrix Health & Source Traceability
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Deterministic evaluation of requirement-to-document traceability and matrix integrity
          </p>
        </div>

        <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-900">
          <span>Source Traceability Coverage:</span>
          <span className="font-bold text-indigo-700">{traceabilityPct}%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-700">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-400">Requirements with Source Traceability</div>
            <div className="text-base font-bold text-slate-100 mt-0.5">
              {withSource} / {total} Verified
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-indigo-100 text-indigo-700">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-400">Mandatory Ground Truth Requirements</div>
            <div className="text-base font-bold text-slate-100 mt-0.5">
              {mandatoryCount} Requirements
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-purple-100 text-purple-700">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-400">Python Validation Engine Status</div>
            <div className="text-base font-bold text-slate-100 mt-0.5">
              Active ({totalRolesConfigured} Roles Evaluated)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
