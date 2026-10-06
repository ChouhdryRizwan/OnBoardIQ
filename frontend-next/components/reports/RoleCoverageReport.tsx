'use client';

import React from 'react';
import { RoleCoverageReportItem } from '@/lib/services/reports';
import { Briefcase, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

interface RoleCoverageReportProps {
  items: RoleCoverageReportItem[];
  loading: boolean;
}

export function RoleCoverageReport({ items, loading }: RoleCoverageReportProps) {
  if (loading) {
    return (
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm animate-pulse space-y-4">
        <div className="h-6 bg-slate-800 rounded w-1/3"></div>
        <div className="h-32 bg-slate-800/60 rounded"></div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-8 shadow-sm text-center">
        <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-200">No Role Coverage Metrics Found</h3>
        <p className="text-sm text-slate-400 mt-1">Configure job roles and requirements in RRM workspace.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-800/60 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            Role & Requirement Matrix (RRM) Ground-Truth Coverage ({items.length} Roles)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Role requirement fulfillment, mandatory rule coverage, missing requirements, and deterministic verification.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 border-b border-slate-800 text-slate-300 font-bold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="p-3.5">Role Code & Title</th>
              <th className="p-3.5">Department</th>
              <th className="p-3.5">Total Requirements</th>
              <th className="p-3.5">Mandatory Reqs</th>
              <th className="p-3.5">Covered / Missing</th>
              <th className="p-3.5">Coverage %</th>
              <th className="p-3.5">Rule Failures</th>
              <th className="p-3.5">Plan Version</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {items.map((item) => (
              <tr key={item.role_code} className="hover:bg-slate-950/80 transition-colors">
                <td className="p-3.5">
                  <div className="font-mono font-bold text-indigo-400 text-[11px]">{item.role_code}</div>
                  <div className="font-bold text-slate-100 text-sm">{item.role_title}</div>
                </td>
                <td className="p-3.5 font-semibold text-slate-200">{item.department}</td>
                <td className="p-3.5 font-semibold text-slate-200 font-mono">{item.total_rrm_requirements}</td>
                <td className="p-3.5">
                  <span className="font-bold text-rose-300 bg-rose-500/10 px-2.5 py-1 rounded border border-rose-500/30 w-fit font-mono inline-block">
                    {item.mandatory_requirements} Mandatory
                  </span>
                </td>
                <td className="p-3.5">
                  <span className="font-semibold text-emerald-400">{item.covered_requirements} Covered</span>
                  {item.missing_requirements > 0 && (
                    <span className="text-rose-400 ml-2 font-semibold">• {item.missing_requirements} Missing</span>
                  )}
                </td>
                <td className="p-3.5">
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-slate-800/60 h-2 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className={`h-full rounded-full ${
                          item.coverage_percentage >= 90 ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${Math.min(100, item.coverage_percentage)}%` }}
                      />
                    </div>
                    <span className="font-bold text-slate-100 font-mono">
                      {Math.round(item.coverage_percentage)}%
                    </span>
                  </div>
                </td>
                <td className="p-3.5">
                  {item.validation_failures > 0 ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold bg-rose-500/10 text-rose-300 border border-rose-500/30">
                      <AlertTriangle className="w-3 h-3 mr-1" /> {item.validation_failures} Failures
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> 0 Failures
                    </span>
                  )}
                </td>
                <td className="p-3.5 font-mono text-slate-400">{item.current_plan_version}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
