import React from 'react';

export const TrustStrip: React.FC = () => {
  const capabilities = [
    { title: 'Traceable', description: '100% document section citations' },
    { title: 'Validated', description: 'Independent Python audit engine' },
    { title: 'Human Reviewed', description: 'Immutable approval & audit trail' },
    { title: 'Version Aware', description: 'Diff update & impact analysis' },
    { title: 'Role Specific', description: 'Ground-truth RRM rule matching' },
  ];

  return (
    <section className="bg-slate-900 border-y border-slate-800 py-6 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-slate-800">
          {capabilities.map((item, idx) => (
            <div key={item.title} className={`${idx > 0 ? 'pt-4 md:pt-0' : ''} px-2`}>
              <div className="flex items-center justify-center gap-1.5 text-white font-bold text-sm tracking-wide uppercase">
                <span className="text-indigo-400 text-xs">◆</span>
                {item.title}
              </div>
              <p className="text-xs text-slate-400 mt-1 font-normal line-clamp-1">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
