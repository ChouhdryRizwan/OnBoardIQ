'use client';

import React from 'react';
import { Search, Filter } from 'lucide-react';
import { JobRoleResponseSchema } from '@/lib/services/rrm';

interface RequirementFiltersProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedRole: string;
  onRoleChange: (r: string) => void;
  rolesList: JobRoleResponseSchema[];
  mandatoryFilter: string;
  onMandatoryChange: (m: string) => void;
  classificationFilter: string;
  onClassificationChange: (c: string) => void;
  priorityFilter: string;
  onPriorityChange: (p: string) => void;
  onReset: () => void;
}

export function RequirementFilters({
  searchQuery,
  onSearchChange,
  selectedRole,
  onRoleChange,
  rolesList,
  mandatoryFilter,
  onMandatoryChange,
  classificationFilter,
  onClassificationChange,
  priorityFilter,
  onPriorityChange,
  onReset,
}: RequirementFiltersProps) {
  const isFiltered =
    !!searchQuery ||
    selectedRole !== 'all' ||
    mandatoryFilter !== 'all' ||
    classificationFilter !== 'all' ||
    priorityFilter !== 'all';

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 shadow-sm mb-6 space-y-4">
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by REQ ID, role, competency, text, or source document ID..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Role Filter */}
        <div className="w-full md:w-48">
          <select
            value={selectedRole}
            onChange={(e) => onRoleChange(e.target.value)}
            className="w-full py-2 px-3 text-sm border border-slate-800 rounded-lg bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-200"
          >
            <option value="all">All Job Roles</option>
            {rolesList.map((r) => (
              <option key={r.role_id} value={r.role_code}>
                {r.role_code} - {r.title}
              </option>
            ))}
          </select>
        </div>

        {/* Mandatory Filter */}
        <div className="w-full md:w-40">
          <select
            value={mandatoryFilter}
            onChange={(e) => onMandatoryChange(e.target.value)}
            className="w-full py-2 px-3 text-sm border border-slate-800 rounded-lg bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Mandatory: All</option>
            <option value="mandatory_only">Mandatory Only</option>
            <option value="optional_only">Optional Only</option>
          </select>
        </div>

        {/* Classification Filter */}
        <div className="w-full md:w-44">
          <select
            value={classificationFilter}
            onChange={(e) => onClassificationChange(e.target.value)}
            className="w-full py-2 px-3 text-sm border border-slate-800 rounded-lg bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 capitalize"
          >
            <option value="all">All Classifications</option>
            <option value="must_know">Must Know</option>
            <option value="must_complete">Must Complete</option>
            <option value="must_demonstrate">Must Demonstrate</option>
            <option value="must_acknowledge">Must Acknowledge</option>
            <option value="recommended">Recommended</option>
            <option value="optional">Optional</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div className="w-full md:w-36">
          <select
            value={priorityFilter}
            onChange={(e) => onPriorityChange(e.target.value)}
            className="w-full py-2 px-3 text-sm border border-slate-800 rounded-lg bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 capitalize"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>

        {/* Reset Button */}
        {isFiltered && (
          <button
            onClick={onReset}
            className="px-3 py-2 text-xs font-semibold text-slate-400 hover:text-slate-100 border border-slate-800 rounded-lg hover:bg-slate-950 transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <Filter className="w-3.5 h-3.5" />
            Reset Filters
          </button>
        )}
      </div>
    </div>
  );
}
