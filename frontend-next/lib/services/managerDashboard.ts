import { api } from '../api';
import { JobRole } from '../../types';

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

export interface EmployeeProgressReportItem {
  employee_id: string;
  employee_name: string;
  email: string;
  department: string;
  role_code: string;
  role_title: string;
  plan_id?: string;
  plan_version: string;
  overall_progress_percentage: number;
  completed_modules: number;
  total_modules: number;
  completed_tasks: number;
  total_tasks: number;
  assessment_attempts: number;
  assessment_score_avg: number;
  current_status: string; // on_track, requires_attention, behind_schedule, assessment_required, completed
  last_activity_at?: string;
  weak_areas?: string[];
  outstanding_requirements?: string[];
}

export interface EmployeeProgressReportResponse {
  total: number;
  page: number;
  size: number;
  items: EmployeeProgressReportItem[];
}

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
  training_module_id?: string;
  training_module_title?: string;
  is_mandatory: boolean;
  completion_status: string;
  assessment_status: string;
  validation_status: string;
  human_review_status: string;
}

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
  completion_date?: string;
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
  status: string;
  detected_at: string;
}

export interface ReviewQueueItemResponse {
  review_id: string;
  plan_id: string;
  report_id: string;
  assigned_reviewer_id?: string;
  status: string;
  reason_for_review?: string;
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

export interface EmployeeResponseSchema {
  employee_id: string;
  employee_code: string;
  name: string;
  email: string;
  job_role_id: string;
  role_code: string;
  role_title: string;
  department: string;
  experience_level: string;
  location?: string;
  joining_date?: string;
  training_status: string;
  is_active: boolean;
  created_at: string;
}

export interface ManagerDashboardData {
  health: HealthCheckResponse | null;
  overview: ReportsOverviewResponse | null;
  progressReport: EmployeeProgressReportResponse | null;
  mandatoryTraining: MandatoryTrainingReportItem[];
  assessments: AssessmentReportSummary | null;
  policyUpdates: PolicyUpdateSummaryResponse[];
  reviewQueue: ReviewQueueItemResponse[];
  employees: EmployeeResponseSchema[];
  jobRoles: JobRole[];
  errors: Record<string, string>;
}

export async function fetchManagerDashboardData(filters?: {
  department?: string;
  roleCode?: string;
  status?: string;
  search?: string;
}): Promise<ManagerDashboardData> {
  const result: ManagerDashboardData = {
    health: null,
    overview: null,
    progressReport: null,
    mandatoryTraining: [],
    assessments: null,
    policyUpdates: [],
    reviewQueue: [],
    employees: [],
    jobRoles: [],
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

  // 3. Employee Progress Report (with optional department/role filters)
  try {
    const queryParams = new URLSearchParams();
    queryParams.set('page', '1');
    queryParams.set('size', '50');
    if (filters?.search) queryParams.set('search', filters.search);
    if (filters?.department) queryParams.set('department', filters.department);
    if (filters?.status) queryParams.set('status', filters.status);
    if (filters?.roleCode) queryParams.set('role_code', filters.roleCode);

    result.progressReport = await api.get<EmployeeProgressReportResponse>(
      `/api/reports/employee-progress?${queryParams.toString()}`
    );
  } catch (err: unknown) {
    result.errors.progressReport = err instanceof Error ? err.message : 'Employee progress API unavailable';
  }

  // 4. Mandatory Training Report
  try {
    const queryParams = new URLSearchParams();
    if (filters?.department) queryParams.set('department', filters.department);
    if (filters?.roleCode) queryParams.set('role_code', filters.roleCode);

    const queryStr = queryParams.toString();
    const endpoint = queryStr ? `/api/reports/mandatory-training?${queryStr}` : '/api/reports/mandatory-training';
    result.mandatoryTraining = await api.get<MandatoryTrainingReportItem[]>(endpoint);
  } catch (err: unknown) {
    result.errors.mandatoryTraining = err instanceof Error ? err.message : 'Mandatory training API unavailable';
  }

  // 5. Assessment Performance Summary
  try {
    const queryParams = new URLSearchParams();
    if (filters?.department) queryParams.set('department', filters.department);
    if (filters?.roleCode) queryParams.set('role_code', filters.roleCode);
    if (filters?.status) queryParams.set('status', filters.status);

    const queryStr = queryParams.toString();
    const endpoint = queryStr ? `/api/reports/assessments?${queryStr}` : '/api/reports/assessments';
    result.assessments = await api.get<AssessmentReportSummary>(endpoint);
  } catch (err: unknown) {
    result.errors.assessments = err instanceof Error ? err.message : 'Assessments API unavailable';
  }

  // 6. Policy Updates
  try {
    result.policyUpdates = await api.get<PolicyUpdateSummaryResponse[]>('/api/policy-updates');
  } catch (err: unknown) {
    result.errors.policyUpdates = err instanceof Error ? err.message : 'Policy updates API unavailable';
  }

  // 7. Human Review Queue
  try {
    result.reviewQueue = await api.get<ReviewQueueItemResponse[]>('/api/human-review/queue');
  } catch (err: unknown) {
    result.errors.reviewQueue = err instanceof Error ? err.message : 'Review queue API unavailable';
  }

  // 8. Employees List
  try {
    const endpoint = filters?.department
      ? `/api/employees?department=${encodeURIComponent(filters.department)}`
      : '/api/employees';
    result.employees = await api.get<EmployeeResponseSchema[]>(endpoint);
  } catch (err: unknown) {
    result.errors.employees = err instanceof Error ? err.message : 'Employees API unavailable';
  }

  // 9. Job Roles
  try {
    result.jobRoles = await api.get<JobRole[]>('/api/roles');
  } catch (err: unknown) {
    result.errors.jobRoles = err instanceof Error ? err.message : 'Job roles API unavailable';
  }

  return result;
}
