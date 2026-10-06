'use client';

import React from 'react';
import { Card } from '../ui/Card';
import { RRMSummaryResponseSchema } from '@/lib/services/rrm';
import { Users, BookOpen, AlertTriangle, ShieldCheck, CheckCircle2, Layers } from 'lucide-react';

interface RrmStatsProps {
  summary: RRMSummaryResponseSchema | null;
  loading: boolean;
  error?: string;
}

export function RrmStats({ summary, loading, error }: RrmStatsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="bg-slate-900 border-slate-800 p-5 animate-pulse">
            <div className="h-3 bg-slate-800 rounded w-1/2 mb-3" />
            <div className="h-7 bg-slate-800 rounded w-3/4 mb-2" />
            <div className="h-2 bg-slate-800 rounded w-1/3" />
          </Card>
        ))}
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 mb-6 text-sm text-slate-400">
        RRM summary statistics currently unavailable.
      </div>
    );
  }

  const mandatoryCount = summary.mandatory_requirements || 0;
  const totalReqs = summary.total_requirements || 0;
  const highPrioCount = summary.requirements_by_priority?.high || 0;
  const mustKnowCount = summary.requirements_by_classification?.must_know || 0;

  const stats = [
    {
      title: 'CONFIGURED JOB ROLES',
      value: summary.total_roles,
      subtitle: 'Active job roles defined in RRM',
      icon: Users,
      color: 'border-l-indigo-500',
    },
    {
      title: 'GROUND TRUTH REQS',
      value: summary.total_requirements,
      subtitle: 'Mapped benchmark requirements',
      icon: BookOpen,
      color: 'border-l-sky-500',
    },
    {
      title: 'MANDATORY REQS',
      value: mandatoryCount,
      subtitle: 'Non-negotiable compliance items',
      icon: ShieldCheck,
      color: 'border-l-emerald-500',
    },
    {
      title: 'MUST-KNOW COMPETENCIES',
      value: mustKnowCount,
      subtitle: 'Essential skill domain mappings',
      icon: CheckCircle2,
      color: 'border-l-purple-500',
    },
    {
      title: 'HIGH PRIORITY REQS',
      value: highPrioCount,
      subtitle: 'Critical onboarding requirements',
      icon: AlertTriangle,
      color: 'border-l-amber-500',
    },
    {
      title: 'MANDATORY RATIO',
      value: totalReqs > 0 ? `${Math.round((mandatoryCount / totalReqs) * 100)}%` : '100%',
      subtitle: 'Percentage of mandatory requirements',
      icon: Layers,
      color: 'border-l-cyan-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {stats.map((st) => {
        const Icon = st.icon;
        return (
          <Card key={st.title} className={`bg-slate-900 border-slate-800 border-l-4 ${st.color} p-5 shadow-lg`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{st.title}</span>
              <Icon className="w-5 h-5 text-slate-400" />
            </div>

            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{st.value}</div>
            <p className="text-xs text-slate-400 mt-1 truncate">{st.subtitle}</p>
          </Card>
        );
      })}
    </div>
  );
}
