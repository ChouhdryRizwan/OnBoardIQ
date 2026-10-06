'use client';

import React from 'react';
import { FileSpreadsheet, Download, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export const ReviewerReports: React.FC = () => {
  const reports = [
    {
      name: 'Source Traceability Matrix',
      type: 'CSV / Audit Log',
      description: 'Document Chunk → RRM → Plan Module mapping',
      href: '/admin/reports?type=traceability',
    },
    {
      name: 'Hallucination & Contradiction Report',
      type: 'JSON / Report',
      description: 'Pipeline 2 flags & unsupported statement log',
      href: '/admin/reports?type=hallucinations',
    },
    {
      name: 'GenAI vs Python Comparison Summary',
      type: 'PDF / Audit',
      description: 'Ground-truth agreement rate & coverage delta',
      href: '/admin/reports?type=genai-vs-python',
    },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <FileSpreadsheet className="h-5 w-5 text-emerald-400" />
          <h3 className="font-semibold text-slate-100">Reviewer Audit Reports</h3>
        </div>
        <Link
          href="/admin/reports"
          className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
        >
          <span>All Reports</span>
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {reports.map((report, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-lg bg-slate-950/40 border border-slate-800/80 flex flex-col justify-between hover:border-slate-700 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-slate-200">{report.name}</span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                  {report.type}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mb-3">{report.description}</p>
            </div>

            <Link
              href={report.href}
              className="w-full py-1.5 px-3 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center space-x-1.5 transition-colors"
            >
              <Download className="h-3.5 w-3.5 text-slate-400" />
              <span>Access Report</span>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};
