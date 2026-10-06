'use client';

import React, { useState } from 'react';
import { JobRoleResponseSchema, MatrixRequirementResponseSchema } from '@/lib/services/rrm';
import { EmployeeItem } from '@/lib/services/pipeline1';
import { Sparkles, Loader2, ArrowRight, ShieldCheck, User } from 'lucide-react';

interface Pipeline1GenerationFormProps {
  selectedRole: JobRoleResponseSchema | null;
  requirements: MatrixRequirementResponseSchema[];
  referencedDocIds: string[];
  employees?: EmployeeItem[];
  onGenerate: (employeeId: string, modelName: string, promptVersion: string) => void;
  isGenerating: boolean;
}

export function Pipeline1GenerationForm({
  selectedRole,
  requirements,
  referencedDocIds,
  employees = [],
  onGenerate,
  isGenerating,
}: Pipeline1GenerationFormProps) {
  const [userSelectedEmployeeId, setUserSelectedEmployeeId] = useState<string | null>(null);
  const [isManualInput, setIsManualInput] = useState(false);
  const [modelName, setModelName] = useState('gemini-2.5-flash');
  const [promptVersion, setPromptVersion] = useState('v1.0.0');

  // Derive target employee ID based on selectedRole or user selection
  const matchingEmp = selectedRole
    ? employees.find(
        (e) =>
          e.job_role_id === selectedRole.role_id ||
          e.role_code === selectedRole.role_code
      )
    : undefined;

  const defaultEmployeeId = matchingEmp
    ? matchingEmp.employee_code || matchingEmp.employee_id
    : employees.length > 0
    ? employees[0].employee_code || employees[0].employee_id
    : '';

  const employeeId = userSelectedEmployeeId !== null ? userSelectedEmployeeId : defaultEmployeeId;

  const mandatoryCount = requirements.filter((r) => r.is_mandatory).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;
    if (!employeeId.trim()) return;

    onGenerate(employeeId.trim(), modelName, promptVersion);
  };

  const selectedEmpDetails = employees.find(
    (e) => e.employee_code === employeeId || e.employee_id === employeeId
  );

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm mb-6">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            Generation Parameters & Execution
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure target employee context and model prompt parameters for Pipeline 1
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-300">
                Target Employee <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setIsManualInput(!isManualInput)}
                className="text-[10px] text-indigo-400 hover:underline"
              >
                {isManualInput ? 'Choose from list' : 'Enter custom ID'}
              </button>
            </div>

            {isManualInput ? (
              <input
                type="text"
                placeholder="e.g. EMP-EVAL-008"
                value={employeeId}
                onChange={(e) => setUserSelectedEmployeeId(e.target.value)}
                required
                className="w-full py-2 px-3 text-sm border border-slate-800 rounded-lg bg-slate-950 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono uppercase"
              />
            ) : (
              <select
                value={employeeId}
                onChange={(e) => setUserSelectedEmployeeId(e.target.value)}
                required
                className="w-full py-2 px-3 text-sm border border-slate-800 rounded-lg bg-slate-950 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              >
                {employees.length > 0 ? (
                  employees.map((emp) => (
                    <option key={emp.employee_id} value={emp.employee_code || emp.employee_id}>
                      {emp.name} ({emp.employee_code}) — {emp.role_title}
                    </option>
                  ))
                ) : (
                  <option value="">No employees available</option>
                )}
              </select>
            )}

            {selectedEmpDetails && !isManualInput && (
              <div className="text-[11px] text-indigo-300 mt-1 flex items-center gap-1 font-medium">
                <User className="w-3.5 h-3.5 text-indigo-400" />
                Target: {selectedEmpDetails.name} ({selectedEmpDetails.department})
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">GenAI Model Provider</label>
            <select
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              className="w-full py-2 px-3 text-sm border border-slate-800 rounded-lg bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="gemini-2.5-flash">Gemini 2.5 Flash (Production Default)</option>
              <option value="gemini-2.5-pro">Gemini 2.5 Pro (Deep Reasoning)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">System Prompt Version</label>
            <input
              type="text"
              value={promptVersion}
              onChange={(e) => setPromptVersion(e.target.value)}
              className="w-full py-2 px-3 text-sm border border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
            />
          </div>
        </div>

        {/* Pre-Generation Confirmation Box */}
        {selectedRole && (
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-600" /> Pre-Generation Context Confirmation
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                <div className="text-slate-400">Job Role</div>
                <div className="font-bold text-slate-100 mt-0.5">{selectedRole.title} ({selectedRole.role_code})</div>
              </div>

              <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                <div className="text-slate-400">Ground Truth Reqs</div>
                <div className="font-bold text-indigo-600 mt-0.5">{requirements.length} Requirements</div>
              </div>

              <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                <div className="text-slate-400">Mandatory Ground Truth</div>
                <div className="font-bold text-amber-700 mt-0.5">{mandatoryCount} Mandatory</div>
              </div>

              <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                <div className="text-slate-400">Source Policy Citations</div>
                <div className="font-bold text-slate-100 mt-0.5">{referencedDocIds.length} Documents</div>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={isGenerating || !selectedRole || !employeeId.trim()}
            className="flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-colors disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating Plan with Gemini AI...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-amber-400" />
                Generate Onboarding Plan
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
