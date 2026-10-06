import React from 'react';
import Link from 'next/link';
import { Card } from '../../ui/Card';

export const ReportsQuickAccess: React.FC = () => {
  const reports = [
    { title: 'Employee Progress', desc: 'Individual & department milestone tracking', icon: '🎓' },
    { title: 'Role Coverage Matrix', desc: 'RRM mandatory topic compliance per job role', icon: '🎯' },
    { title: 'Mandatory Training', desc: 'Overdue & required compliance training items', icon: '⚡' },
    { title: 'Assessments & Quizzes', desc: 'First-pass rates, score averages & weak areas', icon: '📝' },
    { title: 'Source Traceability', desc: 'Exact document chunk & page citations audit', icon: '🔍' },
    { title: 'Validation Results', desc: 'Pipeline 2 ground-truth defect distribution', icon: '🛡️' },
    { title: 'Policy Coverage', desc: 'Mapped vs unmapped document section ratios', icon: '📄' },
    { title: 'GenAI vs Python Comparison', desc: 'Independent audit comparison summary', icon: '⚖️' },
  ];

  return (
    <Card className="bg-slate-900 border-slate-800 p-6 shadow-xl">
      <div className="border-b border-slate-800 pb-3 mb-4">
        <h3 className="text-base font-bold text-white">Reports & Analytics Quick Access</h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Deterministic reporting modules with multi-format export (CSV, Excel-compatible, PDF)
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {reports.map((r) => (
          <Link key={r.title} href="/admin/reports">
            <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl hover:border-indigo-600/50 transition-all group">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base">{r.icon}</span>
                <h4 className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors truncate">
                  {r.title}
                </h4>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-1">{r.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
};
