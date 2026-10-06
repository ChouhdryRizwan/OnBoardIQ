'use client';

import React from 'react';
import Link from 'next/link';
import {
  FileText,
  Layers,
  ShieldCheck,
  BarChart3,
  RefreshCw,
  Users,
  PlusCircle,
} from 'lucide-react';

export const TrainingQuickActions: React.FC = () => {
  const actions = [
    {
      title: 'Document Library',
      description: 'Upload & manage policy documents',
      href: '/documents',
      icon: FileText,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Role Requirement Matrix',
      description: 'Define & inspect role skills',
      href: '/rrm',
      icon: Layers,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Human Review Queue',
      description: 'Approve AI-generated onboarding plans',
      href: '/review/queue',
      icon: ShieldCheck,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
    },
    {
      title: 'Reports & Analytics',
      description: 'Export employee progress metrics',
      href: '/reports',
      icon: BarChart3,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
    },
    {
      title: 'Policy Update Detection',
      description: 'Trigger selective plan regeneration',
      href: '/policy-updates',
      icon: RefreshCw,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10',
    },
    {
      title: 'Employee Tracking',
      description: 'Manage individual learning plans',
      href: '/employees',
      icon: Users,
      color: 'text-rose-400',
      bgColor: 'bg-rose-500/10',
    },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 min-w-0 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-100 flex items-center space-x-2">
          <PlusCircle className="h-5 w-5 text-indigo-400" />
          <span>Quick Actions & Shortcuts</span>
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 min-w-0">
        {actions.map((action, idx) => {
          const Icon = action.icon;
          return (
            <Link
              key={idx}
              href={action.href}
              className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-slate-700 hover:bg-slate-900/80 transition-all duration-200 flex items-start space-x-3 group min-w-0"
            >
              <div className={`p-2.5 rounded-lg ${action.bgColor} shrink-0 group-hover:scale-105 transition-transform`}>
                <Icon className={`h-5 w-5 ${action.color}`} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors truncate">
                  {action.title}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 leading-normal line-clamp-2">
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
