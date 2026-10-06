'use client';

import React, { useState } from 'react';
import { Search, Filter, BookOpen, AlertTriangle, CheckCircle, RefreshCw, ChevronRight } from 'lucide-react';
import { EmployeeProgressReportItem } from '../../../lib/services/managerDashboard';

interface TeamTrainingTableProps {
  items: EmployeeProgressReportItem[];
  loading: boolean;
  error?: string;
  onFilterChange?: (filters: { search?: string; department?: string; status?: string; roleCode?: string }) => void;
  onRefresh?: () => void;
}

export const TeamTrainingTable: React.FC<TeamTrainingTableProps> = ({
  items,
  loading,
  error,
  onFilterChange,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedRole, setSelectedRole] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    if (onFilterChange) {
      onFilterChange({ search: val, department: selectedDept, status: selectedStatus, roleCode: selectedRole });
    }
  };

  const handleDeptChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedDept(val);
    if (onFilterChange) {
      onFilterChange({ search: searchTerm, department: val, status: selectedStatus, roleCode: selectedRole });
    }
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedStatus(val);
    if (onFilterChange) {
      onFilterChange({ search: searchTerm, department: selectedDept, status: val, roleCode: selectedRole });
    }
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedRole(val);
    if (onFilterChange) {
      onFilterChange({ search: searchTerm, department: selectedDept, status: selectedStatus, roleCode: val });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center space-x-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs px-2.5 py-0.5 rounded-full font-medium">
            <CheckCircle className="h-3 w-3 mr-1" /> Completed
          </span>
        );
      case 'on_track':
        return (
          <span className="inline-flex items-center bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs px-2.5 py-0.5 rounded-full font-medium">
            On Track
          </span>
        );
      case 'requires_attention':
        return (
          <span className="inline-flex items-center bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs px-2.5 py-0.5 rounded-full font-medium">
            <AlertTriangle className="h-3 w-3 mr-1" /> Attention Req.
          </span>
        );
      case 'behind_schedule':
        return (
          <span className="inline-flex items-center bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs px-2.5 py-0.5 rounded-full font-medium">
            Behind Schedule
          </span>
        );
      case 'assessment_required':
        return (
          <span className="inline-flex items-center bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs px-2.5 py-0.5 rounded-full font-medium">
            Assessment Pending
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center bg-slate-800 text-slate-400 text-xs px-2.5 py-0.5 rounded-full font-medium capitalize">
            {status.replace(/_/g, ' ')}
          </span>
        );
    }
  };

  const departments = Array.from(new Set(items.map((i) => i.department).filter(Boolean)));
  const roles = Array.from(new Set(items.map((i) => i.role_title || i.role_code).filter(Boolean)));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      {/* Header & Controls */}
      <div className="p-5 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-slate-100 flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-indigo-400" />
            <span>Team Training & Onboarding Status</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time tracking of team member training completion, assessment scores, and module milestones.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search bar */}
          <div className="relative">
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search team member..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-indigo-500 w-44 md:w-52"
            />
          </div>

          {/* Dept filter */}
          {departments.length > 0 && (
            <div className="relative">
              <Filter className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={selectedDept}
                onChange={handleDeptChange}
                className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:border-indigo-500"
              >
                <option value="">All Depts</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Role filter */}
          {roles.length > 0 && (
            <select
              value={selectedRole}
              onChange={handleRoleChange}
              className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Roles</option>
              {roles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          )}

          {/* Status filter */}
          <select
            value={selectedStatus}
            onChange={handleStatusChange}
            className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="on_track">On Track</option>
            <option value="completed">Completed</option>
            <option value="assessment_required">Assessment Pending</option>
            <option value="requires_attention">Requires Attention</option>
            <option value="behind_schedule">Behind Schedule</option>
          </select>

          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-amber-950/20 border-b border-amber-800/30 p-3 text-xs text-amber-300">
          Warning: Could not fetch team training data: {error}
        </div>
      )}

      {/* Table content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <th className="py-3 px-4">Employee</th>
              <th className="py-3 px-4">Role & Dept</th>
              <th className="py-3 px-4">Plan Version</th>
              <th className="py-3 px-4">Overall Progress</th>
              <th className="py-3 px-4">Modules Done</th>
              <th className="py-3 px-4">Avg Assessment</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50 text-slate-300">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="py-3.5 px-4"><div className="h-4 bg-slate-800 rounded w-28"></div></td>
                  <td className="py-3.5 px-4"><div className="h-4 bg-slate-800 rounded w-24"></div></td>
                  <td className="py-3.5 px-4"><div className="h-4 bg-slate-800 rounded w-12"></div></td>
                  <td className="py-3.5 px-4"><div className="h-4 bg-slate-800 rounded w-32"></div></td>
                  <td className="py-3.5 px-4"><div className="h-4 bg-slate-800 rounded w-16"></div></td>
                  <td className="py-3.5 px-4"><div className="h-4 bg-slate-800 rounded w-12"></div></td>
                  <td className="py-3.5 px-4"><div className="h-4 bg-slate-800 rounded w-20"></div></td>
                  <td className="py-3.5 px-4"><div className="h-4 bg-slate-800 rounded w-8 ml-auto"></div></td>
                </tr>
              ))
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400">
                  No team members match the specified filters.
                </td>
              </tr>
            ) : (
              items.map((emp) => {
                const progressPct = Math.round(emp.overall_progress_percentage || 0);
                return (
                  <tr key={emp.employee_id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-slate-100">
                      <div>{emp.employee_name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{emp.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-200">{emp.role_title || emp.role_code}</div>
                      <div className="text-[11px] text-slate-400">{emp.department || 'General'}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">
                      {emp.plan_version ? `v${emp.plan_version}` : 'v1.0'}
                    </td>
                    <td className="py-3.5 px-4 min-w-[140px]">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              progressPct === 100
                                ? 'bg-emerald-500'
                                : progressPct >= 50
                                ? 'bg-indigo-500'
                                : 'bg-amber-500'
                            }`}
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs text-slate-300 w-8">{progressPct}%</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      {emp.completed_modules} / {emp.total_modules}
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      {emp.assessment_score_avg !== undefined && emp.assessment_score_avg !== null
                        ? `${Math.round(emp.assessment_score_avg)}%`
                        : 'N/A'}
                    </td>
                    <td className="py-3.5 px-4">{getStatusBadge(emp.current_status)}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => alert(`Viewing details for team member ${emp.employee_name}`)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-indigo-400 transition-colors inline-flex items-center"
                        title="View Details"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
