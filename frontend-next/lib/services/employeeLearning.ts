import { api } from '../api';

export interface ModuleProgressResponse {
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
  completion_status: string; // assigned, started, completed
  completion_percentage: number;
  assigned_at: string;
  started_at?: string | null;
  completed_at?: string | null;
  learning_objectives: string[];
  completion_criteria: string;
}

export interface ChecklistProgressResponse {
  checklist_id: string;
  activity_name: string;
  is_required: boolean;
  due_stage: string;
  responsible_person?: string | null;
  is_completed: boolean;
  completed_at?: string | null;
}

export interface TaskProgressResponse {
  task_id: string;
  task_code: string;
  description: string;
  expected_outcome: string;
  difficulty: string;
  due_stage: string;
  completion_criteria: string;
  status: string; // pending, in_progress, completed, requires_review
  started_at?: string | null;
  completed_at?: string | null;
  employee_notes?: string | null;
  evidence_link?: string | null;
}

export interface QuizOptionSchema {
  option_id: string;
  option_label: string;
  option_text: string;
}

export interface QuizDetailResponse {
  quiz_id: string;
  module_id: string;
  requirement_id?: string | null;
  question_code: string;
  question_text: string;
  question_type: string;
  options: QuizOptionSchema[];
  passing_score: number;
}

export interface QuizSubmissionRequest {
  selected_option_label: string;
}

export interface QuizResultResponse {
  attempt_id: string;
  quiz_id: string;
  score: number;
  passed: boolean;
  correct_answer: string;
  explanation: string;
  attempted_at: string;
}

export interface AssessmentResponse {
  assessment_id: string;
  module_id: string;
  requirement_id?: string | null;
  assessment_topic: string;
  score?: number | null;
  result: string; // passed, failed, requires_review
  reviewer_id?: string | null;
  feedback?: string | null;
  assessed_at: string;
}

export interface RecommendationResponse {
  recommendation_id: string;
  recommendation_type: string;
  recommended_action: string;
  reason: string;
  status: string;
  created_at: string;
}

export interface StageModuleItem {
  module_id: string;
  title: string;
  purpose?: string;
  is_mandatory: boolean;
  completion_status: string;
  completion_percentage: number;
}

export interface OnboardingStageItem {
  stage_id: string;
  stage_name: string;
  modules: StageModuleItem[];
}

export interface LearningPlanResponse {
  assignment_id: string;
  plan_id: string;
  assigned_at: string;
  overall_progress_percentage: number;
  overall_status: string;
  stages: OnboardingStageItem[];
}

export interface EmployeeProgressSummary {
  overall_progress_percentage: number;
  overall_status: string;
  total_modules: number;
  completed_modules: number;
  total_tasks: number;
  completed_tasks: number;
  checklist_progress_percentage: number;
  quiz_assessment_score: number;
}

export interface EmployeeLearningOverviewData {
  plan: LearningPlanResponse | null;
  modules: ModuleProgressResponse[];
  checklists: ChecklistProgressResponse[];
  tasks: TaskProgressResponse[];
  assessments: AssessmentResponse[];
  recommendations: RecommendationResponse[];
  progressSummary: EmployeeProgressSummary | null;
  errors: Record<string, string>;
}

// Service API Methods
export async function getEmployeeLearningPlan(): Promise<LearningPlanResponse | null> {
  try {
    return await api.get<LearningPlanResponse>('/api/employee/me/plan');
  } catch {
    return null;
  }
}

export async function getAssignedModules(): Promise<ModuleProgressResponse[]> {
  try {
    return await api.get<ModuleProgressResponse[]>('/api/employee/me/modules');
  } catch {
    return [];
  }
}

export async function getModuleDetail(moduleId: string): Promise<ModuleProgressResponse | null> {
  try {
    return await api.get<ModuleProgressResponse>(`/api/employee/me/modules/${moduleId}`);
  } catch {
    return null;
  }
}

export async function startModule(moduleId: string): Promise<{ message: string; module_id: string; status: string }> {
  return await api.post(`/api/employee/me/modules/${moduleId}/start`, {});
}

export async function completeModule(moduleId: string): Promise<{ message: string; module_id: string; status: string }> {
  return await api.post(`/api/employee/me/modules/${moduleId}/complete`, {});
}

