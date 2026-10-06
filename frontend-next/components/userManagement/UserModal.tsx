'use client';

import React, { useState } from 'react';
import { UserManagementItem, CreateUserPayload, UpdateUserPayload } from '@/lib/services/userManagement';
import { X, UserPlus, Save, AlertCircle } from 'lucide-react';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUserPayload | UpdateUserPayload) => Promise<void>;
  userToEdit?: UserManagementItem | null;
  mode: 'create' | 'edit';
}

const ROLES = [
  { value: 'admin', label: 'Admin (System Administrator)' },
  { value: 'training_manager', label: 'Training Manager' },
  { value: 'reviewer', label: 'Reviewer (Governance & Compliance)' },
  { value: 'manager', label: 'Manager (Department Lead)' },
  { value: 'employee', label: 'Employee (Learner)' },
];

function UserModalContent({
  onClose,
  onSubmit,
  userToEdit,
  mode,
}: Omit<UserModalProps, 'isOpen'>) {
  const [fullName, setFullName] = useState(mode === 'edit' && userToEdit ? userToEdit.full_name || '' : '');
  const [email, setEmail] = useState(mode === 'edit' && userToEdit ? userToEdit.email || '' : '');
  const [role, setRole] = useState(mode === 'edit' && userToEdit ? userToEdit.role || 'employee' : 'employee');
  const [department, setDepartment] = useState(mode === 'edit' && userToEdit ? userToEdit.department || '' : '');
  const [roleIdentifier, setRoleIdentifier] = useState(
    mode === 'edit' && userToEdit ? userToEdit.role_code || userToEdit.role_title || '' : ''
  );
  const [location, setLocation] = useState(mode === 'edit' && userToEdit ? userToEdit.location || '' : '');
  const [isActive, setIsActive] = useState(mode === 'edit' && userToEdit ? userToEdit.is_active : true);
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError('Full Name is required.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('A valid email address is required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (mode === 'create') {
        const payload: CreateUserPayload = {
          full_name: fullName.trim(),
          email: email.trim(),
          role,
          is_active: isActive,
          department: department.trim() || undefined,
          role_identifier: roleIdentifier.trim() || undefined,
          location: location.trim() || undefined,
          password: password.trim() || undefined,
        };
        await onSubmit(payload);
      } else {
        const payload: UpdateUserPayload = {
          full_name: fullName.trim(),
          email: email.trim(),
          role,
          is_active: isActive,
          department: department.trim() || undefined,
          role_identifier: roleIdentifier.trim() || undefined,
          location: location.trim() || undefined,
        };
        await onSubmit(payload);
      }
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save user.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
              {mode === 'create' ? <UserPlus className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">
                {mode === 'create' ? 'Create New User' : 'Edit User Profile'}
              </h2>
              <p className="text-xs text-slate-400">
                {mode === 'create'
                  ? 'Add a new system identity or link to an employee profile'
                  : `Editing ${userToEdit?.email}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-950/50 border border-red-800/80 rounded-lg text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-slate-300 font-medium">Full Name *</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Alex Taylor"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-medium">Email Address *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. alex.taylor@company.com"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-medium">System Role *</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500 transition-colors text-xs"
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Department</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Engineering, Sales"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Role Code / Title</label>
              <input
                type="text"
                value={roleIdentifier}
                onChange={(e) => setRoleIdentifier(e.target.value)}
                placeholder="e.g. ROLE-DEVOPS"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Remote, Austin HQ"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors text-xs"
              />
            </div>
            {mode === 'create' && (
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Password (optional)</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Defaults to demo password"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors text-xs"
                />
              </div>
            )}
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-slate-800">
            <label className="text-slate-300 font-medium cursor-pointer flex items-center gap-2">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded border-slate-700 bg-slate-950 text-teal-500 focus:ring-teal-500/40 w-4 h-4 cursor-pointer"
              />
              <span>Account Active</span>
            </label>
            <span className="text-[11px] text-slate-500">
              {isActive ? 'User can log in to the system' : 'User access is suspended'}
            </span>
          </div>

          {/* Action buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-600 text-slate-950 font-semibold transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Saving...</span>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>{mode === 'create' ? 'Create User' : 'Save Changes'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function UserModal(props: UserModalProps) {
  if (!props.isOpen) return null;
  return <UserModalContent key={props.userToEdit?.user_id || props.mode} {...props} />;
}
