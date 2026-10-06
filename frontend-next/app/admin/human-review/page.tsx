'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/dashboard/AppLayout';
import { DashboardPageContainer } from '@/components/dashboard/DashboardPageContainer';
import {
  fetchHumanReviewQueue,
  fetchReviewItemDetails,
  approveReviewPlan,
  rejectReviewPlan,
  editReviewPlan,
  regenerateReviewPlan,
  addReviewComment,
  overrideReviewFlags,
  ReviewQueueItemResponse,
  ReviewItemDetails,
  ApprovePlanRequest,
  RejectPlanRequest,
  EditPlanRequest,
  RegeneratePlanRequest,
  AddCommentRequest,
  ManualOverrideRequest,
} from '@/lib/services/humanReview';

import { HumanReviewHeader } from '@/components/humanReview/HumanReviewHeader';
import { ReviewQueueTable } from '@/components/humanReview/ReviewQueueTable';
import { ReviewDetailPanel } from '@/components/humanReview/ReviewDetailPanel';
import { ReviewActionsPanel } from '@/components/humanReview/ReviewActionsPanel';
import { ReviewModals } from '@/components/humanReview/ReviewModals';

export default function HumanReviewPage() {
  const [queueItems, setQueueItems] = useState<ReviewQueueItemResponse[]>([]);
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  const [reviewDetails, setReviewDetails] = useState<ReviewItemDetails | null>(null);

  const [loadingQueue, setLoadingQueue] = useState<boolean>(true);
  const [loadingDetails, setLoadingDetails] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Active modal state
  const [activeModal, setActiveModal] = useState<'approve' | 'reject' | 'edit' | 'regenerate' | 'comment' | 'override' | null>(null);

  const reloadQueueData = async () => {
    setLoadingQueue(true);
    setErrorMsg(null);
    try {
      const qData = await fetchHumanReviewQueue();
      setQueueItems(qData);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to load human review queue.');
    } finally {
      setLoadingQueue(false);
    }
  };

  const reloadItemDetails = async (reviewId: string) => {
    setLoadingDetails(true);
    setErrorMsg(null);
    try {
      const dData = await fetchReviewItemDetails(reviewId);
      setReviewDetails(dData);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to load review details.');
      setReviewDetails(null);
    } finally {
      setLoadingDetails(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    async function initQueue() {
      setLoadingQueue(true);
      setErrorMsg(null);
      try {
        const qData = await fetchHumanReviewQueue();
        if (!ignore) {
          setQueueItems(qData);
          if (qData.length > 0 && !selectedReviewId) {
            setSelectedReviewId(qData[0].review_id);
          }
        }
      } catch (err: unknown) {
        if (!ignore) {
          setErrorMsg(err instanceof Error ? err.message : 'Failed to load human review queue.');
        }
      } finally {
        if (!ignore) setLoadingQueue(false);
      }
    }

    initQueue();
    return () => {
      ignore = true;
    };
  }, [selectedReviewId]);

  useEffect(() => {
    const targetId = selectedReviewId;
    if (!targetId) return;
    let ignore = false;
    async function initDetails() {
      if (!targetId) return;
      setLoadingDetails(true);
      setErrorMsg(null);
      try {
        const dData = await fetchReviewItemDetails(targetId);
        if (!ignore) setReviewDetails(dData);
      } catch (err: unknown) {
        if (!ignore) {
          setErrorMsg(err instanceof Error ? err.message : 'Failed to load review details.');
          setReviewDetails(null);
        }
      } finally {
        if (!ignore) setLoadingDetails(false);
      }
    }

    initDetails();
    return () => {
      ignore = true;
    };
  }, [selectedReviewId]);

  // Action Handlers
  const isSelectedPlanApproved =
    reviewDetails?.review_queue_item?.status?.toLowerCase() === 'approved' ||
    reviewDetails?.plan_details?.final_approval_status?.toLowerCase() === 'approved' ||
    reviewDetails?.plan_details?.final_approval_status?.toLowerCase() === 'finalized';

  const handleApprove = async (req: ApprovePlanRequest) => {
    const targetId = selectedReviewId;
    if (!targetId) return;
    if (isSelectedPlanApproved) {
      setErrorMsg('This plan is already approved and finalized. Governance actions are locked.');
      return;
    }
    setActionLoading(true);
    try {
      await approveReviewPlan(targetId, req);
      await reloadQueueData();
      await reloadItemDetails(targetId);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Plan approval failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (req: RejectPlanRequest) => {
    const targetId = selectedReviewId;
    if (!targetId) return;
    if (isSelectedPlanApproved) {
      setErrorMsg('Cannot reject: Plan is already approved and finalized. Governance actions are locked.');
      return;
    }
    setActionLoading(true);
    try {
      await rejectReviewPlan(targetId, req);
      await reloadQueueData();
      await reloadItemDetails(targetId);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Plan rejection failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = async (req: EditPlanRequest) => {
    const targetId = selectedReviewId;
    if (!targetId) return;
    if (isSelectedPlanApproved) {
      setErrorMsg('Cannot edit: Plan is already approved and finalized. Governance actions are locked.');
      return;
    }
    setActionLoading(true);
    try {
      await editReviewPlan(targetId, req);
      await reloadQueueData();
      await reloadItemDetails(targetId);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Plan editing failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRegenerate = async (req: RegeneratePlanRequest) => {
    const targetId = selectedReviewId;
    if (!targetId) return;
    if (isSelectedPlanApproved) {
      setErrorMsg('Cannot regenerate: Plan is already approved and finalized. Governance actions are locked.');
      return;
    }
    setActionLoading(true);
    try {
      await regenerateReviewPlan(targetId, req);
      await reloadQueueData();
      await reloadItemDetails(targetId);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Plan regeneration failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleComment = async (req: AddCommentRequest) => {
    const targetId = selectedReviewId;
    if (!targetId) return;
    setActionLoading(true);
    try {
      await addReviewComment(targetId, req);
      await reloadItemDetails(targetId);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Adding comment failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOverride = async (req: ManualOverrideRequest) => {
    const targetId = selectedReviewId;
    if (!targetId) return;
    if (isSelectedPlanApproved) {
      setErrorMsg('Cannot apply manual override: Plan is already approved and finalized. Governance actions are locked.');
      return;
    }
    setActionLoading(true);
    try {
      await overrideReviewFlags(targetId, req);
      await reloadQueueData();
      await reloadItemDetails(targetId);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Manual override failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const totalPending = queueItems.filter((i) => i.status.toLowerCase() === 'pending').length;

  return (
    <AppLayout>
      <DashboardPageContainer>
        <div className="space-y-6">
          <HumanReviewHeader
            onRefresh={reloadQueueData}
            loading={loadingQueue}
            totalPending={totalPending}
          />

          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
              Error: {errorMsg}
            </div>
          )}

          <ReviewQueueTable
            queueItems={queueItems}
            selectedReviewId={selectedReviewId}
            onSelectReview={(item) => setSelectedReviewId(item.review_id)}
            loading={loadingQueue}
          />

          {selectedReviewId && (
            <>
              <ReviewActionsPanel
                onOpenModal={(modal) => setActiveModal(modal)}
                disabled={loadingDetails || actionLoading}
                details={reviewDetails}
              />

              <ReviewDetailPanel
                details={reviewDetails}
                loading={loadingDetails}
              />
            </>
          )}

          <ReviewModals
            activeModal={activeModal}
            onClose={() => setActiveModal(null)}
            details={reviewDetails}
            onApprove={handleApprove}
            onReject={handleReject}
            onEdit={handleEdit}
            onRegenerate={handleRegenerate}
            onComment={handleComment}
            onOverride={handleOverride}
            actionLoading={actionLoading}
          />
        </div>
      </DashboardPageContainer>
    </AppLayout>
  );
}