export async function getChecklists(): Promise<ChecklistProgressResponse[]> {
  try {
    return await api.get<ChecklistProgressResponse[]>('/api/employee/me/checklists');
  } catch {
    return [];
  }
}

export async function completeChecklist(checklistId: string): Promise<{ message: string; checklist_id: string; is_completed: boolean }> {
  return await api.post(`/api/employee/me/checklists/${checklistId}/complete`, {});
}

export async function getPracticalTasks(): Promise<TaskProgressResponse[]> {
  try {
    return await api.get<TaskProgressResponse[]>('/api/employee/me/tasks');
  } catch {
    return [];
  }
}

export async function completePracticalTask(
  taskId: string,
  notes?: string,
  evidenceLink?: string
): Promise<{ message: string; task_id: string; status: string }> {
  const queryParams = new URLSearchParams();
  if (notes) queryParams.append('notes', notes);
  if (evidenceLink) queryParams.append('evidence_link', evidenceLink);
  const queryStr = queryParams.toString() ? `?${queryParams.toString()}` : '';

  return await api.post(`/api/employee/me/tasks/${taskId}/complete${queryStr}`, {});
}

export async function getQuizDetail(quizId: string): Promise<QuizDetailResponse> {
  return await api.get<QuizDetailResponse>(`/api/employee/me/quizzes/${quizId}`);
}

export async function submitQuizAnswer(
  quizId: string,
  selectedOptionLabel: string
): Promise<QuizResultResponse> {
  return await api.post<QuizResultResponse>(`/api/employee/me/quizzes/${quizId}/submit`, {
    selected_option_label: selectedOptionLabel,
  });
}

export async function getAssessments(): Promise<AssessmentResponse[]> {
  try {
    return await api.get<AssessmentResponse[]>('/api/employee/me/assessments');
  } catch {
    return [];
  }
}

export async function getRecommendations(): Promise<RecommendationResponse[]> {
  try {
    return await api.get<RecommendationResponse[]>('/api/employee/me/recommendations');
  } catch {
    return [];
  }
}

export async function getProgressSummary(): Promise<EmployeeProgressSummary | null> {
  try {
    return await api.get<EmployeeProgressSummary>('/api/employee/me/progress');
  } catch {
    return null;
  }
}

export async function fetchEmployeeLearningOverview(): Promise<EmployeeLearningOverviewData> {
  const errors: Record<string, string> = {};

  const [planRes, modulesRes, checklistsRes, tasksRes, assessmentsRes, recsRes, summaryRes] =
    await Promise.allSettled([
      getEmployeeLearningPlan(),
      getAssignedModules(),
      getChecklists(),
      getPracticalTasks(),
      getAssessments(),
      getRecommendations(),
      getProgressSummary(),
    ]);

  const plan = planRes.status === 'fulfilled' ? planRes.value : null;
  if (planRes.status === 'rejected') errors.plan = 'Failed to load onboarding plan';

  const modules = modulesRes.status === 'fulfilled' ? modulesRes.value : [];
  if (modulesRes.status === 'rejected') errors.modules = 'Failed to load assigned modules';

  const checklists = checklistsRes.status === 'fulfilled' ? checklistsRes.value : [];
  if (checklistsRes.status === 'rejected') errors.checklists = 'Failed to load checklist items';

  const tasks = tasksRes.status === 'fulfilled' ? tasksRes.value : [];
  if (tasksRes.status === 'rejected') errors.tasks = 'Failed to load practical tasks';

  const assessments = assessmentsRes.status === 'fulfilled' ? assessmentsRes.value : [];
  if (assessmentsRes.status === 'rejected') errors.assessments = 'Failed to load assessment history';

  const recommendations = recsRes.status === 'fulfilled' ? recsRes.value : [];
  if (recsRes.status === 'rejected') errors.recommendations = 'Failed to load recommendations';

  const progressSummary = summaryRes.status === 'fulfilled' ? summaryRes.value : null;
  if (summaryRes.status === 'rejected') errors.progressSummary = 'Failed to load progress metrics';

  return {
    plan,
    modules,
    checklists,
    tasks,
    assessments,
    recommendations,
    progressSummary,
    errors,
  };
}
