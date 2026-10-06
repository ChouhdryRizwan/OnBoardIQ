import { api } from '../api';

export interface ReviewQueueItemResponse {
  review_id: string;
  plan_id: string;
  report_id: string;
  assigned_reviewer_id?: string | null;
  status: string; // "pending", "in_review", "approved", "rejected"
  reason_for_review: string;
  created_at: string;
  resolved_at?: string | null;
  employee_id: string;
  employee_name: string;
  role_title: string;
  department: string;
  mandatory_coverage_score: number;
  source_traceability_score: number;
  verification_status: string;
}

export interface ReviewAuditItem {
  audit_id: string;
  review_id: string;
  reviewer_id: string;
  action_taken: string;
  reviewer_comments: string;
  performed_at: string;
}

export interface FinalOnboardingPlanResponse {
  plan_id: string;
  employee_id: string;
  employee_name: string;
  role_code: string;
  role_title: string;
  department: string;
  plan_version: string;
  verification_status: string;
  final_approval_status: string;
  mandatory_coverage_score: number;
  source_traceability_score: number;
  created_at: string;
  finalized_at: string;
  original_genai_model: string;
  prompt_version: string;
  validation_report_id: string;
  stages: Record<string, unknown>[];
  checklists: Record<string, unknown>[];
  recommendations: string[];
  audit_trail: ReviewAuditItem[];
}

export interface ReviewItemDetails {
  review_queue_item: {
    review_id: string;
    report_id: string;
    plan_id: string;
    status: string;
    reason_for_review: string;
    created_at: string;
    resolved_at?: string | null;
  };
  plan_details: FinalOnboardingPlanResponse;
  validation_issues: {
    issue_id: string;
    requirement_id?: string;
    issue_type: string;
    severity: string;
    explanation: string;
    expected_value?: string;
    generated_value?: string;
  }[];
  hallucination_flags: {
    flag_id: string;
    module_id?: string;
    claimed_source_doc?: string;
    flagged_statement: string;
    reason?: string;
    is_resolved: boolean;
  }[];
  contradiction_flags: {
    contradiction_id: string;
    primary_document_id?: string;
    conflicting_document_id?: string;
    primary_clause?: string;
    conflicting_clause?: string;
    is_resolved: boolean;
  }[];
}

export interface ApprovePlanRequest {
  reviewer_id: string;
  comments?: string;
}

export interface RejectPlanRequest {
  reviewer_id: string;
  reason: string;
}

export interface EditPlanRequest {
  reviewer_id: string;
  edited_plan_structure: Record<string, unknown>;
  comments?: string;
}

export interface RegeneratePlanRequest {
  reviewer_id: string;
  feedback_prompt?: string;
  override_parameters?: Record<string, unknown>;
}

export interface AddCommentRequest {
  reviewer_id: string;
  comment: string;
}

export interface ManualOverrideRequest {
  reviewer_id: string;
  override_reason: string;
  target_issue_ids?: string[];
  force_status?: string;
}

export async function fetchHumanReviewQueue(statusFilter?: string): Promise<ReviewQueueItemResponse[]> {
  const url = statusFilter ? `/api/human-review/queue?status_filter=${statusFilter}` : '/api/human-review/queue';
  return api.get<ReviewQueueItemResponse[]>(url);
}

export async function fetchReviewItemDetails(reviewId: string): Promise<ReviewItemDetails> {
  return api.get<ReviewItemDetails>(`/api/human-review/queue/${reviewId}`);
}

export async function approveReviewPlan(
  reviewId: string,
  req: ApprovePlanRequest
): Promise<FinalOnboardingPlanResponse> {
  return api.post<FinalOnboardingPlanResponse>(`/api/human-review/${reviewId}/approve`, req);
}

export async function rejectReviewPlan(
  reviewId: string,
  req: RejectPlanRequest
): Promise<{ message: string; review_id: string; status: string; rejection_reason: string }> {
  return api.post(`/api/human-review/${reviewId}/reject`, req);
}

export async function editReviewPlan(
  reviewId: string,
  req: EditPlanRequest
): Promise<{
  message: string;
  plan_id: string;
  new_validation_report_id: string;
  updated_coverage_score: number;
  updated_verification_status: string;
}> {
  return api.post(`/api/human-review/${reviewId}/edit`, req);
}

export async function regenerateReviewPlan(
  reviewId: string,
  req: RegeneratePlanRequest
): Promise<{
  message: string;
  old_plan_id: string;
  new_plan_id: string;
  new_report_id: string;
  verification_status: string;
  mandatory_coverage_score: number;
}> {
  return api.post(`/api/human-review/${reviewId}/regenerate`, req);
}

export async function addReviewComment(
  reviewId: string,
  req: AddCommentRequest
): Promise<{ message: string; review_id: string; comment: string }> {
  return api.post(`/api/human-review/${reviewId}/comment`, req);
}

export async function overrideReviewFlags(
  reviewId: string,
  req: ManualOverrideRequest
): Promise<{ message: string; review_id: string; plan_id: string; new_status: string }> {
  return api.post(`/api/human-review/${reviewId}/override`, req);
}

export async function fetchFinalOnboardingPlan(planId: string): Promise<FinalOnboardingPlanResponse> {
  return api.get<FinalOnboardingPlanResponse>(`/api/human-review/plan/${planId}/final`);
}
