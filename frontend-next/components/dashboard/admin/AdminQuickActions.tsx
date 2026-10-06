import React from 'react';
import { Card } from '../../ui/Card';
import { QuickActionCard } from '../shared/QuickActionCard';

export const AdminQuickActions: React.FC = () => {
  const actions = [
    {
      title: 'Upload Document SOP',
      subtitle: 'Module 1 Ingestion',
      description: 'Ingest company manuals and SOP policies with page-level citations.',
      href: '/admin/documents',
      buttonText: 'Upload Document →',
      icon: '📄',
    },
    {
      title: 'Manage Role Matrix (RRM)',
      subtitle: 'Module 2 Compliance',
      description: 'Set mandatory topics, pass rates, and prerequisite rules per job role.',
      href: '/admin/rrm',
      buttonText: 'Open RRM →',
      icon: '🎯',
    },
    {
      title: 'Generate Onboarding Plan',
      subtitle: 'Module 3 Pipeline 1',
      description: 'Trigger GenAI plan generation with Pydantic schema validation.',
      href: '/admin/pipeline1',
      buttonText: 'Generate Plan →',
      icon: '🤖',
    },
    {
      title: 'Human Review Queue',
      subtitle: 'Module 5 Governance',
      description: 'Approve, edit, reject, or manually override generated plans.',
      href: '/admin/human-review',
      buttonText: 'Review Queue →',
      icon: '⚖️',
    },
    {
      title: 'Policy Impact Analysis',
      subtitle: 'Module 7 Regeneration',
      description: 'Diff updated policies and selectively regenerate affected modules.',
      href: '/admin/policy-updates',
      buttonText: 'View Policy Impact →',
      icon: '🔄',
    },
    {
      title: 'Reports & Analytics',
      subtitle: 'Module 8 Exports',
      description: 'Export audit analytics and completion reports to CSV, Excel, or PDF.',
      href: '/admin/reports',
      buttonText: 'Open Reports →',
      icon: '📈',
    },
  ];

  return (
    <Card className="bg-slate-900 border-slate-800 p-6 shadow-xl">
      <div className="border-b border-slate-800 pb-3 mb-4">
        <h3 className="text-base font-bold text-white">Administrator Quick Actions</h3>
        <p className="text-xs text-slate-400 mt-0.5">Direct shortcuts to admin-authorized platform modules</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {actions.map((act) => (
          <QuickActionCard
            key={act.title}
            title={act.title}
            subtitle={act.subtitle}
            description={act.description}
            href={act.href}
            buttonText={act.buttonText}
            icon={act.icon}
          />
        ))}
      </div>
    </Card>
  );
};
