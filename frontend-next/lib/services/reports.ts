import { api } from '../api';

// 1. Overview Metrics Interface
export interface OverviewMetricsResponse {
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

// 2. Employee Progress Report Interface
export interface EmployeeProgressReportItem {
  employee_id: string;
  employee_name: string;
  email: string;
  department: string;
  role_code: string;
  role_title: string;
  plan_id?: string | null;
  plan_version: string;
  overall_progress_percentage: number;
  completed_modules: number;
  total_modules: number;
  completed_tasks: number;
  total_tasks: number;
  assessment_attempts: number;
  assessment_score_avg: number;
  current_status: string; // on_track, requires_attention, behind_schedule, assessment_required, completed
  last_activity_at?: string | null;
  weak_areas?: string[];
  outstanding_requirements?: string[];
}

export interface EmployeeProgressReportResponse {
  total: number;
  page: number;
  size: number;
  items: EmployeeProgressReportItem[];
}

// 3. Role Coverage Report Interface
export interface RoleCoverageReportItem {
  role_code: string;
  role_title: string;
  department: string;
  total_rrm_requirements: number;
  mandatory_requirements: number;
  optional_requirements: number;
  covered_requirements: number;
  missing_requirements: number;
  verified_requirements: number;
  validation_failures: number;
  coverage_percentage: number;
  current_plan_version: string;
  outdated_status: string;
}

// 4. Mandatory Training Report Interface
export interface MandatoryTrainingReportItem {
  requirement_id: string;
  requirement_title: string;
  role_code: string;
  role_title: string;
  employee_name: string;
  department: string;
  source_document_id: string;
  source_document_version: number;
  source_section_id: string;
  training_module_id?: string | null;
  training_module_title?: string | null;
  is_mandatory: boolean;
  completion_status: string;
  assessment_status: string;
  validation_status: string;
  human_review_status: string;
}

// 5. Assessment Report Interface
export interface AssessmentReportItem {
  employee_id: string;
  employee_name: string;
  role_title: string;
  module_title: string;
  assessment_topic: string;
  attempts_count: number;
  best_score: number;
  latest_score: number;
  pass_fail_result: string; // passed, failed, requires_review
  passing_threshold: number;
  completion_date?: string | null;
  weak_areas?: string[];
}

export interface AssessmentReportSummary {
  total_assessments: number;
  completed_assessments: number;
  passed_assessments: number;
  failed_assessments: number;
  average_score: number;
  pass_rate_percentage: number;
  employees_requiring_reassessment_count: number;
  items: AssessmentReportItem[];
}

// 6. Source Traceability Report Interface
export interface TraceabilityReportItem {
  source_document_id: string;
  source_document_title: string;
  source_document_version: number;
  page_number?: number | null;
  section_id: string;
  paragraph_reference?: string | null;
  chunk_id: string;
  requirement_id: string;
  role_code: string;
  module_id: string;
  module_title: string;
  plan_id: string;
  validation_status: string;
  human_review_status: string;
}

// 7. Hallucination / Unsupported Content Report Interface
export interface HallucinationReportItem {
  plan_id: string;
  employee_name: string;
  role_title: string;
  module_id?: string | null;
  module_title?: string | null;
  requirement_id?: string | null;
  validation_status: string;
  flag_type: string; // hallucination, contradiction, missing_traceability, unsupported
  flagged_statement: string;
  reason: string;
  severity: string; // critical, high, medium, low
  review_status: string; // pending, resolved, overridden
  human_decision?: string | null;
}

// 8. Policy Coverage Report Interface
export interface PolicyCoverageReportItem {
  document_id: string;
  document_title: string;
  policy_version: number;
  effective_date: string;
  affected_roles_count: number;
  affected_requirements_count: number;
  affected_modules_count: number;
  affected_employees_count: number;
  affected_plans_count: number;
  current_coverage_percentage: number;
  outdated_plans_count: number;
  regeneration_status: string;
  revalidation_status: string;
  version_status: string; // current, outdated, regeneration_pending, revalidated, approved
}

// 9. GenAI vs Python Comparison Report Interface
export interface GenAIPythonComparisonItem {
  plan_id: string;
  module_id: string;
  requirement_id: string;
  genai_classification: string;
  python_classification: string;
  genai_priority: string;
  python_priority: string;
  genai_due_stage: string;
  python_due_stage: string;
  traceability_match: boolean;
  mandatory_coverage_match: boolean;
  role_relevance_match: boolean;
  overall_match: boolean;
  validation_status: string;
  final_human_decision: string;
}

export interface GenAIPythonComparisonSummary {
  total_comparisons: number;
  agreements_count: number;
  disagreements_count: number;
  agreement_percentage: number;
  validation_failures_count: number;
  human_overrides_count: number;
  items: GenAIPythonComparisonItem[];
}

// Query Filter Interfaces
export interface ReportFilterParams {
  search?: string;
  department?: string;
  role_code?: string;
  status?: string;
  document_id?: string;
  requirement_id?: string;
  flag_type?: string;
  severity?: string;
  review_status?: string;
  plan_id?: string;
  page?: number;
  size?: number;
  sort_by?: string;
  order?: string;
}

// Service API Methods
export async function getOverview(): Promise<OverviewMetricsResponse> {
  return await api.get<OverviewMetricsResponse>('/api/reports/overview');
}

export async function getEmployeeProgress(
  filters?: ReportFilterParams
): Promise<EmployeeProgressReportResponse> {
  const queryParams = new URLSearchParams();
  if (filters?.search) queryParams.append('search', filters.search);
  if (filters?.department) queryParams.append('department', filters.department);
  if (filters?.role_code) queryParams.append('role_code', filters.role_code);
  if (filters?.status) queryParams.append('status', filters.status);
  if (filters?.sort_by) queryParams.append('sort_by', filters.sort_by);
  if (filters?.order) queryParams.append('order', filters.order);
  if (filters?.page) queryParams.append('page', filters.page.toString());
  if (filters?.size) queryParams.append('size', filters.size.toString());

  const queryStr = queryParams.toString() ? `?${queryParams.toString()}` : '';
  return await api.get<EmployeeProgressReportResponse>(`/api/reports/employee-progress${queryStr}`);
}

export async function getRoleCoverage(
  filters?: ReportFilterParams
): Promise<RoleCoverageReportItem[]> {
  const queryParams = new URLSearchParams();
  if (filters?.department) queryParams.append('department', filters.department);
  if (filters?.role_code) queryParams.append('role_code', filters.role_code);

  const queryStr = queryParams.toString() ? `?${queryParams.toString()}` : '';
  return await api.get<RoleCoverageReportItem[]>(`/api/reports/role-coverage${queryStr}`);
}

export async function getMandatoryTraining(
  filters?: ReportFilterParams
): Promise<MandatoryTrainingReportItem[]> {
  const queryParams = new URLSearchParams();
  if (filters?.department) queryParams.append('department', filters.department);
  if (filters?.role_code) queryParams.append('role_code', filters.role_code);

  const queryStr = queryParams.toString() ? `?${queryParams.toString()}` : '';
  return await api.get<MandatoryTrainingReportItem[]>(`/api/reports/mandatory-training${queryStr}`);
}

export async function getAssessments(
  filters?: ReportFilterParams
): Promise<AssessmentReportSummary> {
  const queryParams = new URLSearchParams();
  if (filters?.department) queryParams.append('department', filters.department);
  if (filters?.role_code) queryParams.append('role_code', filters.role_code);
  if (filters?.status) queryParams.append('status', filters.status);

  const queryStr = queryParams.toString() ? `?${queryParams.toString()}` : '';
  return await api.get<AssessmentReportSummary>(`/api/reports/assessments${queryStr}`);
}

export async function getTraceability(
  filters?: ReportFilterParams
): Promise<TraceabilityReportItem[]> {
  const queryParams = new URLSearchParams();
  if (filters?.document_id) queryParams.append('document_id', filters.document_id);
  if (filters?.role_code) queryParams.append('role_code', filters.role_code);
  if (filters?.requirement_id) queryParams.append('requirement_id', filters.requirement_id);

  const queryStr = queryParams.toString() ? `?${queryParams.toString()}` : '';
  return await api.get<TraceabilityReportItem[]>(`/api/reports/traceability${queryStr}`);
}

export async function getHallucinations(
  filters?: ReportFilterParams
): Promise<HallucinationReportItem[]> {
  const queryParams = new URLSearchParams();
  if (filters?.flag_type) queryParams.append('flag_type', filters.flag_type);
  if (filters?.severity) queryParams.append('severity', filters.severity);
  if (filters?.review_status) queryParams.append('review_status', filters.review_status);

  const queryStr = queryParams.toString() ? `?${queryParams.toString()}` : '';
  return await api.get<HallucinationReportItem[]>(`/api/reports/hallucinations${queryStr}`);
}

export async function getPolicyCoverage(
  filters?: ReportFilterParams
): Promise<PolicyCoverageReportItem[]> {
  const queryParams = new URLSearchParams();
  if (filters?.document_id) queryParams.append('document_id', filters.document_id);

  const queryStr = queryParams.toString() ? `?${queryParams.toString()}` : '';
  return await api.get<PolicyCoverageReportItem[]>(`/api/reports/policy-coverage${queryStr}`);
}

export async function getGenAIVsPython(
  filters?: ReportFilterParams
): Promise<GenAIPythonComparisonSummary> {
  const queryParams = new URLSearchParams();
  if (filters?.plan_id) queryParams.append('plan_id', filters.plan_id);

  const queryStr = queryParams.toString() ? `?${queryParams.toString()}` : '';
  return await api.get<GenAIPythonComparisonSummary>(`/api/reports/genai-vs-python${queryStr}`);
}

export async function exportReportFile(
  reportType: string = 'employee_progress',
  exportFormat: string = 'csv',
  filters?: ReportFilterParams
): Promise<void> {
  const queryParams = new URLSearchParams();
  queryParams.append('report_type', reportType);
  queryParams.append('export_format', exportFormat);
  if (filters?.search) queryParams.append('search', filters.search);
  if (filters?.department) queryParams.append('department', filters.department);
  if (filters?.role_code) queryParams.append('role_code', filters.role_code);
  if (filters?.status) queryParams.append('status', filters.status);

  const endpoint = `/api/reports/export?${queryParams.toString()}`;
  
  // Use direct window.open or fetch blob download
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const fullUrl = `${API_BASE_URL}${endpoint}`;
  
  const link = document.createElement('a');
  link.href = fullUrl;
  link.setAttribute('download', `report_${reportType}_${Date.now()}.${exportFormat === 'excel' ? 'xlsx' : exportFormat}`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
