'use client';

import React from 'react';
import { MandatoryTrainingReportItem } from '@/lib/services/reports';
import { CheckCircle2, Clock, ShieldAlert } from 'lucide-react';

interface MandatoryTrainingReportProps {
  items: MandatoryTrainingReportItem[];
  loading: boolean;
}

export function MandatoryTrainingReport({ items, loading }: MandatoryTrainingReportProps) {
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
        <ShieldAlert className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-200">No Mandatory Training Items Found</h3>
        <p className="text-sm text-slate-400 mt-1">Check role assignment and mandatory tag configurations.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-800/60 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-indigo-400" />
            Mandatory Compliance Training Report ({items.length} Tracked Requirements)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Strict regulatory & compliance requirement completion status per employee.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 border-b border-slate-800 text-slate-300 font-bold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="p-3.5">Requirement ID & Title</th>
              <th className="p-3.5">Employee Learner</th>
              <th className="p-3.5">Role Code</th>
              <th className="p-3.5">Source Document</th>
              <th className="p-3.5">Section</th>
              <th className="p-3.5">Completion Status</th>
              <th className="p-3.5">Assessment Status</th>
              <th className="p-3.5">Validation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {items.map((item, idx) => {
              const isDone = item.completion_status === 'completed';
              return (
                <tr key={`${item.requirement_id}-${idx}`} className="hover:bg-slate-950/80 transition-colors">
                  <td className="p-3.5">
                    <span className="font-mono font-bold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/30 text-[11px]">
                      {item.requirement_id}
                    </span>
                    <div className="font-bold text-slate-100 mt-1">{item.requirement_title}</div>
                  </td>
                  <td className="p-3.5">
                    <div className="font-bold text-slate-100">{item.employee_name}</div>
                    <div className="text-[11px] text-slate-400">{item.department}</div>
                  </td>
                  <td className="p-3.5 font-mono text-slate-300 font-semibold">{item.role_code}</td>
                  <td className="p-3.5 font-mono text-slate-400">
                    {item.source_document_id} (v{item.source_document_version})
                  </td>
                  <td className="p-3.5 font-mono text-slate-400">{item.source_section_id}</td>
                  <td className="p-3.5">
                    {isDone ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Completed
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                        <Clock className="w-3 h-3 mr-1" /> Pending
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 font-semibold capitalize text-slate-300">
                    {item.assessment_status}
                  </td>
                  <td className="p-3.5 font-semibold capitalize text-slate-300">
                    {item.validation_status}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
