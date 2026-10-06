'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Cpu,
  Layers,
  FileText,
  RefreshCw,
  CheckCircle2,
  PlusCircle,
} from 'lucide-react';

export const ReviewerQuickActions: React.FC = () => {
  const actions = [
    {
      title: 'Human Review Workspace',
      description: 'Approve, reject, or edit onboarding plans',
      href: '/admin/human-review',
      icon: ShieldCheck,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
    },
    {
      title: 'Ground-Truth Validation',
      description: 'Inspect Pipeline 2 validator outputs & logs',
      href: '/admin/pipeline2',
      icon: Cpu,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
    },
    {
      title: 'Validation Audit Log',
      description: 'Reviewer validation rules & traceability status',
      href: '/reviewer/validation',
      icon: CheckCircle2,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Role Requirement Matrix',
      description: 'Inspect RRM competencies & prerequisites',
      href: '/admin/rrm',
      icon: Layers,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Document Library',
      description: 'View policy sources & checksum versions',
      href: '/admin/documents',
      icon: FileText,
      color: 'text-sky-400',
      bgColor: 'bg-sky-500/10',
    },
    {
      title: 'Policy Impact & Sync',
      description: 'Review policy diffs & selective updates',
      href: '/admin/policy-updates',
      icon: RefreshCw,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10',
    },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-100 flex items-center space-x-2">
          <PlusCircle className="h-5 w-5 text-indigo-400" />
          <span>Reviewer Quick Actions & Navigation</span>
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {actions.map((action, idx) => {
          const Icon = action.icon;
          return (
            <Link
              key={idx}
              href={action.href}
              className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-all duration-200 flex items-start space-x-3 group"
            >
              <div className={`p-2.5 rounded-lg ${action.bgColor} shrink-0 group-hover:scale-105 transition-transform`}>
                <Icon className={`h-5 w-5 ${action.color}`} />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors">
                  {action.title}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {action.description}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
