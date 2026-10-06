'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, Award, FileText, User, ArrowRight, Sparkles } from 'lucide-react';

export function EmployeeQuickActions() {
  const actions = [
    {
      title: 'My Onboarding Plan',
      description: 'View full roadmap, stages, and checklist milestones',
      href: '/employee/onboarding',
      icon: Sparkles,
      iconColor: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10 border-indigo-500/20',
    },
    {
      title: 'Assigned Learning Modules',
      description: 'Access course materials, readings, and exercises',
      href: '/employee/learning',
      icon: BookOpen,
      iconColor: 'text-blue-400',
      bgColor: 'bg-blue-500/10 border-blue-500/20',
    },
    {
      title: 'Quiz & Assessments',
      description: 'Take required knowledge checks and view score history',
      href: '/employee/assessments',
      icon: Award,
      iconColor: 'text-purple-400',
      bgColor: 'bg-purple-500/10 border-purple-500/20',
    },
    {
      title: 'Mandatory Policy Docs',
      description: 'Review updated policy requirements and guidelines',
      href: '/employee/policy-updates',
      icon: FileText,
      iconColor: 'text-amber-400',
      bgColor: 'bg-amber-500/10 border-amber-500/20',
    },
    {
      title: 'Employee Profile',
      description: 'Update role details, preferences, and notifications',
      href: '/employee/profile',
      icon: User,
      iconColor: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10 border-emerald-500/20',
    },
  ];

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 sm:p-6 shadow-sm w-full max-w-full min-w-0">
      <div className="flex items-center justify-between gap-4 mb-5">
        <div className="min-w-0">
          <h2 className="text-base sm:text-lg font-bold text-slate-100 truncate">Employee Workspace Shortcuts</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5 leading-normal">Quick access to key personal learning resources</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3.5 w-full min-w-0">
        {actions.map((act) => {
          const Icon = act.icon;

          return (
            <Link
              key={act.href}
              href={act.href}
              className="relative p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 hover:bg-slate-900/90 transition-all duration-200 flex flex-col justify-between group w-full min-w-0 min-h-[130px]"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-lg border ${act.bgColor} ${act.iconColor} shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <ArrowRight className="absolute top-4 right-4 w-4 h-4 text-slate-400 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all shrink-0 pointer-events-none" />

              <div className="min-w-0 flex-1 flex flex-col justify-between">
                <h3 className="text-sm font-bold text-slate-100 group-hover:text-indigo-300 transition-colors leading-snug break-words">
                  {act.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed break-words line-clamp-2">
                  {act.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
