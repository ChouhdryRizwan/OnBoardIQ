'use client';

import React from 'react';
import { Search, X } from 'lucide-react';
import { ReportFilterParams } from '@/lib/services/reports';

interface ReportsFilterBarProps {
  filters: ReportFilterParams;
  onFilterChange: (newFilters: ReportFilterParams) => void;
  onReset: () => void;
  showStatusFilter?: boolean;
  showDepartmentFilter?: boolean;
  showRoleFilter?: boolean;
  showFlagTypeFilter?: boolean;
  showSeverityFilter?: boolean;
}

export function ReportsFilterBar({
  filters,
  onFilterChange,
  onReset,
  showStatusFilter = true,
  showDepartmentFilter = true,
  showRoleFilter = true,
  showFlagTypeFilter = false,
  showSeverityFilter = false,
}: ReportsFilterBarProps) {
  const handleInputChange = (key: keyof ReportFilterParams, value: string) => {
    onFilterChange({
      ...filters,
      [key]: value === 'all' ? '' : value,
    });
  };

  const hasActiveFilters =
    Boolean(filters.search) ||
    Boolean(filters.department) ||
    Boolean(filters.role_code) ||
    Boolean(filters.status) ||
    Boolean(filters.flag_type) ||
    Boolean(filters.severity);

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-3 flex-1">
        {/* Search Input */}
        <div className="relative min-w-[200px] flex-1 max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search name, code, document..."
            value={filters.search || ''}
            onChange={(e) => handleInputChange('search', e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 border border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-950 text-slate-200 placeholder-slate-500 font-mono"
          />
        </div>

        {/* Department Filter */}
        {showDepartmentFilter && (
          <select
            value={filters.department || 'all'}
            onChange={(e) => handleInputChange('department', e.target.value)}
            className="text-xs px-3 py-2 border border-slate-800 rounded-lg bg-slate-950 text-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Product">Product</option>
            <option value="Security">Security</option>
            <option value="Compliance">Compliance</option>
            <option value="Human Resources">Human Resources</option>
          </select>
        )}

        {/* Role Code Filter */}
        {showRoleFilter && (
          <select
            value={filters.role_code || 'all'}
            onChange={(e) => handleInputChange('role_code', e.target.value)}
            className="text-xs px-3 py-2 border border-slate-800 rounded-lg bg-slate-950 text-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Roles</option>
            <option value="R_ENG_SR">Senior Software Engineer</option>
            <option value="R_ENG_FE">Frontend Developer</option>
            <option value="R_ENG_BE">Backend Developer</option>
            <option value="R_PM">Product Manager</option>
            <option value="R_SEC">Security Analyst</option>
          </select>
        )}

        {/* Training Status Filter */}
        {showStatusFilter && (
          <select
            value={filters.status || 'all'}
            onChange={(e) => handleInputChange('status', e.target.value)}
            className="text-xs px-3 py-2 border border-slate-800 rounded-lg bg-slate-950 text-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="on_track">On Track</option>
            <option value="requires_attention">Requires Attention</option>
            <option value="behind_schedule">Behind Schedule</option>
            <option value="completed">Completed</option>
          </select>
        )}

        {/* Flag Type Filter */}
        {showFlagTypeFilter && (
          <select
            value={filters.flag_type || 'all'}
            onChange={(e) => handleInputChange('flag_type', e.target.value)}
            className="text-xs px-3 py-2 border border-slate-800 rounded-lg bg-slate-950 text-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Flag Types</option>
            <option value="hallucination">Hallucination</option>
            <option value="contradiction">Contradiction</option>
            <option value="missing_traceability">Missing Traceability</option>
            <option value="unsupported">Unsupported Content</option>
          </select>
        )}

        {/* Severity Filter */}
        {showSeverityFilter && (
          <select
            value={filters.severity || 'all'}
            onChange={(e) => handleInputChange('severity', e.target.value)}
            className="text-xs px-3 py-2 border border-slate-800 rounded-lg bg-slate-950 text-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        )}
      </div>

      {hasActiveFilters && (
        <button
          onClick={onReset}
          className="text-xs font-semibold text-rose-300 hover:text-rose-200 bg-rose-500/10 hover:bg-rose-500/20 px-3 py-2 rounded-lg border border-rose-500/30 inline-flex items-center gap-1 transition-colors"
        >
          <X className="w-3.5 h-3.5" /> Clear Filters
        </button>
      )}
    </div>
  );
}
