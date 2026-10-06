'use client';

import React from 'react';
import { PieChart, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { EmployeeProgressReportItem } from '../../../lib/services/managerDashboard';

interface TeamOnboardingProgressProps {
  items: EmployeeProgressReportItem[];
  loading: boolean;
  error?: string;
}

export const TeamOnboardingProgress: React.FC<TeamOnboardingProgressProps> = ({
  items,
  loading,
  error,
}) => {
  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 animate-pulse">
        <div className="h-6 bg-slate-800 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-10 bg-slate-800/50 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error && items.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center space-x-2 text-slate-300 font-semibold mb-3">
          <PieChart className="h-5 w-5 text-indigo-400" />
          <h3>Team Onboarding Status Breakdown</h3>
        </div>
        <p className="text-sm text-slate-400">Data unavailable: {error}</p>
      </div>
    );
  }

  const total = items.length;

  const counts = {
    completed: items.filter((item) => item.current_status === 'completed').length,
    on_track: items.filter((item) => item.current_status === 'on_track').length,
    assessment_required: items.filter((item) => item.current_status === 'assessment_required').length,
    needs_attention: items.filter(
      (item) => item.current_status === 'requires_attention' || item.current_status === 'behind_schedule'
    ).length,
  };

  const statusConfigs = [
    {
      key: 'completed',
      label: 'Completed',
      count: counts.completed,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      icon: CheckCircle2,
    },
    {
      key: 'on_track',
      label: 'In Progress (On Track)',
      count: counts.on_track,
      color: 'bg-blue-500',
      textColor: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      icon: Clock,
    },
    {
      key: 'assessment_required',
      label: 'Assessment Pending',
      count: counts.assessment_required,
      color: 'bg-purple-500',
      textColor: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      icon: Clock,
    },
    {
      key: 'needs_attention',
      label: 'Needs Attention / Behind',
      count: counts.needs_attention,
      color: 'bg-rose-500',
      textColor: 'text-rose-400',
      bgColor: 'bg-rose-500/10',
      icon: AlertCircle,
    },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <PieChart className="h-5 w-5 text-indigo-400" />
            <h3 className="font-semibold text-slate-100">Team Onboarding Progress</h3>
          </div>
          <span className="text-xs font-mono bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full">
            {total} Team Members
          </span>
        </div>

        {total === 0 ? (
          <p className="text-sm text-slate-400 py-6 text-center">No team onboarding data available.</p>
        ) : (
          <div className="space-y-3">
            {/* Visual stacked progress bar */}
            <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex">
              {statusConfigs.map((cfg) => {
                const pct = total > 0 ? (cfg.count / total) * 100 : 0;
                if (pct === 0) return null;
                return (
                  <div
                    key={cfg.key}
                    style={{ width: `${pct}%` }}
                    className={`${cfg.color} h-full transition-all duration-300`}
                    title={`${cfg.label}: ${cfg.count} (${Math.round(pct)}%)`}
                  />
                );
              })}
            </div>

            {/* Status Breakdown Grid */}
            <div className="grid grid-cols-1 gap-2 pt-2">
              {statusConfigs.map((cfg) => {
                const Icon = cfg.icon;
                const pct = total > 0 ? Math.round((cfg.count / total) * 100) : 0;
                return (
                  <div
                    key={cfg.key}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-950/40 border border-slate-800/60"
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className={`p-1.5 rounded-md ${cfg.bgColor}`}>
                        <Icon className={`h-4 w-4 ${cfg.textColor}`} />
                      </div>
                      <span className="text-xs font-medium text-slate-300">{cfg.label}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-200">{cfg.count}</span>
                      <span className="text-xs text-slate-400 font-mono">({pct}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
