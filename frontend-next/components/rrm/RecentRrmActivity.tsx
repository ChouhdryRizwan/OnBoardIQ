'use client';

import React from 'react';
import { MatrixRequirementResponseSchema, JobRoleResponseSchema } from '@/lib/services/rrm';
import { Activity, CheckCircle2, Briefcase } from 'lucide-react';

interface RecentRrmActivityProps {
  requirements: MatrixRequirementResponseSchema[];
  roles: JobRoleResponseSchema[];
  loading: boolean;
}

interface RrmLogItem {
  id: string;
  type: 'role' | 'requirement';
  title: string;
  subtitle: string;
  timestamp: string;
}

export function RecentRrmActivity({ requirements, roles, loading }: RecentRrmActivityProps) {
  if (loading) {
    return (
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm animate-pulse mb-6">
        <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-10 bg-slate-800/60 rounded"></div>
          <div className="h-10 bg-slate-800/60 rounded"></div>
        </div>
      </div>
    );
  }

  const logs: RrmLogItem[] = [];

  // Job Role activities
  roles.forEach((r) => {
    logs.push({
      id: `role-${r.role_id}`,
      type: 'role',
      title: `Job Role Configured: ${r.title} (${r.role_code})`,
      subtitle: `Department: ${r.department} • Level: ${r.required_experience_level}`,
      timestamp: r.created_at ? new Date(r.created_at).toLocaleDateString() : 'Recent',
    });
  });

  // Requirement activities
  requirements.forEach((req) => {
    logs.push({
      id: `req-${req.requirement_id}`,
      type: 'requirement',
      title: `Matrix Requirement Added: ${req.requirement_id}`,
      subtitle: `${req.role_code} • Competency: ${req.required_competency} • Source: ${req.source_document_id}`,
      timestamp: req.created_at ? new Date(req.created_at).toLocaleDateString() : 'Recent',
    });
  });

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm mb-6">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-600" />
            Ground Truth Activity Log
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Audit trail of recently configured roles and ground-truth requirement mappings
          </p>
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-6 border border-dashed border-slate-800 rounded-lg text-slate-400 text-sm">
          No RRM activity logged yet.
        </div>
      ) : (
        <div className="relative pl-6 border-l-2 border-slate-800 space-y-5">
          {logs.slice(0, 6).map((log) => (
            <div key={log.id} className="relative">
              <div className="absolute -left-[31px] top-0.5 p-1 rounded-full bg-slate-900 border-2 border-indigo-600">
                {log.type === 'role' ? (
                  <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                )}
              </div>

              <div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-slate-100">{log.title}</span>
                  <span className="text-xs text-slate-400 font-medium">{log.timestamp}</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{log.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
