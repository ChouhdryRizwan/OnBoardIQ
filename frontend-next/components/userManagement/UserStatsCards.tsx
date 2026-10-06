'use client';

import React from 'react';
import { UserKPIStats } from '@/lib/services/userManagement';
import { Users, UserCheck, Shield, GraduationCap, Scale, Briefcase } from 'lucide-react';

interface UserStatsCardsProps {
  stats: UserKPIStats | null;
  loading: boolean;
}

export function UserStatsCards({ stats, loading }: UserStatsCardsProps) {
  if (loading || !stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-24 bg-slate-900 border border-slate-800 rounded-xl p-3 animate-pulse" />
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: 'Total Users',
      value: stats.total_users,
      icon: Users,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-950/50 border-indigo-800/50',
    },
    {
      label: 'Active Users',
      value: stats.active_users,
      icon: UserCheck,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-950/50 border-emerald-800/50',
    },
    {
      label: 'Employees',
      value: stats.employee_count,
      icon: GraduationCap,
      color: 'text-sky-400',
      bgColor: 'bg-sky-950/50 border-sky-800/50',
    },
    {
      label: 'Admins',
      value: stats.admin_count,
      icon: Shield,
      color: 'text-purple-400',
      bgColor: 'bg-purple-950/50 border-purple-800/50',
    },
    {
      label: 'Training Mgrs',
      value: stats.training_manager_count,
      icon: Briefcase,
      color: 'text-teal-400',
      bgColor: 'bg-teal-950/50 border-teal-800/50',
    },
    {
      label: 'Reviewers',
      value: stats.reviewer_count,
      icon: Scale,
      color: 'text-amber-400',
      bgColor: 'bg-amber-950/50 border-amber-800/50',
    },
    {
      label: 'Managers',
      value: stats.manager_count,
      icon: Briefcase,
      color: 'text-rose-400',
      bgColor: 'bg-rose-950/50 border-rose-800/50',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div
            key={i}
            className={`p-3.5 rounded-xl border bg-slate-900 border-slate-800 flex flex-col justify-between transition-all hover:border-slate-700`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider truncate">
                {card.label}
              </span>
              <div className={`p-1.5 rounded-lg border ${card.bgColor}`}>
                <Icon className={`w-3.5 h-3.5 ${card.color}`} />
              </div>
            </div>
            <div className="mt-2 text-xl font-bold text-slate-100 font-mono">
              {card.value}
            </div>
          </div>
        );
      })}
    </div>
  );
}
