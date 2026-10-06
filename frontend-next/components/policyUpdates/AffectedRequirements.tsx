'use client';

import React from 'react';
import { AffectedRequirementResponse } from '@/lib/services/policyUpdates';
import { Database, ArrowRight, Briefcase } from 'lucide-react';

interface AffectedRequirementsProps {
  requirements: AffectedRequirementResponse[];
  loading: boolean;
}

export function AffectedRequirements({ requirements, loading }: AffectedRequirementsProps) {
  if (loading) {
    return (
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm mb-6 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="h-16 bg-slate-800/60 rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm mb-6">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Database className="w-4 h-4 text-indigo-400" />
            Affected Ground Truth RRM Requirements ({requirements.length})
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Requirements whose source policy document version changed
          </p>
        </div>
      </div>

      {requirements.length === 0 ? (
        <div className="p-4 text-center border border-dashed border-slate-800 rounded-lg text-slate-400 text-xs">
          No RRM requirements affected by this document update.
        </div>
      ) : (
        <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
          {requirements.map((req) => (
            <div
              key={req.impact_item_id}
              className="p-3.5 rounded-lg border border-slate-800 bg-slate-950/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div>
                <div className="flex items-center gap-2 font-mono font-bold text-slate-100">
                  <span className="bg-indigo-500/10 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30">
                    {req.requirement_id}
                  </span>
                  <span className="text-slate-400 font-sans font-semibold">Change: {req.change_type}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 mt-1">
                  <span>Version Transition:</span>
                  <strong className="font-mono text-slate-300">v{req.old_source_version}</strong>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                  <strong className="font-mono text-blue-400">v{req.new_source_version}</strong>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                {req.affected_roles.map((r, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-500/10 text-purple-300 border border-purple-500/30 flex items-center gap-1"
                  >
                    <Briefcase className="w-3 h-3 text-purple-400" /> {r}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
