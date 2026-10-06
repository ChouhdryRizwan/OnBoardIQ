'use client';

import React, { useEffect, useState } from 'react';
import {
  JobRoleResponseSchema,
  MatrixRequirementResponseSchema,
  MatrixValidationResponseSchema,
  fetchRoleRequirements,
  validateRoleMatrix,
} from '@/lib/services/rrm';
import {
  X,
  Briefcase,
  ShieldCheck,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Loader2,
} from 'lucide-react';

interface RoleDetailModalProps {
  role: JobRoleResponseSchema | null;
  isOpen: boolean;
  onClose: () => void;
  onEditRole: (role: JobRoleResponseSchema) => void;
}

export function RoleDetailModal({ role, isOpen, onClose, onEditRole }: RoleDetailModalProps) {
  const [requirements, setRequirements] = useState<MatrixRequirementResponseSchema[]>([]);
  const [validation, setValidation] = useState<MatrixValidationResponseSchema | null>(null);
  const [loadingReqs, setLoadingReqs] = useState(false);
  const [loadingValidation, setLoadingValidation] = useState(false);

  useEffect(() => {
    if (!role || !isOpen) return;

    const rCode = role.role_code || role.role_id;
    let isMounted = true;

    async function loadRoleData() {
      setLoadingReqs(true);
      setLoadingValidation(true);

      try {
        const [reqsRes, valRes] = await Promise.all([
          fetchRoleRequirements(rCode).catch(() => []),
          validateRoleMatrix(rCode).catch(() => null),
        ]);
        if (isMounted) {
          setRequirements(reqsRes);
          setValidation(valRes);
        }
      } finally {
        if (isMounted) {
          setLoadingReqs(false);
          setLoadingValidation(false);
        }
      }
    }

    loadRoleData();

    return () => {
      isMounted = false;
    };
  }, [role, isOpen]);

  if (!isOpen || !role) return null;

  const isValid = validation?.is_matrix_valid ?? false;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-2xl w-full max-w-4xl overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-100">{role.title}</h2>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 border border-indigo-200">
                  {role.role_code}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Department: {role.department} • Experience Level: {role.required_experience_level}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onEditRole(role)}
              className="px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
            >
              Edit Role
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-400 hover:bg-slate-800/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Python Matrix Validation Health Check Banner */}
          <div className="p-4 rounded-xl border bg-slate-950 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-600" /> Ground Truth Integrity Validation (Python Engine)
              </h3>

              {loadingValidation ? (
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" /> Validating...
                </span>
              ) : isValid ? (
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Matrix Valid
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Integrity Issues Found
                </span>
              )}
            </div>

            {validation && (
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-slate-400 font-medium">Total Requirements</div>
                  <div className="text-base font-bold text-slate-100 mt-0.5">{validation.total_requirements}</div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-slate-400 font-medium">Mandatory Reqs</div>
                  <div className="text-base font-bold text-slate-100 mt-0.5">{validation.mandatory_requirements}</div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-slate-400 font-medium">Verified Source References</div>
                  <div className="text-base font-bold text-indigo-600 mt-0.5">
                    {validation.valid_ground_truth_references} / {validation.total_requirements}
                  </div>
                </div>
              </div>
            )}

            {validation?.issues && validation.issues.length > 0 && (
              <div className="space-y-1.5 pt-2">
                <div className="text-xs font-bold text-amber-900">Validation Issues / Warnings:</div>
                {validation.issues.map((issue, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded bg-amber-100/60 text-amber-900 text-xs border border-amber-200 flex items-center gap-2"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    <span>{issue.detail || issue.message || JSON.stringify(issue)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Assigned Matrix Requirements List */}
          <div>
            <h3 className="text-sm font-bold text-slate-100 mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              Role Requirements ({requirements.length})
            </h3>

            {loadingReqs ? (
              <div className="py-8 text-center text-slate-400 flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-indigo-600" /> Loading role requirements...
              </div>
            ) : requirements.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-slate-800 rounded-lg text-slate-400 text-xs">
                No matrix requirements assigned to this role yet.
              </div>
            ) : (
              <div className="space-y-3">
                {requirements.map((req) => (
                  <div
                    key={req.requirement_id}
                    className="p-4 rounded-lg border border-slate-800 bg-slate-950/50 hover:bg-slate-950 transition-colors space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-slate-100">
                        <span className="font-mono text-indigo-700">{req.requirement_id}</span>
                        <span>•</span>
                        <span>{req.title || req.policy_requirement.slice(0, 50)}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {req.is_mandatory && (
                          <span className="px-2 py-0.5 text-[10px] uppercase font-bold bg-amber-100 text-amber-800 rounded">
                            Mandatory
                          </span>
                        )}
                        <span className="px-2 py-0.5 text-[10px] uppercase font-bold bg-purple-100 text-purple-800 rounded">
                          {req.requirement_type}
                        </span>
                      </div>
                    </div>

                    <p className="text-slate-400">{req.policy_requirement}</p>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                      <span className="font-semibold text-slate-300">Competency: {req.required_competency}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-mono text-slate-300">
                        <FileCode className="w-3 h-3 text-indigo-600" />
                        Source: {req.source_document_id} (Sec {req.source_section_id})
                      </span>
                      <span>•</span>
                      <span className="capitalize">Stage: {req.due_stage.replace(/_/g, ' ')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
