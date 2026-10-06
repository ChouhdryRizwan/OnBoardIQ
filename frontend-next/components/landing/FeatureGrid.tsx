import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

export const FeatureGrid: React.FC = () => {
  const modules = [
    {
      num: '01',
      title: 'Document Management',
      icon: '📂',
      desc: 'Ingest PDF, DOCX & Markdown policy manuals with section-level checksum traceability.',
    },
    {
      num: '02',
      title: 'Role Requirement Matrix (RRM)',
      icon: '🎯',
      desc: 'Define mandatory competency topics, pass criteria, and circular dependency checks per role.',
    },
    {
      num: '03',
      title: 'AI Onboarding Generation',
      icon: '🤖',
      desc: 'Construct structured multi-stage plans, tasks, and quizzes using Pydantic JSON validation.',
    },
    {
      num: '04',
      title: 'Deterministic Validation',
      icon: '🛡️',
      desc: 'Calculate mandatory rule coverage % and citation accuracy using 100% pure Python logic.',
    },
    {
      num: '05',
      title: 'Human Review Queue',
      icon: '⚖️',
      desc: 'Empower compliance managers to approve, edit, reject, or override candidate plans.',
    },
    {
      num: '06',
      icon: '🎓',
      title: 'Employee Learning Portal',
      desc: 'Read-only student dashboard for interactive quiz taking, score tracking, and weak-area review.',
    },
    {
      num: '07',
      title: 'Policy Impact Analysis',
      icon: '🔄',
      desc: 'Diff policy updates and selectively regenerate affected modules without losing progress history.',
    },
    {
      num: '08',
      title: 'Reports & Analytics',
      icon: '📈',
      desc: 'Export deterministic audit analytics to CSV, Excel, and PDF formats for compliance reviews.',
    },
  ];

  return (
    <section id="features" className="py-20 bg-slate-950 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="indigo" className="mb-4">
            Platform Capabilities
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight">
            Complete Feature Breakdown
          </h2>
          <p className="mt-4 text-slate-400 text-base sm:text-lg">
            Explore the 8 integrated modules powering enterprise employee onboarding compliance.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {modules.map((m) => (
            <Card key={m.num} className="bg-slate-900 border-slate-800 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Module {m.num}</span>
                <span className="text-xl">{m.icon}</span>
              </div>
              <h3 className="text-base font-bold text-slate-100 mb-2">{m.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{m.desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
