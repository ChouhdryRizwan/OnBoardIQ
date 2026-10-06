import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

export const AnalyticsPreview: React.FC = () => {
  const metrics = [
    { title: 'Training Progress', value: '78.4%', label: 'Organization Average Completion Rate' },
    { title: 'Mandatory Rule Coverage', value: '100%', label: 'RRM Ground-Truth Compliance Score' },
    { title: 'Quiz First-Pass Rate', value: '86.2%', label: 'Average Score on First Assessment' },
    { title: 'Source Traceability', value: '100%', label: 'Verified Document Section Citations' },
    { title: 'Policy Update Impact', value: '< 15%', label: 'Average Modules Impacted per Policy Update' },
    { title: 'Human Approval Queue', value: '100%', label: 'All Released Plans Reviewed & Signed' },
  ];

  return (
    <section id="analytics" className="py-20 bg-slate-900 text-white border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="indigo" className="mb-4 bg-indigo-950 text-indigo-300 border-indigo-700">
            Module 8 — Deterministic Reporting
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Visibility from onboarding to completion
          </h2>
          <p className="mt-4 text-slate-300 text-base sm:text-lg">
            Generate deterministic compliance analytics across departments, roles, and policy versions with multi-format export (CSV, Excel, PDF).
          </p>
        </div>

        {/* Analytics Product Preview Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {metrics.map((item) => (
            <Card key={item.title} className="bg-slate-950 border-slate-800 text-slate-200 p-6">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">{item.title}</span>
              <div className="text-3xl sm:text-4xl font-extrabold text-white mb-2 font-mono">{item.value}</div>
              <p className="text-xs text-slate-400">{item.label}</p>
            </Card>
          ))}
        </div>

        <div className="text-center text-xs text-slate-400">
          * Representative UI preview metrics derived from deterministic calculation engines.
        </div>
      </div>
    </section>
  );
};
