'use client';

import React from 'react';
import { JobRoleResponseSchema, MatrixRequirementResponseSchema } from '@/lib/services/rrm';
import { Briefcase, Building2 } from 'lucide-react';

interface Pipeline1RoleSelectorProps {
  roles: JobRoleResponseSchema[];
  selectedRole: JobRoleResponseSchema | null;
  onSelectRole: (role: JobRoleResponseSchema) => void;
  requirements: MatrixRequirementResponseSchema[];
  loading: boolean;
}

export function Pipeline1RoleSelector({
  roles,
  selectedRole,
  onSelectRole,
  requirements,
  loading,
}: Pipeline1RoleSelectorProps) {
  if (loading) {
    return (
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm mb-6 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/4 mb-4"></div>
        <div className="h-10 bg-slate-800/60 rounded"></div>
      </div>
    );
  }

  const mandatoryCount = requirements.filter((r) => r.is_mandatory).length;
  const mustKnowCount = requirements.filter((r) => r.requirement_type === 'must_know').length;

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-indigo-600" />
            Select Target Job Role
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Choose an organizational job role to load its ground-truth RRM requirement context
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Role Select Dropdown */}
        <div className="lg:col-span-1 space-y-3">
          <label className="block text-xs font-semibold text-slate-300">
            Target Job Role <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <select
              value={selectedRole?.role_code || ''}
              onChange={(e) => {
                const found = roles.find((r) => r.role_code === e.target.value);
                if (found) onSelectRole(found);
              }}
              className="w-full py-2.5 px-3 text-sm border border-slate-800 rounded-lg bg-slate-900 font-semibold text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="" disabled>
                -- Select a Job Role --
              </option>
              {roles.map((r) => (
                <option key={r.role_id} value={r.role_code}>
                  {r.role_code} - {r.title} ({r.department})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Role Summary Card */}
        {selectedRole ? (
          <div className="lg:col-span-2 p-4 rounded-xl border border-indigo-200 bg-indigo-50/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded bg-indigo-100 text-indigo-900 border border-indigo-200">
                  {selectedRole.role_code}
                </span>
                <h3 className="font-bold text-slate-100 text-base">{selectedRole.title}</h3>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-emerald-100 text-emerald-800">
                Ground Truth Verified
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1 font-semibold text-slate-200">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                Department: {selectedRole.department}
              </span>
              <span>•</span>
              <span className="capitalize font-medium text-slate-300">
                Level: {selectedRole.required_experience_level}
              </span>
            </div>

            {selectedRole.description && (
              <p className="text-xs text-slate-400 border-t border-indigo-100/80 pt-2">
                {selectedRole.description}
              </p>
            )}

            {/* Quick RRM Context Metrics */}
            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-indigo-100">
              <div className="p-2 rounded bg-slate-900 border border-indigo-100">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Total RRM Reqs</div>
                <div className="text-sm font-bold text-slate-100 mt-0.5">{requirements.length}</div>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-indigo-100">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Mandatory</div>
                <div className="text-sm font-bold text-amber-700 mt-0.5">{mandatoryCount}</div>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-indigo-100">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Must-Know</div>
                <div className="text-sm font-bold text-indigo-700 mt-0.5">{mustKnowCount}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 p-6 rounded-xl border border-dashed border-slate-800 text-center text-slate-400 text-xs">
            Select a job role from the dropdown menu to inspect its ground-truth RRM requirements.
          </div>
        )}
      </div>
    </div>
  );
}
