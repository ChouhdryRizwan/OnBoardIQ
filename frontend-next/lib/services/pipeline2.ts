import { api } from '../api';

export interface RequirementComparisonDetail {
  comparison_id?: string;
  requirement_id: string;
  job_role_code?: string;
  python_expected_source_doc?: string;
  python_expected_source_sec?: string;
  python_expected_mandatory?: boolean;
  genai_output_source_doc?: string;
  genai_output_source_sec?: string;
  genai_output_mandatory?: boolean;
  match_result?: string;
  validation_status?: string;
  disagreement_explanation?: string | null;
}

export interface HallucinationFlag {
  flag_id?: string;
  module_id?: string;
  claimed_source_doc?: string;
  claimed_source_sec?: string;
  flagged_statement: string;
  reason?: string;
  is_resolved?: boolean;
}

export interface ContradictionFlag {
  contradiction_id?: string;
  primary_document_id?: string;
  conflicting_document_id?: string;
  primary_clause?: string;
  conflicting_clause?: string;
  applied_precedence_rule?: string;
  description?: string;
  is_resolved?: boolean;
}

export interface ValidationReportResponse {
  report_id: string;
  plan_id: string;
  employee_id: string;
  role_code: string;
  verification_status: string;
  mandatory_coverage_score: number;
  source_traceability_score: number;
  consistency_score: number;
  total_mandatory_requirements: number;
  covered_mandatory_requirements: number;
  missing_requirements_count: number;
  unsupported_requirements_count: number;
  contradiction_count: number;
  duplicate_count: number;
  evaluated_at: string;
  requires_manual_review: boolean;
  comparison_details: RequirementComparisonDetail[];
  hallucination_flags: HallucinationFlag[];
  contradiction_flags: ContradictionFlag[];
}

export interface ValidationIssue {
  issue_id: string;
  requirement_id?: string;
  issue_type: string;
  severity: string;
  explanation: string;
  expected_value?: string;
  generated_value?: string;
  source_info?: string;
}

export interface ValidationComparisonItem {
  requirement_id: string;
  role?: string;
  source?: string;
  python_expected_requirement?: string;
  genai_result?: string;
  match: boolean;
  coverage_status: string;
  traceability_status: string;
  validation_status: string;
  explanation?: string;
}

export interface ManualReviewQueueItem {
  queue_id: string;
  plan_id: string;
  report_id: string;
  reason?: string;
  priority?: string;
  status?: string;
  flagged_at?: string | null;
}

export async function runPipeline2Validation(planId: string): Promise<ValidationReportResponse> {
  return api.post<ValidationReportResponse>(`/api/pipeline2/validate/${planId}`, {});
}

export async function fetchLatestValidationReport(planId: string): Promise<ValidationReportResponse> {
  return api.get<ValidationReportResponse>(`/api/pipeline2/reports/${planId}`);
}

export async function fetchValidationReportById(reportId: string): Promise<ValidationReportResponse> {
  return api.get<ValidationReportResponse>(`/api/validation/${reportId}`);
}

export async function fetchValidationIssues(reportId: string): Promise<ValidationIssue[]> {
  return api.get<ValidationIssue[]>(`/api/validation/${reportId}/issues`);
}

export async function fetchValidationComparison(reportId: string): Promise<ValidationComparisonItem[]> {
  return api.get<ValidationComparisonItem[]>(`/api/validation/${reportId}/comparison`);
}

export async function fetchManualReviewQueue(): Promise<ManualReviewQueueItem[]> {
  return api.get<ManualReviewQueueItem[]>('/api/pipeline2/review-queue');
}
