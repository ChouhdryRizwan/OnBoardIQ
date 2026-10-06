import React from 'react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Upload Company Knowledge',
      desc: 'Ingest SOP manuals, security policies, and technical guidelines into structured document repositories.',
    },
    {
      num: '02',
      title: 'Define Role Requirements',
      desc: 'Set mandatory topics, minimum quiz pass rates, and prerequisite learning paths per job role.',
    },
    {
      num: '03',
      title: 'Generate & Validate Onboarding',
      desc: 'Pipeline 1 constructs candidate plans; Pipeline 2 independently audits ground-truth coverage and citations.',
    },
    {
      num: '04',
      title: 'Review & Approve',
      desc: 'Compliance and HR officers inspect, edit, or approve candidate onboarding plans before employee release.',
    },
    {
      num: '05',
      title: 'Track Learning & Adapt to Policy Changes',
      desc: 'Employees complete interactive modules while selective regeneration updates training when policies change.',
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-slate-900 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
            Simple 5-Step Process
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-100 mt-4 tracking-tight">
            How OnBoardIQ Works
          </h2>
          <p className="mt-4 text-slate-400 text-base sm:text-lg">
            A seamless workflow transforming static corporate documents into verifiable employee learning journeys.
          </p>
        </div>

        {/* Responsive Horizontal / Vertical Timeline */}
        <div className="relative border-l-2 border-indigo-100 ml-4 md:ml-32 space-y-12">
          {steps.map((item) => (
            <div key={item.num} className="relative pl-8 md:pl-12 group">
              {/* Step Circle Indicator */}
              <div className="absolute -left-[17px] top-0 w-8 h-8 rounded-full bg-indigo-600 text-white font-extrabold text-xs flex items-center justify-center border-4 border-white shadow-md group-hover:bg-indigo-700 transition-colors">
                {item.num}
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-bold text-slate-100 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
