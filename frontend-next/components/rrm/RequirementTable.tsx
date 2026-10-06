'use client';

import React from 'react';
import { MatrixRequirementResponseSchema } from '@/lib/services/rrm';
import {
  FileText,
  ShieldCheck,
  Edit,
  Trash2,
  Clock,
  FileCode,
  Tag,
} from 'lucide-react';

interface RequirementTableProps {
  requirements: MatrixRequirementResponseSchema[];
  loading: boolean;
  onEditRequirement: (req: MatrixRequirementResponseSchema) => void;
  onDeleteRequirement: (reqId: string) => void;
}

export function RequirementTable({
  requirements,
  loading,
  onEditRequirement,
  onDeleteRequirement,
}: RequirementTableProps) {
  if (loading) {
    return (
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm animate-pulse mb-6">
        <div className="h-6 bg-slate-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          <div className="h-12 bg-slate-800/60 rounded"></div>
          <div className="h-12 bg-slate-800/60 rounded"></div>
          <div className="h-12 bg-slate-800/60 rounded"></div>
        </div>
      </div>
    );
  }

  if (requirements.length === 0) {
    return (
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-12 text-center shadow-sm mb-6">
        <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-100 mb-1">No Requirements Found</h3>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          No ground-truth matrix requirements match your active filter criteria. Try clearing filters or add a new requirement.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-sm overflow-hidden mb-6">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/50 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <th className="py-3.5 px-4">Requirement Details</th>
              <th className="py-3.5 px-4">Role & Dept</th>
              <th className="py-3.5 px-4">Classification</th>
              <th className="py-3.5 px-4">Priority & Stage</th>
              <th className="py-3.5 px-4">Source Traceability</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-sm">
            {requirements.map((req) => {
              const isMandatory = req.is_mandatory;
              const isHighPrio = req.priority.toLowerCase() === 'high' || req.priority.toLowerCase() === 'critical';

              return (
                <tr key={req.requirement_id} className="hover:bg-slate-950/80 transition-colors">
                  {/* Requirement ID & Title */}
                  <td className="py-3.5 px-4">
                    <div className="space-y-1 max-w-md">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-900 border border-indigo-200 shrink-0">
                          {req.requirement_id}
                        </span>
                        <span className="font-bold text-slate-100 text-sm line-clamp-1">
                          {req.title || req.policy_requirement.slice(0, 45)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-2">{req.policy_requirement}</p>
                      <div className="text-[11px] text-indigo-700 font-semibold flex items-center gap-1">
                        <Tag className="w-3 h-3" /> Competency: {req.required_competency}
                      </div>
                    </div>
                  </td>

                  {/* Role & Dept */}
                  <td className="py-3.5 px-4 text-xs whitespace-nowrap">
                    <div className="font-mono font-bold text-slate-100 bg-slate-800/60 px-2 py-0.5 rounded inline-block">
                      {req.role_code}
                    </div>
                    <div className="text-slate-400 mt-1 font-medium">{req.role_title}</div>
                    <div className="text-slate-400 mt-0.5">{req.department || 'General'}</div>
                  </td>

                  {/* Classification & Mandatory */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="space-y-1.5">
                      <span className="inline-block px-2.5 py-0.5 rounded text-xs font-semibold capitalize bg-purple-100 text-purple-800 border border-purple-200">
                        {req.requirement_type.replace(/_/g, ' ')}
                      </span>
                      <div>
                        {isMandatory ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-amber-100 text-amber-900 border border-amber-200">
                            <ShieldCheck className="w-3 h-3 text-amber-600" /> Mandatory
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-800/60 text-slate-400">
                            Optional
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Priority & Due Stage */}
                  <td className="py-3.5 px-4 text-xs whitespace-nowrap">
                    <div className="space-y-1">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-bold capitalize ${
                          isHighPrio
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : 'bg-slate-800/60 text-slate-300'
                        }`}
                      >
                        {req.priority} Priority
                      </span>
                      <div className="text-slate-400 font-medium capitalize flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        Stage: {req.due_stage.replace(/_/g, ' ')}
                      </div>
                    </div>
                  </td>

                  {/* Source Traceability */}
                  <td className="py-3.5 px-4 text-xs whitespace-nowrap">
                    <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 space-y-0.5 font-mono">
                      <div className="font-bold text-slate-100 flex items-center gap-1.5">
                        <FileCode className="w-3.5 h-3.5 text-indigo-600" />
                        {req.source_document_id} (v{req.source_document_version})
                      </div>
                      <div className="text-slate-400 text-[11px]">
                        Section: <span className="font-semibold">{req.source_section_id}</span>
                        {req.source_location && <span> ({req.source_location})</span>}
                      </div>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onEditRequirement(req)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-800/60 rounded-lg transition-colors"
                        title="Edit Requirement"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onDeleteRequirement(req.requirement_id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Deactivate Requirement"
                      >
                        <Trash2 className="w-4 h-4" />
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
