'use client';

import React from 'react';
import { MandatoryTrainingReportItem } from '@/lib/services/employeeDashboard';
import { ShieldCheck, FileText, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

interface EmployeeMandatoryTrainingProps {
  mandatoryItems: MandatoryTrainingReportItem[];
  loading: boolean;
  error?: string;
  employeeName?: string;
}

export function EmployeeMandatoryTraining({
  mandatoryItems,
  loading,
  error,
  employeeName,
}: EmployeeMandatoryTrainingProps) {
  if (loading) {
    return (
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="h-20 bg-slate-800/60 rounded-lg mb-3"></div>
        <div className="h-20 bg-slate-800/60 rounded-lg"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-100 mb-2">Mandatory Compliance Requirements</h2>
        <div className="flex items-center text-amber-600 bg-amber-50 p-4 rounded-lg text-sm">
          <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  // Filter items matching current employee if employeeName provided
  const personalItems = employeeName
    ? mandatoryItems.filter(
        (item) => item.employee_name && item.employee_name.toLowerCase().includes(employeeName.toLowerCase())
      )
    : mandatoryItems;

  const displayList = personalItems.length > 0 ? personalItems : mandatoryItems;

  const totalMandatory = displayList.length;
  const completedCount = displayList.filter(
    (i) => i.completion_status === 'completed' || i.completion_status === 'compliant'
  ).length;

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            Mandatory Policy Requirements
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Required training modules derived from internal company policies
          </p>
        </div>
        <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-800">
          <span>Compliance Score:</span>
          <span className="font-bold text-indigo-900">
            {totalMandatory > 0 ? Math.round((completedCount / totalMandatory) * 100) : 100}%
          </span>
        </div>
      </div>

      {displayList.length === 0 ? (
        <div className="text-center py-6 border border-dashed border-slate-800 rounded-lg text-slate-400 text-sm">
          No mandatory policy training requirements assigned currently.
        </div>
      ) : (
        <div className="space-y-3">
          {displayList.map((item) => {
            const isDone = item.completion_status === 'completed' || item.completion_status === 'compliant';

            return (
              <div
                key={item.requirement_id}
                className="p-4 rounded-lg border border-slate-800 bg-slate-950/50 hover:bg-slate-950 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-100">{item.requirement_title}</span>
                    <span className="px-2 py-0.5 text-[10px] uppercase font-bold bg-amber-100 text-amber-800 rounded">
                      Mandatory
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      Policy: <span className="font-mono text-slate-300">{item.source_document_id}</span> (v{item.source_document_version})
                    </span>
                    <span>•</span>
                    <span>Role: {item.role_title}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                      isDone
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                    )}
                    {isDone ? 'Compliant' : 'Action Pending'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
