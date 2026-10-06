'use client';

import React from 'react';
import { Layers, Briefcase, FileCheck } from 'lucide-react';
import { JobRole } from '../../../types';

interface TrainingPlanOverviewProps {
  jobRoles: JobRole[];
  loading: boolean;
  error?: string;
}

export const TrainingPlanOverview: React.FC<TrainingPlanOverviewProps> = ({ jobRoles, loading, error }) => {
  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 animate-pulse">
        <div className="h-6 bg-slate-800 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-slate-800/50 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error && jobRoles.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center space-x-2 text-slate-300 font-semibold mb-3">
          <Layers className="h-5 w-5 text-indigo-400" />
          <h3>Role Training Matrix Overview</h3>
        </div>
        <p className="text-sm text-slate-400">Data unavailable: {error}</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Layers className="h-5 w-5 text-indigo-400" />
            <h3 className="font-semibold text-slate-100">Configured Role Plans (RRM)</h3>
          </div>
          <span className="text-xs font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-1 rounded-full">
            {jobRoles.length} Defined Roles
          </span>
        </div>

        {jobRoles.length === 0 ? (
          <p className="text-sm text-slate-400 py-6 text-center">No role requirement matrices available.</p>
        ) : (
          <div className="space-y-3">
            {jobRoles.slice(0, 5).map((role) => {
              return (
                <div
                  key={role.role_id || role.role_code}
                  className="p-3 rounded-lg bg-slate-950/40 border border-slate-800/80 flex items-center justify-between hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                      <Briefcase className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-200">{role.title}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {role.role_code} • {role.department || 'General'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 text-right">
                    <div>
                      <div className="text-xs font-mono font-medium text-slate-300">
                        {role.required_experience_level || 'Standard'} Level
                      </div>
                      <div className="text-[10px] text-emerald-400 flex items-center justify-end">
                        <FileCheck className="h-3 w-3 mr-0.5" /> RRM Validated
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
