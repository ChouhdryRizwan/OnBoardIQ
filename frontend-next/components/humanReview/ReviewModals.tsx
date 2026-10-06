'use client';

import React, { useState } from 'react';
import {
  ApprovePlanRequest,
  RejectPlanRequest,
  EditPlanRequest,
  RegeneratePlanRequest,
  AddCommentRequest,
  ManualOverrideRequest,
  ReviewItemDetails,
} from '@/lib/services/humanReview';
import { X, CheckCircle2, XCircle, Edit3, RefreshCw, MessageSquare, ShieldAlert } from 'lucide-react';

interface ReviewModalsProps {
  activeModal: 'approve' | 'reject' | 'edit' | 'regenerate' | 'comment' | 'override' | null;
  onClose: () => void;
  details: ReviewItemDetails | null;
  onApprove: (req: ApprovePlanRequest) => Promise<void>;
  onReject: (req: RejectPlanRequest) => Promise<void>;
  onEdit: (req: EditPlanRequest) => Promise<void>;
  onRegenerate: (req: RegeneratePlanRequest) => Promise<void>;
  onComment: (req: AddCommentRequest) => Promise<void>;
  onOverride: (req: ManualOverrideRequest) => Promise<void>;
  actionLoading: boolean;
}

export function ReviewModals({
  activeModal,
  onClose,
  details,
  onApprove,
  onReject,
  onEdit,
  onRegenerate,
  onComment,
  onOverride,
  actionLoading,
}: ReviewModalsProps) {
  const [reviewerId, setReviewerId] = useState('Reviewer Admin');

  // Form states
  const [approveComments, setApproveComments] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [commentText, setCommentText] = useState('');
  const [regeneratePrompt, setRegeneratePrompt] = useState('');
  const [overrideReason, setOverrideReason] = useState('');
  const [forceStatus, setForceStatus] = useState('verified');

  // Edit form state
  const [editModuleId, setEditModuleId] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editPurpose, setEditPurpose] = useState('');
  const [editComments, setEditComments] = useState('');

  if (!activeModal || !details) return null;

  const isApproved =
    details.review_queue_item?.status?.toLowerCase() === 'approved' ||
    details.plan_details?.final_approval_status?.toLowerCase() === 'approved' ||
    details.plan_details?.final_approval_status?.toLowerCase() === 'finalized';

  if (isApproved && activeModal !== 'comment') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full shadow-2xl text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center mx-auto text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">Governance Actions Locked</h3>
            <p className="text-xs text-slate-400 mt-1">
              Plan <span className="font-mono text-purple-300 font-semibold">{details.plan_details.plan_id}</span> has already been approved and finalized. Destructive actions, structural edits, and regeneration are disabled.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg transition-colors border border-slate-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const reviewId = details.review_queue_item.review_id;

  const handleSubmitApprove = async (e: React.FormEvent) => {
    e.preventDefault();
    await onApprove({ reviewer_id: reviewerId, comments: approveComments || 'Approved by reviewer.' });
    onClose();
  };

  const handleSubmitReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectReason.trim()) return;
    await onReject({ reviewer_id: reviewerId, reason: rejectReason.trim() });
    onClose();
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    await onComment({ reviewer_id: reviewerId, comment: commentText.trim() });
    onClose();
  };

  const handleSubmitRegenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    await onRegenerate({ reviewer_id: reviewerId, feedback_prompt: regeneratePrompt });
    onClose();
  };

  const handleSubmitOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideReason.trim()) return;
    await onOverride({
      reviewer_id: reviewerId,
      override_reason: overrideReason.trim(),
      force_status: forceStatus,
    });
    onClose();
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModuleId || !editTitle.trim()) return;

    const editedStructure = {
      modules: [
        {
          module_id: editModuleId,
          title: editTitle.trim(),
          purpose: editPurpose.trim(),
        },
      ],
    };

    await onEdit({
      reviewer_id: reviewerId,
      edited_plan_structure: editedStructure,
      comments: editComments || 'Applied manual title/purpose edit.',
    });
    onClose();
  };

  // Extract first stage modules for edit dropdown
  const firstStage = details.plan_details.stages?.[0];
  const availableModules = (firstStage?.modules as Record<string, unknown>[]) || [];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950 flex-shrink-0">
          <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
            {activeModal === 'approve' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
            {activeModal === 'reject' && <XCircle className="w-5 h-5 text-rose-400" />}
            {activeModal === 'edit' && <Edit3 className="w-5 h-5 text-purple-400" />}
            {activeModal === 'regenerate' && <RefreshCw className="w-5 h-5 text-indigo-400" />}
            {activeModal === 'comment' && <MessageSquare className="w-5 h-5 text-blue-400" />}
            {activeModal === 'override' && <ShieldAlert className="w-5 h-5 text-amber-400" />}
            <span className="capitalize">{activeModal} Onboarding Plan</span>
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Forms */}
        <div className="p-6 text-xs text-slate-300 overflow-y-auto flex-1">
          {/* APPROVE FORM */}
          {activeModal === 'approve' && (
            <form onSubmit={handleSubmitApprove} className="space-y-4">
              <p className="text-slate-400">
                Grant final approval for Plan <strong>{details.plan_details.plan_id}</strong>. This will set verification status to <strong>VERIFIED</strong> and assign the plan to the employee learning portal.
              </p>
              <div>
                <label className="block font-semibold mb-1 text-slate-300">Reviewer Name/ID</label>
                <input
                  type="text"
                  value={reviewerId}
                  onChange={(e) => setReviewerId(e.target.value)}
                  className="w-full py-2 px-3 border border-slate-800 rounded-lg bg-slate-950 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-slate-300">Approval Notes (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Mandatory requirements verified and approved for assignment."
                  value={approveComments}
                  onChange={(e) => setApproveComments(e.target.value)}
                  className="w-full p-2.5 border border-slate-800 rounded-lg bg-slate-950 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                ></textarea>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button type="button" onClick={onClose} className="px-4 py-2 border border-slate-800 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors">Cancel</button>
                <button type="submit" disabled={actionLoading} className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg disabled:opacity-50 transition-colors">
                  Confirm Approval
                </button>
              </div>
            </form>
          )}

          {/* REJECT FORM */}
          {activeModal === 'reject' && (
            <form onSubmit={handleSubmitReject} className="space-y-4">
              <p className="text-rose-300 font-semibold bg-rose-950/60 p-3 rounded-lg border border-rose-900/60">
                Reject Plan {details.plan_details.plan_id}. Requires mandatory rejection explanation.
              </p>
              <div>
                <label className="block font-semibold mb-1 text-slate-300">Reviewer Name/ID</label>
                <input
                  type="text"
                  value={reviewerId}
                  onChange={(e) => setReviewerId(e.target.value)}
                  className="w-full py-2 px-3 border border-slate-800 rounded-lg bg-slate-950 text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500 font-semibold"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-slate-300">Rejection Reason <span className="text-rose-400">*</span></label>
                <textarea
                  rows={3}
                  required
                  placeholder="Specify why this plan fails compliance..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full p-2.5 border border-slate-800 rounded-lg bg-slate-950 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
                ></textarea>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button type="button" onClick={onClose} className="px-4 py-2 border border-slate-800 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors">Cancel</button>
                <button type="submit" disabled={actionLoading || !rejectReason.trim()} className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg disabled:opacity-50 transition-colors">
                  Confirm Rejection
                </button>
              </div>
            </form>
          )}

          {/* EDIT FORM */}
          {activeModal === 'edit' && (
            <form onSubmit={handleSubmitEdit} className="space-y-4">
              <p className="text-slate-400">
                Directly edit a learning module title/purpose and trigger automated Pipeline 2 re-validation.
              </p>
              <div>
                <label className="block font-semibold mb-1 text-slate-300">Select Module to Edit</label>
                <select
                  value={editModuleId}
                  onChange={(e) => {
                    setEditModuleId(e.target.value);
                    const found = availableModules.find((m) => m.module_id === e.target.value);
                    if (found) {
                      setEditTitle((found.title as string) || '');
                      setEditPurpose((found.purpose as string) || '');
                    }
                  }}
                  className="w-full py-2 px-3 border border-slate-800 rounded-lg bg-slate-950 text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">-- Choose Module --</option>
                  {availableModules.map((m) => (
                    <option key={m.module_id as string} value={m.module_id as string}>
                      {m.module_code as string} - {m.title as string}
                    </option>
                  ))}
                </select>
              </div>
              {editModuleId && (
                <>
                  <div>
                    <label className="block font-semibold mb-1 text-slate-300">Module Title</label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full py-2 px-3 border border-slate-800 rounded-lg bg-slate-950 text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-slate-300">Edit Explanation / Comments</label>
                    <input
                      type="text"
                      placeholder="e.g. Updated module title for clarity."
                      value={editComments}
                      onChange={(e) => setEditComments(e.target.value)}
                      className="w-full py-2 px-3 border border-slate-800 rounded-lg bg-slate-950 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </>
              )}
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button type="button" onClick={onClose} className="px-4 py-2 border border-slate-800 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors">Cancel</button>
                <button type="submit" disabled={actionLoading || !editModuleId} className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg disabled:opacity-50 transition-colors">
                  Save & Re-Validate
                </button>
              </div>
            </form>
          )}

          {/* REGENERATE FORM */}
          {activeModal === 'regenerate' && (
            <form onSubmit={handleSubmitRegenerate} className="space-y-4">
              <p className="text-slate-400">
                Trigger Gemini LLM plan regeneration (Pipeline 1) and Python verification (Pipeline 2) for this employee.
              </p>
              <div>
                <label className="block font-semibold mb-1 text-slate-300">Feedback Instructions for LLM Prompt</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Ensure emergency procedures and fire safety module are included in Stage 1."
                  value={regeneratePrompt}
                  onChange={(e) => setRegeneratePrompt(e.target.value)}
                  className="w-full p-2.5 border border-slate-800 rounded-lg bg-slate-950 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button type="button" onClick={onClose} className="px-4 py-2 border border-slate-800 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors">Cancel</button>
                <button type="submit" disabled={actionLoading} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg disabled:opacity-50 transition-colors">
                  Trigger Regeneration
                </button>
              </div>
            </form>
          )}

          {/* COMMENT FORM */}
          {activeModal === 'comment' && (
            <form onSubmit={handleSubmitComment} className="space-y-4">
              <p className="text-slate-400">Add a reviewer audit note to review item {reviewId}.</p>
              <div>
                <label className="block font-semibold mb-1 text-slate-300">Reviewer Note <span className="text-rose-400">*</span></label>
                <textarea
                  rows={3}
                  required
                  placeholder="Enter notes for audit trail..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="w-full p-2.5 border border-slate-800 rounded-lg bg-slate-950 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button type="button" onClick={onClose} className="px-4 py-2 border border-slate-800 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors">Cancel</button>
                <button type="submit" disabled={actionLoading || !commentText.trim()} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg disabled:opacity-50 transition-colors">
                  Add Comment
                </button>
              </div>
            </form>
          )}

          {/* OVERRIDE FORM */}
          {activeModal === 'override' && (
            <form onSubmit={handleSubmitOverride} className="space-y-4">
              <p className="text-amber-300 font-semibold bg-amber-950/60 p-3 rounded-lg border border-amber-900/60">
                Manually resolve validation flags and force plan verification status.
              </p>
              <div>
                <label className="block font-semibold mb-1 text-slate-300">Override Justification <span className="text-rose-400">*</span></label>
                <textarea
                  rows={3}
                  required
                  placeholder="Provide audit reason for manual override..."
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  className="w-full p-2.5 border border-slate-800 rounded-lg bg-slate-950 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                ></textarea>
              </div>
              <div>
                <label className="block font-semibold mb-1 text-slate-300">Forced Verification Status</label>
                <select
                  value={forceStatus}
                  onChange={(e) => setForceStatus(e.target.value)}
                  className="w-full py-2 px-3 border border-slate-800 rounded-lg bg-slate-950 text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
                >
                  <option value="verified">VERIFIED (100% Approved)</option>
                  <option value="verified_with_warning">VERIFIED WITH WARNING</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button type="button" onClick={onClose} className="px-4 py-2 border border-slate-800 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors">Cancel</button>
                <button type="submit" disabled={actionLoading || !overrideReason.trim()} className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg disabled:opacity-50 transition-colors">
                  Apply Manual Override
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
