'use client';

import React from 'react';
import { BarChart3, RefreshCw, Download, FileSpreadsheet, CheckCircle2 } from 'lucide-react';

interface ReportsHeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  lastRefreshed?: Date;
  loading?: boolean;
  onRefresh?: () => void;
  onExport?: (format: 'csv' | 'excel' | 'pdf') => void;
}

export function ReportsHeader({
  activeTab,
  onTabChange,
  lastRefreshed,
  loading = false,
  onRefresh,
  onExport,
}: ReportsHeaderProps) {
  const tabs = [
    { id: 'overview', label: 'Overview KPIs' },
    { id: 'employee_progress', label: 'Employee Progress' },
    { id: 'role_coverage', label: 'Role Coverage' },
    { id: 'mandatory_training', label: 'Mandatory Compliance' },
    { id: 'assessments', label: 'Assessments' },
    { id: 'traceability', label: 'Source Traceability' },
    { id: 'validation_quality', label: 'Validation Quality' },
    { id: 'policy_coverage', label: 'Policy Coverage' },
    { id: 'genai_vs_python', label: 'GenAI vs Python' },
  ];

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20">
            <BarChart3 className="w-7 h-7 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-100">Reports & Analytics</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Deterministic Engine
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-0.5">
              Audit-ready deterministic analytics across onboarding, learning progress, policy coverage, traceability, and GenAI vs Python rule validation.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {onExport && (
            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => onExport('csv')}
                className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-slate-100 text-xs font-semibold rounded shadow-sm inline-flex items-center gap-1 border border-slate-800 transition-colors"
                title="Export as CSV"
              >
                <Download className="w-3.5 h-3.5 text-indigo-400" /> CSV
              </button>
              <button
                onClick={() => onExport('excel')}
                className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-slate-100 text-xs font-semibold rounded shadow-sm inline-flex items-center gap-1 border border-slate-800 transition-colors"
                title="Export as Excel"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" /> Excel
              </button>
            </div>
          )}

          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-2.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh Reports"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Report Categories Navigation */}
      <div className="flex border-b border-slate-800 gap-1 overflow-x-auto pb-1 scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {lastRefreshed && (
        <div className="mt-2 text-right text-[11px] text-slate-400">
          Last updated: {lastRefreshed.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}
