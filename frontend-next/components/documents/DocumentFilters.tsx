'use client';

import React from 'react';
import { Search, Filter } from 'lucide-react';

interface DocumentFiltersProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  categoryFilter: string;
  onCategoryChange: (c: string) => void;
  statusFilter: string;
  onStatusChange: (s: string) => void;
  securityFilter: string;
  onSecurityChange: (sec: string) => void;
  onReset: () => void;
}

export function DocumentFilters({
  searchQuery,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  statusFilter,
  onStatusChange,
  securityFilter,
  onSecurityChange,
  onReset,
}: DocumentFiltersProps) {
  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 shadow-sm mb-6 space-y-4">
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by document ID, title, or department..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Category Filter Dropdown */}
        <div className="w-full md:w-52">
          <select
            value={categoryFilter}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full py-2 px-3 text-sm border border-slate-800 rounded-lg bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Categories</option>
            <option value="hr_policy">HR Policy</option>
            <option value="information_security_policy">InfoSec Policy</option>
            <option value="department_sop">Department SOP</option>
            <option value="company_handbook">Company Handbook</option>
            <option value="leave_policy">Leave Policy</option>
            <option value="data_privacy_policy">Data Privacy</option>
            <option value="workplace_conduct_policy">Workplace Conduct</option>
            <option value="role_description">Role Description</option>
            <option value="process_document">Process Document</option>
            <option value="compliance_instruction">Compliance Instruction</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="w-full md:w-40">
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full py-2 px-3 text-sm border border-slate-800 rounded-lg bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 capitalize"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="obsolete">Obsolete Only</option>
            <option value="draft">Draft Only</option>
          </select>
        </div>

        {/* Security Filter */}
        <div className="w-full md:w-44">
          <select
            value={securityFilter}
            onChange={(e) => onSecurityChange(e.target.value)}
            className="w-full py-2 px-3 text-sm border border-slate-800 rounded-lg bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Security: All</option>
            <option value="flagged_only">⚠️ Flagged Only</option>
            <option value="clean_only">✓ Clean Only</option>
          </select>
        </div>

        {/* Reset Button */}
        {(searchQuery || categoryFilter !== 'all' || statusFilter !== 'all' || securityFilter !== 'all') && (
          <button
            onClick={onReset}
            className="px-3 py-2 text-xs font-semibold text-slate-400 hover:text-slate-100 border border-slate-800 rounded-lg hover:bg-slate-950 transition-colors flex items-center gap-1.5"
          >
            <Filter className="w-3.5 h-3.5" />
            Reset Filters
          </button>
        )}
      </div>
    </div>
  );
}
