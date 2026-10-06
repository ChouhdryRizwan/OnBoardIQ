import { api } from '../api';
import { JobRole, CompanyDocument } from '../../types';

export interface HealthCheckResponse {
  status: string;
  service: string;
  version: string;
  database: string;
}

export interface ReportsOverviewResponse {
  total_employees: number;
  active_employees: number;
  total_roles: number;
  total_requirements: number;
  mandatory_requirements: number;
  active_training_plans: number;
  completed_plans: number;
  average_progress_percentage: number;
  pending_reviews: number;
  validation_failures: number;
  outdated_plans: number;
  policy_changes_count: number;
  assessment_completion_rate: number;
}

export interface ReviewQueueItemResponse {
  review_id: string;
  plan_id: string;
  report_id: string;
  assigned_reviewer_id?: string;
  status: string; // pending, approved, rejected, edited
  reason_for_review?: string;
  created_at: string;
  resolved_at?: string | null;
  employee_id: string;
  employee_name: string;
  role_title: string;
  department: string;
  mandatory_coverage_score: number;
  source_traceability_score: number;
  verification_status: string; // verified, verified_with_warning, partially_verified, manual_review_required, outdated_source
}

export interface GenAIComparisonItem {
  plan_id: string;
  requirement_id?: string;
  module_id?: string;
  comparison_id?: string;
  employee_id?: string;
  employee_name?: string;
  role_code?: string;
  role_id?: string;
  genai_claimed_coverage?: number;
  python_verified_coverage?: number;
  coverage_discrepancy?: number;
  genai_status_claim?: string;
  python_verified_status?: string;
  is_agreement?: boolean;
  flagged_hallucinations_count?: number;
  flagged_contradictions_count?: number;
  evaluation_notes?: string;
}

export interface GenAIPythonComparisonSummary {
  total_plans_evaluated: number;
  full_agreement_count: number;
  partial_disagreement_count: number;
  severe_discrepancy_count: number;
  agreement_percentage: number;
  average_coverage_difference: number;
  hallucination_rate_percentage: number;
  items: GenAIComparisonItem[];
}

export interface TraceabilityReportItem {
  requirement_id: string;
  requirement_title: string;
  role_code: string;
  role_title: string;
  is_mandatory: boolean;
  source_document_id: string;
  source_document_title: string;
  source_section_heading: string;
  chunk_id: string;
  page_number?: number;
  is_verified_traceable: boolean;
  plan_id?: string;
  module_title?: string;
  validation_status: string;
}

export interface HallucinationReportItem {
  flag_id: string;
  plan_id: string;
  report_id: string;
  employee_name: string;
  role_code: string;
  flag_type: string; // unsupported_claim, contradiction, missing_source, unverified_prerequisite
  severity: string; // critical, high, medium, low
  claimed_source_doc: string;
  flagged_statement: string;
  reason: string;
  review_status: string; // pending, resolved, overridden
  detected_at: string;
}

export interface PolicyUpdateSummaryResponse {
  update_id: string;
  document_id: string;
  document_title: string;
  old_version: string;
  new_version: string;
  change_type: string;
  affected_roles_count: number;
  affected_plans_count: number;
  affected_modules_count: number;
  affected_employees_count: number;
  status: string; // detected, analyzing, regenerated, completed
  detected_at: string;
}

export interface ReviewerDashboardData {
  health: HealthCheckResponse | null;
  overview: ReportsOverviewResponse | null;
  reviewQueue: ReviewQueueItemResponse[];
  comparison: GenAIPythonComparisonSummary | null;
  traceability: TraceabilityReportItem[];
  validationIssues: HallucinationReportItem[];
  policyUpdates: PolicyUpdateSummaryResponse[];
  jobRoles: JobRole[];
  documents: CompanyDocument[];
  errors: Record<string, string>;
}

export async function fetchReviewerDashboardData(filters?: {
  status?: string;
  search?: string;
}): Promise<ReviewerDashboardData> {
  const result: ReviewerDashboardData = {
    health: null,
    overview: null,
    reviewQueue: [],
    comparison: null,
    traceability: [],
    validationIssues: [],
    policyUpdates: [],
    jobRoles: [],
    documents: [],
    errors: {},
  };

  // 1. Health
  try {
    result.health = await api.get<HealthCheckResponse>('/health');
  } catch (err: unknown) {
    result.errors.health = err instanceof Error ? err.message : 'Health API unavailable';
  }

  // 2. Overview metrics
  try {
    result.overview = await api.get<ReportsOverviewResponse>('/api/reports/overview');
  } catch (err: unknown) {
    result.errors.overview = err instanceof Error ? err.message : 'Reports overview API unavailable';
  }

  // 3. Human Review Queue (with optional status filter)
  try {
    const endpoint = filters?.status
      ? `/api/human-review/queue?status_filter=${encodeURIComponent(filters.status)}`
      : '/api/human-review/queue';
    result.reviewQueue = await api.get<ReviewQueueItemResponse[]>(endpoint);
  } catch (err: unknown) {
    result.errors.reviewQueue = err instanceof Error ? err.message : 'Review queue API unavailable';
  }

  // 4. GenAI vs Python Comparison Summary
  try {
    result.comparison = await api.get<GenAIPythonComparisonSummary>('/api/reports/genai-vs-python');
  } catch (err: unknown) {
    result.errors.comparison = err instanceof Error ? err.message : 'GenAI vs Python comparison API unavailable';
  }

  // 5. Traceability Report
  try {
    result.traceability = await api.get<TraceabilityReportItem[]>('/api/reports/traceability');
  } catch (err: unknown) {
    result.errors.traceability = err instanceof Error ? err.message : 'Traceability report API unavailable';
  }

  // 6. Validation Issues / Hallucination Report
  try {
    result.validationIssues = await api.get<HallucinationReportItem[]>('/api/reports/hallucinations');
  } catch (err: unknown) {
    result.errors.validationIssues = err instanceof Error ? err.message : 'Validation issues API unavailable';
  }

  // 7. Policy Updates
  try {
    result.policyUpdates = await api.get<PolicyUpdateSummaryResponse[]>('/api/policy-updates');
  } catch (err: unknown) {
    result.errors.policyUpdates = err instanceof Error ? err.message : 'Policy updates API unavailable';
  }

  // 8. Job Roles
  try {
    result.jobRoles = await api.get<JobRole[]>('/api/roles');
  } catch (err: unknown) {
    result.errors.jobRoles = err instanceof Error ? err.message : 'Job roles API unavailable';
  }

  // 9. Documents
  try {
    result.documents = await api.get<CompanyDocument[]>('/api/documents');
  } catch (err: unknown) {
    result.errors.documents = err instanceof Error ? err.message : 'Documents API unavailable';
  }

  return result;
}
