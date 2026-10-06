'use client';

import React, { useState } from 'react';
import {
  createRequirement,
  updateRequirement,
  MatrixRequirementResponseSchema,
  JobRoleResponseSchema,
  MatrixRequirementCreateSchema,
} from '@/lib/services/rrm';
import { FileText, X, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

interface RequirementFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  rolesList: JobRoleResponseSchema[];
  editRequirement?: MatrixRequirementResponseSchema | null;
}

export function RequirementFormModal({
  isOpen,
  onClose,
  onSuccess,
  rolesList,
  editRequirement,
}: RequirementFormModalProps) {
  const [reqId, setReqId] = useState(editRequirement?.requirement_id || '');
  const [roleIdentifier, setRoleIdentifier] = useState(
    editRequirement?.role_code || editRequirement?.job_role_id || (rolesList.length > 0 ? rolesList[0].role_code : '')
  );
  const [title, setTitle] = useState(editRequirement?.title || '');
  const [policyRequirement, setPolicyRequirement] = useState(editRequirement?.policy_requirement || '');
  const [processRequirement, setProcessRequirement] = useState(editRequirement?.process_requirement || '');
  const [requiredCompetency, setRequiredCompetency] = useState(editRequirement?.required_competency || '');
  const [isMandatory, setIsMandatory] = useState(editRequirement ? editRequirement.is_mandatory : true);
  const [requirementType, setRequirementType] = useState(editRequirement?.requirement_type || 'must_know');
  const [priority, setPriority] = useState(editRequirement?.priority || 'high');
  const [dueStage, setDueStage] = useState(editRequirement?.due_stage || 'week_1');
  const [sourceDocId, setSourceDocId] = useState(editRequirement?.source_document_id || 'SOP-07');
  const [sourceDocVersion, setSourceDocVersion] = useState(editRequirement?.source_document_version || 1);
  const [sourceSectionId, setSourceSectionId] = useState(editRequirement?.source_section_id || '1.0');
  const [sourceLocation, setSourceLocation] = useState(editRequirement?.source_location || '');
  const [taskDesc, setTaskDesc] = useState(editRequirement?.required_task_description || '');
  const [assessmentTopic, setAssessmentTopic] = useState(editRequirement?.required_assessment_topic || '');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!policyRequirement.trim() || !requiredCompetency.trim() || !sourceDocId.trim() || !sourceSectionId.trim()) {
      setErrorMsg('Policy requirement, competency, source document ID, and section ID are required.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (editRequirement) {
        await updateRequirement(editRequirement.requirement_id, {
          title: title.trim(),
          policy_requirement: policyRequirement.trim(),
          process_requirement: processRequirement.trim(),
          required_competency: requiredCompetency.trim(),
          is_mandatory: isMandatory,
          requirement_type: requirementType,
          priority: priority,
          due_stage: dueStage,
          source_document_id: sourceDocId.trim().toUpperCase(),
          source_document_version: sourceDocVersion,
          source_section_id: sourceSectionId.trim(),
          source_location: sourceLocation.trim(),
          required_task_description: taskDesc.trim(),
          required_assessment_topic: assessmentTopic.trim(),
        });
        setSuccessMsg('Requirement updated successfully!');
      } else {
        if (!reqId.trim() || !roleIdentifier.trim()) {
          setErrorMsg('Requirement ID and Role selection are required for new requirements.');
          setSubmitting(false);
          return;
        }

        const payload: MatrixRequirementCreateSchema = {
          requirement_id: reqId.trim().toUpperCase(),
          role_identifier: roleIdentifier.trim(),
          title: title.trim() || undefined,
          policy_requirement: policyRequirement.trim(),
          process_requirement: processRequirement.trim() || undefined,
          required_competency: requiredCompetency.trim(),
          is_mandatory: isMandatory,
          requirement_type: requirementType,
          priority: priority,
          due_stage: dueStage,
          source_document_id: sourceDocId.trim().toUpperCase(),
          source_document_version: sourceDocVersion,
          source_section_id: sourceSectionId.trim(),
          source_location: sourceLocation.trim() || undefined,
          required_task_description: taskDesc.trim() || undefined,
          required_assessment_topic: assessmentTopic.trim() || undefined,
        };

        await createRequirement(payload);
        setSuccessMsg('Requirement added to Role Matrix successfully!');
      }

      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1200);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Operation failed. Verify source document and version existence.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-2xl w-full max-w-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-100">
              {editRequirement ? `Edit Requirement (${editRequirement.requirement_id})` : 'Add Matrix Requirement'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-400 hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Requirement ID <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. REQ-CS-001"
                value={reqId}
                onChange={(e) => setReqId(e.target.value)}
                disabled={!!editRequirement}
                required
                className="w-full py-2 px-3 text-sm border border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase font-mono disabled:bg-slate-800/60"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Assigned Role <span className="text-rose-500">*</span>
              </label>
              <select
                value={roleIdentifier}
                onChange={(e) => setRoleIdentifier(e.target.value)}
                disabled={!!editRequirement}
                required
                className="w-full py-2 px-3 text-sm border border-slate-800 rounded-lg bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-800/60"
              >
                {rolesList.map((r) => (
                  <option key={r.role_id} value={r.role_code}>
                    {r.role_code} - {r.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Short Title</label>
              <input
                type="text"
                placeholder="e.g. Data Privacy & Incident Escalation SLA"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full py-2 px-3 text-sm border border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Policy Requirement Text <span className="text-rose-500">*</span>
              </label>
              <textarea
                placeholder="Exact statement of policy requirement..."
                value={policyRequirement}
                onChange={(e) => setPolicyRequirement(e.target.value)}
                rows={2}
                required
                className="w-full py-2 px-3 text-sm border border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Process Requirement (Optional)</label>
              <input
                type="text"
                placeholder="e.g. SOP-07 Section 4.2 Escalation Workflow"
                value={processRequirement}
                onChange={(e) => setProcessRequirement(e.target.value)}
                className="w-full py-2 px-3 text-sm border border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Required Task Description (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Respond to a simulated escalation scenario"
                value={taskDesc}
                onChange={(e) => setTaskDesc(e.target.value)}
                className="w-full py-2 px-3 text-sm border border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Required Assessment Topic (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Complaint Handling SLA Rules"
                value={assessmentTopic}
                onChange={(e) => setAssessmentTopic(e.target.value)}
                className="w-full py-2 px-3 text-sm border border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Required Competency <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Incident Response Procedure"
                value={requiredCompetency}
                onChange={(e) => setRequiredCompetency(e.target.value)}
                required
                className="w-full py-2 px-3 text-sm border border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Classification</label>
              <select
                value={requirementType}
                onChange={(e) => setRequirementType(e.target.value)}
                className="w-full py-2 px-3 text-sm border border-slate-800 rounded-lg bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 capitalize"
              >
                <option value="must_know">Must Know</option>
                <option value="must_complete">Must Complete</option>
                <option value="must_demonstrate">Must Demonstrate</option>
                <option value="must_acknowledge">Must Acknowledge</option>
                <option value="recommended">Recommended</option>
                <option value="optional">Optional</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full py-2 px-3 text-sm border border-slate-800 rounded-lg bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 capitalize"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Target Due Stage</label>
              <select
                value={dueStage}
                onChange={(e) => setDueStage(e.target.value)}
                className="w-full py-2 px-3 text-sm border border-slate-800 rounded-lg bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 capitalize"
              >
                <option value="day_1">Day 1</option>
                <option value="week_1">Week 1</option>
                <option value="week_2">Week 2</option>
                <option value="first_30_days">First 30 Days</option>
                <option value="first_60_days">First 60 Days</option>
                <option value="first_90_days">First 90 Days</option>
              </select>
            </div>

            {/* Source Document Traceability Section */}
            <div className="sm:col-span-2 bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-indigo-600" /> Source Traceability Ground Truth
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Source Document ID <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. SOP-07 or POL-01"
                    value={sourceDocId}
                    onChange={(e) => setSourceDocId(e.target.value)}
                    required
                    className="w-full py-1.5 px-2.5 text-xs border border-slate-800 rounded-lg uppercase font-mono bg-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Doc Version</label>
                  <input
                    type="number"
                    min="1"
                    value={sourceDocVersion}
                    onChange={(e) => setSourceDocVersion(parseInt(e.target.value) || 1)}
                    className="w-full py-1.5 px-2.5 text-xs border border-slate-800 rounded-lg bg-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Section ID <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 4.2"
                    value={sourceSectionId}
                    onChange={(e) => setSourceSectionId(e.target.value)}
                    required
                    className="w-full py-1.5 px-2.5 text-xs border border-slate-800 rounded-lg bg-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Source Location (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Page 3, Paragraph 2"
                  value={sourceLocation}
                  onChange={(e) => setSourceLocation(e.target.value)}
                  className="w-full py-1.5 px-2.5 text-xs border border-slate-800 rounded-lg bg-slate-900"
                />
              </div>
            </div>

            <div className="sm:col-span-2 flex items-center gap-2">
              <input
                type="checkbox"
                id="mandatory-check"
                checked={isMandatory}
                onChange={(e) => setIsMandatory(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded border-slate-700 focus:ring-indigo-500"
              />
              <label htmlFor="mandatory-check" className="text-xs font-semibold text-slate-200 cursor-pointer">
                Strictly Mandatory Requirement (Triggers compliance verification)
              </label>
            </div>
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
              {editRequirement ? 'Save Requirement Changes' : 'Add Matrix Requirement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
