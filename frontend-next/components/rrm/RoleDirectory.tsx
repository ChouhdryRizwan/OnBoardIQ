'use client';

import React from 'react';
import { JobRoleResponseSchema } from '@/lib/services/rrm';
import { Briefcase, Building2, CheckCircle2, Eye, Edit, Trash2 } from 'lucide-react';

interface RoleDirectoryProps {
  roles: JobRoleResponseSchema[];
  loading: boolean;
  onSelectRole: (role: JobRoleResponseSchema) => void;
  onEditRole: (role: JobRoleResponseSchema) => void;
  onDeleteRole: (roleCode: string) => void;
}

export function RoleDirectory({
  roles,
  loading,
  onSelectRole,
  onEditRole,
  onDeleteRole,
}: RoleDirectoryProps) {
  if (loading) {
    return (
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm mb-6 animate-pulse">
        <div className="h-6 bg-slate-800 rounded w-1/4 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="h-28 bg-slate-800/60 rounded-lg"></div>
          <div className="h-28 bg-slate-800/60 rounded-lg"></div>
          <div className="h-28 bg-slate-800/60 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (roles.length === 0) {
    return (
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-8 text-center shadow-sm mb-6">
        <Briefcase className="w-10 h-10 text-slate-400 mx-auto mb-2" />
        <h3 className="text-base font-bold text-slate-100 mb-1">No Configured Job Roles</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          No job roles have been configured in the matrix yet. Click &quot;New Job Role&quot; above to create one.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm mb-6">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-indigo-400" />
            Configured Job Roles Directory ({roles.length})
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Organizational job roles with ground-truth matrix mappings
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map((r) => (
          <div
            key={r.role_id}
            className="p-4 rounded-xl border border-slate-800 bg-slate-950/50 hover:bg-slate-950 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-800/60">
                  {r.role_code}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  Active
                </span>
              </div>

              <h3 className="font-bold text-slate-100 text-base mb-1 line-clamp-1">{r.title}</h3>

              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mb-3">
                <span className="flex items-center gap-1 font-medium text-slate-300">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  {r.department}
                </span>
                <span>•</span>
                <span className="capitalize bg-slate-800 px-1.5 py-0.5 rounded text-[11px] font-semibold text-slate-300 border border-slate-700/50">
                  {r.required_experience_level}
                </span>
              </div>

              {r.description && (
                <p className="text-xs text-slate-400 line-clamp-2 mb-4">{r.description}</p>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                onClick={() => onSelectRole(r)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-300 bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-800/60 rounded-lg transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                View Requirements
              </button>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => onEditRole(r)}
                  className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-colors"
                  title="Edit Role"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDeleteRole(r.role_code)}
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/60 rounded-lg transition-colors"
                  title="Deactivate Role"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
