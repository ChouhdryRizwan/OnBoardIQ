import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

export const PolicyUpdates: React.FC = () => {
  const steps = [
    { title: 'Policy Version 1', desc: 'Original baseline document uploaded.' },
    { title: 'Change Detection', desc: 'Diff analysis detects modified sections.' },
    { title: 'Impact Analysis', desc: 'Identifies affected roles & modules.' },
    { title: 'Selective Regeneration', desc: 'Regenerates ONLY affected content.' },
    { title: 'Independent Validation', desc: 'Re-audits updated plan via Pipeline 2.' },
    { title: 'Human Approval', desc: 'Compliance officer approves update.' },
  ];

  return (
    <section id="policy-updates" className="py-20 bg-slate-900 text-white border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="indigo" className="mb-4 bg-indigo-950 text-indigo-300 border-indigo-700">
            Module 7 Capability
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Policies change. Training should change with them.
          </h2>
          <p className="mt-4 text-slate-300 text-base sm:text-lg">
            When company policies update, OnBoardIQ performs intelligent impact analysis to selectively regenerate only affected onboarding modules.
          </p>
        </div>

        {/* Visual Pipeline Workflow Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {steps.map((item, idx) => (
            <Card key={item.title} className="bg-slate-950 border-slate-800 text-slate-200">
              <div className="flex items-center gap-3 mb-2">
                <span className="w-7 h-7 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-800 text-xs font-bold flex items-center justify-center">
                  0{idx + 1}
                </span>
                <h3 className="font-bold text-base text-white">{item.title}</h3>
              </div>
              <p className="text-xs text-slate-400 pl-10 leading-relaxed">{item.desc}</p>
            </Card>
          ))}
        </div>

        {/* Key Highlights Callout Banner */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="bg-slate-950/80 border border-emerald-900/60 rounded-xl p-6 text-left">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-emerald-400 font-bold text-base">✓</span>
              <h4 className="font-bold text-white text-base">Unchanged Training Stays Untouched</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              No full plan regenerations. If a 10-module onboarding plan has only 1 module impacted by a policy change, 9 modules remain completely unaltered.
            </p>
          </div>

          <div className="bg-slate-950/80 border border-indigo-900/60 rounded-xl p-6 text-left">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-indigo-400 font-bold text-base">✓</span>
              <h4 className="font-bold text-white text-base">Employee Progress History is Preserved</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Completed module history, past quiz scores, and audit timestamps are locked and immutable, preventing employee progress loss.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
