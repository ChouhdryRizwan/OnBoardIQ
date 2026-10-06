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
  active_employees?: number;
  total_roles?: number;
  total_requirements?: number;
  mandatory_requirements?: number;
  active_training_plans: number;
  active_onboarding_plans?: number;
  completed_plans: number;
  completed_onboarding_plans?: number;
  average_progress_percentage: number;
  avg_mandatory_coverage_pct?: number;
  avg_source_traceability_pct?: number;
  pending_reviews: number;
  pending_human_reviews_count?: number;
  validation_failures?: number;
  outdated_plans?: number;
  policy_changes_count: number;
  detected_policy_updates_count?: number;
  assessment_completion_rate?: number;
}

export interface EmployeeDirectoryItem {
  employee_id: string;
  employee_code: string;
  name: string;
  email: string;
  job_role_id?: string;
  role_code?: string;
  role_title?: string;
  department: string;
  experience_level?: string;
  location?: string;
  training_status: string;
  is_active: boolean;
  created_at?: string;
}

export interface RRMSummaryResponse {
  total_roles?: number;
  total_job_roles?: number;
  total_requirements?: number;
  mandatory_requirements: number;
  total_mandatory_requirements?: number;
  optional_requirements?: number;
  total_documents_linked?: number;
  roles_with_complete_matrix?: number;
  circular_dependencies_detected?: number;
}

export interface AdminDashboardData {
  health: HealthCheckResponse | null;
  overview: ReportsOverviewResponse | null;
  employees: EmployeeDirectoryItem[];
  documents: CompanyDocument[];
  jobRoles: JobRole[];
  rrmSummary: RRMSummaryResponse | null;
  reviewQueue: HumanReviewQueueItem[];
  policyUpdates: PolicyUpdate[];
  errors: Record<string, string>;
}

export async function fetchAdminDashboardData(): Promise<AdminDashboardData> {
  const result: AdminDashboardData = {
    health: null,
    overview: null,
    employees: [],
    documents: [],
    jobRoles: [],
    rrmSummary: null,
    reviewQueue: [],
    policyUpdates: [],
    errors: {},
  };

  // 1. Health check
  try {
    result.health = await api.get<HealthCheckResponse>('/health');
  } catch (err: unknown) {
    result.errors.health = err instanceof Error ? err.message : 'Health check unavailable';
  }

  // 2. Reports overview metrics
  try {
    result.overview = await api.get<ReportsOverviewResponse>('/api/reports/overview');
  } catch (err: unknown) {
    result.errors.overview = err instanceof Error ? err.message : 'Reports overview unavailable';
  }

  // 3. Employee Directory
  try {
    result.employees = await api.get<EmployeeDirectoryItem[]>('/api/employees');
  } catch (err: unknown) {
    result.errors.employees = err instanceof Error ? err.message : 'Employee directory unavailable';
  }

  // 4. Company Documents
  try {
    result.documents = await api.get<CompanyDocument[]>('/api/documents');
  } catch (err: unknown) {
    result.errors.documents = err instanceof Error ? err.message : 'Documents repository unavailable';
  }

  // 5. Job Roles
  try {
    result.jobRoles = await api.get<JobRole[]>('/api/roles');
  } catch (err: unknown) {
    result.errors.jobRoles = err instanceof Error ? err.message : 'Job roles unavailable';
  }

  // 6. RRM Summary
  try {
    result.rrmSummary = await api.get<RRMSummaryResponse>('/api/matrix/summary');
  } catch (err: unknown) {
    result.errors.rrmSummary = err instanceof Error ? err.message : 'RRM summary unavailable';
  }

  // 7. Human Review Queue
  try {
    result.reviewQueue = await api.get<HumanReviewQueueItem[]>('/api/human-review/queue');
  } catch (err: unknown) {
    result.errors.reviewQueue = err instanceof Error ? err.message : 'Review queue unavailable';
  }

  // 8. Policy Updates
  try {
    result.policyUpdates = await api.get<PolicyUpdate[]>('/api/policy-updates');
  } catch (err: unknown) {
    result.errors.policyUpdates = err instanceof Error ? err.message : 'Policy updates unavailable';
  }

  return result;
}
