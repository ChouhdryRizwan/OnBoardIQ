'use client';

import React from 'react';
import { UserManagementItem } from '@/lib/services/userManagement';
import { Edit2, Eye, Power, Shield, GraduationCap, Briefcase, Scale } from 'lucide-react';

interface UserTableProps {
  users: UserManagementItem[];
  loading: boolean;
  onViewDetails: (user: UserManagementItem) => void;
  onEditUser: (user: UserManagementItem) => void;
  onToggleStatus: (user: UserManagementItem) => void;
}

export function UserTable({
  users,
  loading,
  onViewDetails,
  onEditUser,
  onToggleStatus,
}: UserTableProps) {
  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center animate-pulse">
        <div className="h-6 bg-slate-800 rounded w-1/4 mx-auto mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 bg-slate-800/60 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-400 text-xs">
        No users found matching current filters.
      </div>
    );
  }

  const getRoleBadge = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return {
          icon: Shield,
          style: 'bg-purple-950/70 text-purple-300 border-purple-800/60',
          label: 'Admin',
        };
      case 'training_manager':
        return {
          icon: Briefcase,
          style: 'bg-teal-950/70 text-teal-300 border-teal-800/60',
          label: 'Training Mgr',
        };
      case 'reviewer':
        return {
          icon: Scale,
          style: 'bg-amber-950/70 text-amber-300 border-amber-800/60',
          label: 'Reviewer',
        };
      case 'manager':
        return {
          icon: Briefcase,
          style: 'bg-rose-950/70 text-rose-300 border-rose-800/60',
          label: 'Manager',
        };
      default:
        return {
          icon: GraduationCap,
          style: 'bg-emerald-950/70 text-emerald-300 border-emerald-800/60',
          label: 'Employee',
        };
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-sm overflow-hidden mb-6">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">User / Name</th>
              <th className="py-3 px-4">User ID</th>
              <th className="py-3 px-4">System Role</th>
              <th className="py-3 px-4">Employee Code / Job Role</th>
              <th className="py-3 px-4">Department</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Created Date</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {users.map((u) => {
              const roleInfo = getRoleBadge(u.role);
              const RoleIcon = roleInfo.icon;

              return (
                <tr key={u.user_id} className="hover:bg-slate-800/30 transition-colors">
                  {/* Name and Email */}
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-100">{u.full_name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                  </td>

                  {/* User ID */}
                  <td className="py-3 px-4">
                    <span
                      title={u.user_id}
                      className="font-mono text-[11px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800"
                    >
                      {u.user_id.length > 12 ? `${u.user_id.slice(0, 10)}...` : u.user_id}
                    </span>
                  </td>

                  {/* Role */}
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${roleInfo.style}`}
                    >
                      <RoleIcon className="w-3 h-3" />
                      {roleInfo.label}
                    </span>
                  </td>

                  {/* Employee Code / Job Role */}
                  <td className="py-3 px-4">
                    {u.employee_code ? (
                      <div>
                        <span className="font-mono text-[11px] font-bold text-purple-300 bg-purple-950/60 border border-purple-800/50 px-1.5 py-0.5 rounded">
                          {u.employee_code}
                        </span>
                        <div className="text-[11px] text-slate-300 mt-0.5 truncate max-w-[180px]">
                          {u.role_title || u.role_code || 'Assigned Role'}
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-500 italic">System Staff</span>
                    )}
                  </td>

                  {/* Department */}
                  <td className="py-3 px-4">
                    {u.department ? (
                      <span className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800 font-medium">
                        {u.department}
                      </span>
                    ) : (
                      <span className="text-slate-500">—</span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4">
                    {u.is_active ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/70 text-emerald-400 border border-emerald-800/60">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-950/70 text-rose-400 border border-rose-800/60">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                        Inactive
                      </span>
                    )}
                  </td>

                  {/* Created Date */}
                  <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                    {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onViewDetails(u)}
                        title="View user details"
                        className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onEditUser(u)}
                        title="Edit user"
                        className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-indigo-300 hover:text-indigo-200 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onToggleStatus(u)}
                        title={u.is_active ? 'Deactivate user' : 'Activate user'}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          u.is_active
                            ? 'bg-rose-950/40 border-rose-800/50 text-rose-400 hover:bg-rose-900/60'
                            : 'bg-emerald-950/40 border-emerald-800/50 text-emerald-400 hover:bg-emerald-900/60'
                        }`}
                      >
                        <Power className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
