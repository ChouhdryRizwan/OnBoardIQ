'use client';

import React from 'react';
import { Search, Plus, Filter, RefreshCw } from 'lucide-react';

interface UserToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  selectedRole: string;
  onRoleChange: (role: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  onOpenCreateModal: () => void;
  onRefresh: () => void;
  loading: boolean;
}

export function UserToolbar({
  search,
  onSearchChange,
  selectedRole,
  onRoleChange,
  selectedStatus,
  onStatusChange,
  onOpenCreateModal,
  onRefresh,
  loading,
}: UserToolbarProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-sm">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search name, email, user ID, or employee code..."
          className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Role Filter */}
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedRole}
            onChange={(e) => onRoleChange(e.target.value)}
            className="py-1.5 px-2.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Roles</option>
            <option value="admin">Administrator</option>
            <option value="training_manager">Training Manager</option>
            <option value="reviewer">Reviewer</option>
            <option value="manager">Manager</option>
            <option value="employee">Employee</option>
          </select>
        </div>

        {/* Status Filter */}
        <select
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value)}
          className="py-1.5 px-2.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={loading}
          title="Refresh user list"
          className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>

        {/* Create User Button */}
        <button
          onClick={onOpenCreateModal}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" /> Add User
        </button>
      </div>
    </div>
  );
}
