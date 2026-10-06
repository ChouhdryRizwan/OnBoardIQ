import React from 'react';

export const SolutionFlow: React.FC = () => {
  const steps = [
    {
      step: '01',
      icon: '📄',
      title: 'Company Documents',
      text: 'Upload PDF, DOCX, & Markdown SOPs with chunk-level heading extraction.',
    },
    {
      step: '02',
      icon: '🎯',
      title: 'Role Requirement Matrix',
      text: 'Define mandatory competencies, pass rates, & prerequisite chains per role.',
    },
    {
      step: '03',
      icon: '🤖',
      title: 'AI Generation (Pipeline 1)',
      text: 'Contextually generates role-tailored onboarding modules, tasks, and quizzes.',
    },
    {
      step: '04',
      icon: '🛡️',
      title: 'Deterministic Validation (Pipeline 2)',
      text: 'Independently calculates ground-truth rule coverage % with 100% pure Python rules.',
    },
    {
      step: '05',
      icon: '⚖️',
      title: 'Human Review & Approval',
      text: 'Compliance officers inspect, edit, approve, or override candidate plans.',
    },
    {
      step: '06',
      icon: '🎓',
      title: 'Employee Learning',
      text: 'Employees complete interactive modules, assessments, and weak-area reviews.',
    },
    {
      step: '07',
      icon: '🔄',
      title: 'Policy Updates',
      text: 'Impact analysis detects policy diffs and selectively regenerates affected modules.',
    },
    {
      step: '08',
      icon: '📈',
      title: 'Analytics & Reporting',
      text: 'Deterministic reporting exports audit-ready CSV, Excel, and PDF analytics.',
    },
  ];

  return (
    <section id="solution-flow" className="py-20 bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider bg-indigo-950 px-3 py-1 rounded-full border border-indigo-800">
            End-to-End Lifecycle
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-4 tracking-tight">
            One platform. From policy to progress.
          </h2>
          <p className="mt-4 text-slate-300 text-base sm:text-lg">
            OnBoardIQ integrates the complete document-to-analytics pipeline with strict architectural separation between AI generation and deterministic audit.
          </p>
        </div>

        {/* Responsive Connected Workflow Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((item, index) => (
            <div
              key={item.step}
              className="bg-slate-950 border border-slate-800 rounded-xl p-6 relative hover:border-indigo-600/50 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="w-9 h-9 rounded-lg bg-indigo-950 text-indigo-400 border border-indigo-800 flex items-center justify-center font-bold text-sm">
                    {item.step}
                  </span>
                  <span className="text-2xl">{item.icon}</span>
                </div>
                <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{item.text}</p>
              </div>

              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-indigo-500 font-bold text-lg">
                  →
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
