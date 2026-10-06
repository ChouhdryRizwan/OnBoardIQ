'use client';

import React from 'react';
import { ReviewItemDetails } from '@/lib/services/humanReview';
import { CheckCircle2, XCircle, Edit3, RefreshCw, MessageSquare, ShieldAlert, Lock, ShieldCheck } from 'lucide-react';

interface ReviewActionsPanelProps {
  onOpenModal: (action: 'approve' | 'reject' | 'edit' | 'regenerate' | 'comment' | 'override') => void;
  disabled: boolean;
  details?: ReviewItemDetails | null;
  status?: string;
}

export function ReviewActionsPanel({ onOpenModal, disabled, details, status }: ReviewActionsPanelProps) {
  const itemStatus = (status || details?.review_queue_item?.status || '').toLowerCase();
  const finalStatus = (details?.plan_details?.final_approval_status || '').toLowerCase();

  const isApproved =
    itemStatus === 'approved' ||
    finalStatus === 'approved' ||
    finalStatus === 'finalized';

  const isRejected =
    itemStatus === 'rejected' ||
    finalStatus === 'rejected';

  return (
    <div className="bg-slate-900 text-white rounded-xl p-6 border border-slate-800 shadow-lg mb-6">
      {/* Banner for Approved Plan State */}
      {isApproved && (
        <div className="mb-5 p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-900/70 border border-emerald-500/50 flex items-center justify-center shrink-0 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-emerald-200">
                  Plan Approved — Governance actions are locked.
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-emerald-900/90 text-emerald-300 border border-emerald-600/60 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Locked
                </span>
              </div>
              <p className="text-xs text-emerald-400/80 mt-0.5">
                This onboarding plan has been approved and assigned to the employee learning workflow. Destructive actions, structural modifications, and regeneration are disabled.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Banner for Rejected Plan State */}
      {isRejected && (
        <div className="mb-5 p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-rose-900/70 border border-rose-500/50 flex items-center justify-center shrink-0 text-rose-400">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-rose-200">
                  Plan Rejected — Awaiting Resolution
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-rose-900/90 text-rose-300 border border-rose-600/60">
                  Rejected
                </span>
              </div>
              <p className="text-xs text-rose-400/80 mt-0.5">
                This onboarding plan has been rejected. Modify structure, regenerate with new guidance, or apply an authorized manual override to proceed.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            Reviewer Actions & Governance Controls
            {isApproved && (
              <span className="text-xs font-normal text-emerald-400 bg-emerald-950/80 border border-emerald-700/60 px-2 py-0.5 rounded">
                Finalized
              </span>
            )}
          </h3>
          <p className="text-slate-400 text-xs mt-0.5">
            {isApproved
              ? 'Authoritative governance completed. Notes can still be appended to the audit trail.'
              : 'Execute authoritative human review decisions for the active onboarding plan'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Approve */}
          {isApproved ? (
            <button
              disabled={true}
              title="Plan is already approved. Governance actions are locked."
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-950/60 text-emerald-400/80 border border-emerald-800/60 text-xs font-bold rounded-lg cursor-not-allowed"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Plan Approved
            </button>
          ) : (
            <button
              onClick={() => onOpenModal('approve')}
              disabled={disabled || isRejected}
              title={isRejected ? 'Cannot approve a rejected plan without revision' : 'Approve onboarding plan'}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <CheckCircle2 className="w-4 h-4" /> Approve Plan
            </button>
          )}

          {/* Reject */}
          {isApproved ? (
            <button
              disabled={true}
              title="Cannot reject an approved plan. Governance actions are locked."
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-800/40 border border-slate-700/40 text-slate-500 text-xs font-bold rounded-lg cursor-not-allowed opacity-50"
            >
              <XCircle className="w-4 h-4 text-slate-500" /> Reject Plan
            </button>
          ) : isRejected ? (
            <button
              disabled={true}
              title="Plan is already rejected"
              className="flex items-center gap-1.5 px-4 py-2 bg-rose-950/60 border border-rose-800/60 text-rose-400/80 text-xs font-bold rounded-lg cursor-not-allowed"
            >
              <XCircle className="w-4 h-4 text-rose-400" /> Plan Rejected
            </button>
          ) : (
            <button
              onClick={() => onOpenModal('reject')}
              disabled={disabled}
              className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg shadow transition-colors disabled:opacity-50"
            >
              <XCircle className="w-4 h-4" /> Reject Plan
            </button>
          )}

          {/* Edit */}
          {isApproved ? (
            <button
              disabled={true}
              title="Structural edits locked for approved plans"
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-800/40 border border-slate-700/40 text-slate-500 text-xs font-bold rounded-lg cursor-not-allowed opacity-50"
            >
              <Edit3 className="w-4 h-4 text-slate-500" /> Edit Structure
            </button>
          ) : (
            <button
              onClick={() => onOpenModal('edit')}
              disabled={disabled}
              className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-lg shadow transition-colors disabled:opacity-50"
            >
              <Edit3 className="w-4 h-4" /> Edit Structure
            </button>
          )}

          {/* Regenerate */}
          {isApproved ? (
            <button
              disabled={true}
              title="Regeneration locked for approved plans"
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-800/40 border border-slate-700/40 text-slate-500 text-xs font-bold rounded-lg cursor-not-allowed opacity-50"
            >
              <RefreshCw className="w-4 h-4 text-slate-500" /> Regenerate
            </button>
          ) : (
            <button
              onClick={() => onOpenModal('regenerate')}
              disabled={disabled}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow transition-colors disabled:opacity-50"
            >
              <RefreshCw className="w-4 h-4" /> Regenerate
            </button>
          )}

          {/* Override */}
          {isApproved ? (
            <button
              disabled={true}
              title="Manual override locked for approved plans"
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-800/40 border border-slate-700/40 text-slate-500 text-xs font-bold rounded-lg cursor-not-allowed opacity-50"
            >
              <ShieldAlert className="w-4 h-4 text-slate-500" /> Manual Override
            </button>
          ) : (
            <button
              onClick={() => onOpenModal('override')}
              disabled={disabled}
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-lg shadow transition-colors disabled:opacity-50"
            >
              <ShieldAlert className="w-4 h-4" /> Manual Override
            </button>
          )}

          {/* Comment */}
          <button
            onClick={() => onOpenModal('comment')}
            disabled={disabled}
            className={`flex items-center gap-1.5 px-4 py-2 text-white text-xs font-bold rounded-lg transition-colors shadow disabled:opacity-50 ${
              isApproved
                ? 'bg-purple-600 hover:bg-purple-500'
                : 'bg-slate-700 hover:bg-slate-600'
            }`}
          >
            <MessageSquare className="w-4 h-4" /> Add Comment
          </button>
        </div>
      </div>
    </div>
  );
}
