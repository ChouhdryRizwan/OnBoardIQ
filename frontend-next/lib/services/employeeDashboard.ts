import { api } from '../api';

export interface HealthCheckResponse {
  status: string;
  service: string;
  version: string;
  database: string;
}

export interface UpcomingActivityItem {
  activity_id: string;
  activity_type: string;
  title: string;
  due_stage: string;
  is_mandatory: boolean;
}

export interface MilestoneItem {
  milestone_id: string;
  stage_name: string;
  title: string;
  target_completion_days: number;
  is_reached: boolean;
  reached_at?: string | null;
}

export interface RecommendationItem {
  recommendation_id: string;
  recommendation_type: string;
  recommended_action: string;
  reason: string;
  status: string;
  created_at: string;
}

export interface BackendEmployeeDashboardResponse {
  employee_id: string;
  employee_name: string;
  role_code: string;
  role_title: string;
  department: string;
  overall_progress_percentage: number;
  overall_status: string;
  current_stage: string;
  current_module_id?: string | null;
  current_module_title?: string | null;
  assigned_modules_count: number;
  completed_modules_count: number;
  pending_modules_count: number;
  completed_tasks_count: number;
  total_tasks_count: number;
  checklist_completion_percentage: number;
  quiz_assessment_score: number;
  upcoming_activities: UpcomingActivityItem[];
  milestones: MilestoneItem[];
  recommendations: RecommendationItem[];
}

export interface ModuleProgressItem {
  module_id: string;
  module_code: string;
  title: string;
  purpose: string;
  requirement_id?: string;
  is_mandatory: boolean;
  source_document_id?: string;
  source_section_id?: string;
  estimated_duration_minutes: number;
  difficulty: string;
  completion_status: string; // assigned, started, in_progress, completed
  completion_percentage: number;
  assigned_at?: string;
  started_at?: string | null;
  completed_at?: string | null;
  learning_objectives?: string[];
  completion_criteria?: string;
}

export interface LearningPlanStageModule {
  module_id: string;
  title: string;
  purpose?: string;
  is_mandatory: boolean;
  completion_status: string;
  completion_percentage: number;
}

export interface LearningPlanStage {
  stage_id: string;
  stage_name: string;
  modules: LearningPlanStageModule[];
}

export interface BackendLearningPlanResponse {
  assignment_id: string;
  plan_id: string;
  assigned_at: string;
  overall_progress_percentage: number;
  overall_status: string;
  stages: LearningPlanStage[];
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
  pass_fail_result: string;
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

export interface EmployeeDashboardData {
  health: HealthCheckResponse | null;
  dashboard: BackendEmployeeDashboardResponse | null;
  learningPlan: BackendLearningPlanResponse | null;
  modules: ModuleProgressItem[];
  mandatoryTraining: MandatoryTrainingReportItem[];
  assessments: AssessmentReportSummary | null;
  policyUpdates: PolicyUpdateSummaryResponse[];
  errors: Record<string, string>;
}

export async function fetchEmployeeDashboardData(): Promise<EmployeeDashboardData> {
  const result: EmployeeDashboardData = {
    health: null,
    dashboard: null,
    learningPlan: null,
    modules: [],
    mandatoryTraining: [],
    assessments: null,
    policyUpdates: [],
    errors: {},
  };

  // 1. Health
  try {
    result.health = await api.get<HealthCheckResponse>('/health');
  } catch (err: unknown) {
    result.errors.health = err instanceof Error ? err.message : 'Health API unavailable';
  }

  // 2. Employee Personal Dashboard Overview (/api/employee/me/dashboard or /api/employee/dashboard)
  try {
    result.dashboard = await api.get<BackendEmployeeDashboardResponse>('/api/employee/me/dashboard');
  } catch {
    try {
      result.dashboard = await api.get<BackendEmployeeDashboardResponse>('/api/employee/dashboard');
    } catch (innerErr: unknown) {
      result.errors.dashboard = innerErr instanceof Error ? innerErr.message : 'Employee dashboard API unavailable';
    }
  }

  // 3. Active Employee Learning Plan (/api/employee/me/plan)
  try {
    result.learningPlan = await api.get<BackendLearningPlanResponse>('/api/employee/me/plan');
  } catch (err: unknown) {
    result.errors.learningPlan = err instanceof Error ? err.message : 'Learning plan API unavailable';
  }

  // 4. Assigned Modules List (/api/employee/me/modules)
  try {
    result.modules = await api.get<ModuleProgressItem[]>('/api/employee/me/modules');
  } catch (err: unknown) {
    result.errors.modules = err instanceof Error ? err.message : 'Modules API unavailable';
  }

  // 5. Mandatory Compliance Training (/api/reports/mandatory-training)
  try {
    result.mandatoryTraining = await api.get<MandatoryTrainingReportItem[]>('/api/reports/mandatory-training');
  } catch (err: unknown) {
    result.errors.mandatoryTraining = err instanceof Error ? err.message : 'Mandatory training API unavailable';
  }

  // 6. Assessments Summary (/api/reports/assessments)
  try {
    result.assessments = await api.get<AssessmentReportSummary>('/api/reports/assessments');
  } catch (err: unknown) {
    result.errors.assessments = err instanceof Error ? err.message : 'Assessments API unavailable';
  }

  // 7. Policy Updates (/api/policy-updates)
  try {
    result.policyUpdates = await api.get<PolicyUpdateSummaryResponse[]>('/api/policy-updates');
  } catch (err: unknown) {
    result.errors.policyUpdates = err instanceof Error ? err.message : 'Policy updates API unavailable';
  }

  return result;
}
