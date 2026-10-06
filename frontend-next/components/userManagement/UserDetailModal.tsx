'use client';

import React from 'react';
import { UserManagementItem } from '@/lib/services/userManagement';
import { X, Shield, Briefcase, Scale, User, CheckCircle2, XCircle, MapPin, Building, Calendar, Hash } from 'lucide-react';

interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserManagementItem | null;
}

export function UserDetailModal({ isOpen, onClose, user }: UserDetailModalProps) {
  if (!isOpen || !user) return null;

  const getRoleBadge = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return { icon: Shield, label: 'Administrator', style: 'bg-purple-950/70 text-purple-300 border-purple-800/60' };
      case 'training_manager':
        return { icon: Briefcase, label: 'Training Manager', style: 'bg-teal-950/70 text-teal-300 border-teal-800/60' };
      case 'reviewer':
        return { icon: Scale, label: 'Governance Reviewer', style: 'bg-amber-950/70 text-amber-300 border-amber-800/60' };
      case 'manager':
        return { icon: User, label: 'Department Manager', style: 'bg-indigo-950/70 text-indigo-300 border-indigo-800/60' };
      case 'employee':
      default:
        return { icon: User, label: 'Employee / Learner', style: 'bg-blue-950/70 text-blue-300 border-blue-800/60' };
    }
  };

  const badge = getRoleBadge(user.role);
  const BadgeIcon = badge.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-white font-bold text-base">
              {user.full_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-white">{user.full_name}</h2>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${badge.style}`}>
                  <BadgeIcon className="w-3 h-3" />
                  {badge.label}
                </span>
              </div>
              <p className="text-xs text-slate-400">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto text-xs">
          {/* Status & Core System Account */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-3">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">System Account</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-500 block text-[10px]">User ID</span>
                <span className="text-slate-300 font-mono text-[11px] break-all">{user.user_id}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Status</span>
                <span className="inline-flex items-center gap-1.5 mt-0.5">
                  {user.is_active ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-300 font-medium">Active</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-slate-400 font-medium">Suspended</span>
                    </>
                  )}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Created Date</span>
                <span className="text-slate-300">
                  {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Last Updated</span>
                <span className="text-slate-300">
                  {user.updated_at ? new Date(user.updated_at).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Linked Employee Profile */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Employee Profile</h3>
              {user.employee_id ? (
                <span className="text-[10px] px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/30">
                  Linked Profile
                </span>
              ) : (
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                  Staff / Non-Learner Account
                </span>
              )}
            </div>

            {user.employee_id ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-500 block text-[10px] flex items-center gap-1">
                    <Hash className="w-3 h-3" /> Employee Code
                  </span>
                  <span className="text-teal-300 font-mono font-medium">{user.employee_code || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] flex items-center gap-1">
                    <Building className="w-3 h-3" /> Department
                  </span>
                  <span className="text-slate-200">{user.department || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] flex items-center gap-1">
                    <Briefcase className="w-3 h-3" /> Job Role
                  </span>
                  <span className="text-slate-200">{user.role_title || user.role_code || 'N/A'}</span>
                  {user.role_code && user.role_title && (
                    <span className="text-slate-400 block text-[10px] font-mono">{user.role_code}</span>
                  )}
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Location
                  </span>
                  <span className="text-slate-200">{user.location || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Experience Level</span>
                  <span className="text-slate-300 capitalize">{user.experience_level || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Joining Date
                  </span>
                  <span className="text-slate-300">
                    {user.joining_date ? new Date(user.joining_date).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-slate-400 text-[11px] italic">
                This account operates as a system administrator or administrative role without an individual learner roadmap.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
