import { api } from '../api';
import { CompanyDocument, JobRole, HumanReviewQueueItem, PolicyUpdate } from '../../types';

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
  average_progress_percentage: float;
  pending_reviews: int;
  validation_failures: int;
  outdated_plans: int;
  policy_changes_count: int;
  assessment_completion_rate: float;
}

type float = number;
type int = number;

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

export interface TrainingDashboardData {
  health: HealthCheckResponse | null;
  overview: ReportsOverviewResponse | null;
  progressReport: EmployeeProgressReportResponse | null;
  mandatoryTraining: MandatoryTrainingReportItem[];
  assessments: AssessmentReportSummary | null;
  policyUpdates: PolicyUpdate[];
  reviewQueue: HumanReviewQueueItem[];
  documents: CompanyDocument[];
  jobRoles: JobRole[];
  errors: Record<string, string>;
}

export async function fetchTrainingDashboardData(filters?: {
  search?: string;
  department?: string;
  status?: string;
  roleCode?: string;
}): Promise<TrainingDashboardData> {
  const result: TrainingDashboardData = {
    health: null,
    overview: null,
    progressReport: null,
    mandatoryTraining: [],
    assessments: null,
    policyUpdates: [],
    reviewQueue: [],
    documents: [],
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

  // 3. Employee Progress Report (with optional query filters)
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
    result.mandatoryTraining = await api.get<MandatoryTrainingReportItem[]>('/api/reports/mandatory-training');
  } catch (err: unknown) {
    result.errors.mandatoryTraining = err instanceof Error ? err.message : 'Mandatory training API unavailable';
  }

  // 5. Assessment Performance Summary
  try {
    result.assessments = await api.get<AssessmentReportSummary>('/api/reports/assessments');
  } catch (err: unknown) {
    result.errors.assessments = err instanceof Error ? err.message : 'Assessments API unavailable';
  }

  // 6. Policy Updates
  try {
    result.policyUpdates = await api.get<PolicyUpdate[]>('/api/policy-updates');
  } catch (err: unknown) {
    result.errors.policyUpdates = err instanceof Error ? err.message : 'Policy updates API unavailable';
  }

  // 7. Human Review Queue
  try {
    result.reviewQueue = await api.get<HumanReviewQueueItem[]>('/api/human-review/queue');
  } catch (err: unknown) {
    result.errors.reviewQueue = err instanceof Error ? err.message : 'Review queue API unavailable';
  }

  // 8. Documents
  try {
    result.documents = await api.get<CompanyDocument[]>('/api/documents');
  } catch (err: unknown) {
    result.errors.documents = err instanceof Error ? err.message : 'Documents API unavailable';
  }

  // 9. Job Roles
  try {
    result.jobRoles = await api.get<JobRole[]>('/api/roles');
  } catch (err: unknown) {
    result.errors.jobRoles = err instanceof Error ? err.message : 'Job roles API unavailable';
  }

  return result;
}
