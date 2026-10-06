'use client';

import React from 'react';
import Link from 'next/link';
import { PolicyCoverageReportItem } from '@/lib/services/reports';
import { FileText, ArrowRight, RefreshCw, CheckCircle2 } from 'lucide-react';

interface PolicyCoverageReportProps {
  items: PolicyCoverageReportItem[];
  loading: boolean;
}

export function PolicyCoverageReport({ items, loading }: PolicyCoverageReportProps) {
  if (loading) {
    return (
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm animate-pulse space-y-4">
        <div className="h-6 bg-slate-800 rounded w-1/3"></div>
        <div className="h-32 bg-slate-800/60 rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            Company Policy Document Coverage & Version Traceability ({items.length} Documents)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Active version metrics, affected roles/plans/employees count, and policy update sync state.
          </p>
        </div>

        <Link
          href="/admin/policy-updates"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg inline-flex items-center gap-1.5 transition-colors shadow-sm whitespace-nowrap"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Manage Policy Updates & Impact <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-300 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3.5">Document ID & Title</th>
                <th className="p-3.5">Policy Version</th>
                <th className="p-3.5">Effective Date</th>
                <th className="p-3.5">Affected Roles</th>
                <th className="p-3.5">Affected Plans</th>
                <th className="p-3.5">Affected Employees</th>
                <th className="p-3.5">Coverage %</th>
                <th className="p-3.5">Version Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {items.map((item) => (
                <tr key={item.document_id} className="hover:bg-slate-950/80 transition-colors">
                  <td className="p-3.5">
                    <div className="font-mono font-bold text-indigo-400 text-[11px]">{item.document_id}</div>
                    <div className="font-bold text-slate-100 text-sm">{item.document_title}</div>
                  </td>
                  <td className="p-3.5 font-mono text-slate-100 font-bold">
                    v{item.policy_version}.0
                  </td>
                  <td className="p-3.5 text-slate-400 font-mono">{item.effective_date}</td>
                  <td className="p-3.5 font-semibold text-slate-200 font-mono">{item.affected_roles_count} Roles</td>
                  <td className="p-3.5 font-semibold text-slate-200 font-mono">{item.affected_plans_count} Plans</td>
                  <td className="p-3.5 font-semibold text-slate-200 font-mono">{item.affected_employees_count} Employees</td>
                  <td className="p-3.5 font-bold text-emerald-400 font-mono">
                    {Math.round(item.current_coverage_percentage)}%
                  </td>
                  <td className="p-3.5">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 capitalize">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> {item.version_status.replace(/_/g, ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
