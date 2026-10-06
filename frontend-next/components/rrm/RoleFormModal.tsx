'use client';

import React, { useState } from 'react';
import {
  createRole,
  updateRole,
  JobRoleResponseSchema,
  JobRoleCreateSchema,
} from '@/lib/services/rrm';
import { Briefcase, X, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

interface RoleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editRole?: JobRoleResponseSchema | null;
}

export function RoleFormModal({ isOpen, onClose, onSuccess, editRole }: RoleFormModalProps) {
  const [roleCode, setRoleCode] = useState(editRole?.role_code || '');
  const [title, setTitle] = useState(editRole?.title || '');
  const [department, setDepartment] = useState(editRole?.department || '');
  const [experienceLevel, setExperienceLevel] = useState(editRole?.required_experience_level || 'beginner');
  const [description, setDescription] = useState(editRole?.description || '');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !department.trim()) {
      setErrorMsg('Role title and department are required fields.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (editRole) {
        await updateRole(editRole.role_code, {
          title: title.trim(),
          department: department.trim(),
          description: description.trim(),
          required_experience_level: experienceLevel,
        });
        setSuccessMsg('Job role updated successfully!');
      } else {
        if (!roleCode.trim()) {
          setErrorMsg('Role code is required for new roles.');
          setSubmitting(false);
          return;
        }
        const payload: JobRoleCreateSchema = {
          role_code: roleCode.trim().toUpperCase(),
          title: title.trim(),
          department: department.trim(),
          description: description.trim(),
          required_experience_level: experienceLevel,
        };
        await createRole(payload);
        setSuccessMsg('Job role created successfully!');
      }

      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1200);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Operation failed. Check role code uniqueness.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/50 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-slate-100">
              {editRole ? `Edit Job Role (${editRole.role_code})` : 'Create New Job Role'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {errorMsg && (
            <div className="p-3 bg-rose-950/80 border border-rose-800 text-rose-300 rounded-lg text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-300 rounded-lg text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Role Code <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. R011 or DEV-01"
              value={roleCode}
              onChange={(e) => setRoleCode(e.target.value)}
              disabled={!!editRole}
              required
              className="w-full py-2 px-3 text-sm border border-slate-800 rounded-lg bg-slate-950 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase font-mono disabled:bg-slate-800/60"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Role Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Senior Security Operations Analyst"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full py-2 px-3 text-sm border border-slate-800 rounded-lg bg-slate-950 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Department <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Information Security or Legal & Compliance"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              required
              className="w-full py-2 px-3 text-sm border border-slate-800 rounded-lg bg-slate-950 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Experience Level</label>
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              className="w-full py-2 px-3 text-sm border border-slate-800 rounded-lg bg-slate-950 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 capitalize"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
            <textarea
              placeholder="Brief summary of core job responsibilities and onboarding scope..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full py-2 px-3 text-sm border border-slate-800 rounded-lg bg-slate-950 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800/60 rounded-lg transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors disabled:opacity-50"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {editRole ? 'Save Role Changes' : 'Create Job Role'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
