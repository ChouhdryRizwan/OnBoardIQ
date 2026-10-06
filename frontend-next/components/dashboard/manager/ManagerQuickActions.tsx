'use client';

import React from 'react';
import Link from 'next/link';
import {
  Users,
  BookOpen,
  Layers,
  RefreshCw,
  BarChart3,
  PlusCircle,
  FileCheck,
} from 'lucide-react';

export const ManagerQuickActions: React.FC = () => {
  const actions = [
    {
      title: 'Team Roster & Status',
      description: 'View team members and onboarding progress',
      href: '/manager/team',
      icon: Users,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Team Status Breakdown',
      description: 'Detailed stage and milestone reports',
      href: '/manager/status',
      icon: FileCheck,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
    },
    {
      title: 'Training Plans Library',
      description: 'Inspect active employee onboarding plans',
      href: '/training/plans',
      icon: BookOpen,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Role Requirement Matrix',
      description: 'View competency standards per role',
      href: '/admin/rrm',
      icon: Layers,
      color: 'text-sky-400',
      bgColor: 'bg-sky-500/10',
    },
    {
      title: 'Policy Updates & Diffs',
      description: 'Monitor document changes & plan sync',
      href: '/admin/policy-updates',
      icon: RefreshCw,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10',
    },
    {
      title: 'Reports Workspace',
      description: 'Access progress & mandatory training logs',
      href: '/admin/reports',
      icon: BarChart3,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
    },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-100 flex items-center space-x-2">
          <PlusCircle className="h-5 w-5 text-indigo-400" />
          <span>Manager Quick Actions & Shortcuts</span>
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
