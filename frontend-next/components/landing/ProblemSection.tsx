import React from 'react';
import { Card } from '../ui/Card';

export const ProblemSection: React.FC = () => {
  const problems = [
    {
      icon: '📂',
      title: 'Scattered Company Knowledge',
      description: 'Critical policies and SOPs live across disparate PDFs, wiki pages, and local documents without unified indexing.',
    },
    {
      icon: '📐',
      title: 'Generic Onboarding Plans',
      description: 'One-size-fits-all templates ignore specific role competencies, leading to wasted time and missing compliance requirements.',
    },
    {
      icon: '🔄',
      title: 'Outdated Training Materials',
      description: 'When company policies update, employee onboarding modules are rarely updated, creating legal and operational risk.',
    },
    {
      icon: '🤖',
      title: 'Unvalidated AI Hallucinations',
      description: 'Generic AI chatbots generate plausible-sounding onboarding advice that lacks exact source traceability and policy grounding.',
    },
    {
      icon: '⏳',
      title: 'Manual Review Bottlenecks',
      description: 'Compliance and HR officers spend countless hours manually building, auditing, and re-checking employee learning schedules.',
    },
    {
      icon: '📊',
      title: 'Zero Completion Visibility',
      description: 'Management lacks deterministic tracking to verify whether employees truly master mandatory role requirements or just skip slides.',
    },
  ];

  return (
    <section id="problem" className="py-20 bg-slate-900 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold text-rose-600 uppercase tracking-wider bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
            The Industry Challenge
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-100 mt-4 tracking-tight">
            Traditional onboarding breaks at scale
          </h2>
          <p className="mt-4 text-slate-400 text-base sm:text-lg">
            Relying on manual onboarding preparation or unverified GenAI chatbots exposes organizations to compliance errors and low knowledge retention.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {problems.map((item) => (
            <Card
              key={item.title}
              className="border-slate-800 hover:border-slate-700 transition-all shadow-sm hover:shadow-md bg-slate-950/50"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-800/60 border border-slate-800 flex items-center justify-center text-xl mb-4">
                {item.icon}
              </div>
              <h3 className="text-lg font-bold text-slate-100 mb-2">{item.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{item.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
