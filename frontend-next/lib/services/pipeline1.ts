import { api } from '../api';

export interface Pipeline1GenerationRequest {
  employee_id: string;
  role_id?: string;
  role_identifier?: string;
  model_name?: string;
  prompt_version?: string;
}

export interface EmployeeItem {
  employee_id: string;
  employee_code: string;
  name: string;
  email: string;
  job_role_id: string;
  role_code: string;
  role_title: string;
  department: string;
}

export async function fetchEmployees(): Promise<EmployeeItem[]> {
  return api.get<EmployeeItem[]>('/api/employees');
}

export interface QuizQuestionData {
  question_id: string;
  question_text: string;
  correct_answer: string;
  explanation: string;
  source_document_id: string;
  source_section_id: string;
}

export interface TaskData {
  task_id: string;
  description: string;
  expected_outcome: string;
  source_document_id: string;
  source_section_id: string;
}

export interface ModuleData {
  module_id: string;
  module_code: string;
  title: string;
  purpose?: string | null;
  requirement_id: string;
  is_mandatory: boolean;
  source_document_id: string;
  source_section_id: string;
  difficulty: string;
  objectives: string[];
  tasks: TaskData[];
  quizzes: QuizQuestionData[];
}

export interface StageData {
  stage_id: string;
  stage_name: string;
  stage_order: number;
  modules: ModuleData[];
}

export interface Pipeline1PlanDetails {
  plan_id: string;
  employee_id: string;
  employee_name: string;
  job_role_id: string;
  role_code: string;
  role_title: string;
  prompt_version: string;
  genai_model: string;
  verification_status: string;
  created_at: string;
  stages: StageData[];
}

export interface Pipeline1GenerationResult {
  message: string;
  plan_id: string;
  employee_id: string;
  role_id: string;
  genai_model: string;
  prompt_version: string;
  verification_status: string;
  execution_id: string;
  structured_json_output: Record<string, unknown>;
}

export interface SourceCitationItem {
  module_code: string;
  module_title: string;
  requirement_id: string;
  source_document_id: string;
  source_document_title: string;
  source_document_version: number;
  source_section_id: string;
  is_mandatory: boolean;
}

export interface Pipeline1PlanSources {
  plan_id: string;
  total_sources_cited: number;
  source_citations: SourceCitationItem[];
}

export interface Pipeline1ExecutionRun {
  execution_id: string;
  employee_id: string;
  model_name: string;
  prompt_version: string;
  schema_validation_passed: boolean;
  retry_count: number;
  latency_ms: number;
  executed_at: string;
  error_log?: string | null;
  parsed_json_output?: Record<string, unknown>;
}

export async function generateOnboardingPlan(
  req: Pipeline1GenerationRequest
): Promise<Pipeline1GenerationResult> {
  return api.post<Pipeline1GenerationResult>('/api/pipeline1/generate', req);
}

export async function fetchPlanDetails(planId: string): Promise<Pipeline1PlanDetails> {
  return api.get<Pipeline1PlanDetails>(`/api/pipeline1/plan/${planId}`);
}

export async function fetchPlanRawJson(planId: string): Promise<Record<string, unknown>> {
  return api.get<Record<string, unknown>>(`/api/pipeline1/plan/${planId}/json`);
}

export async function fetchPlanSources(planId: string): Promise<Pipeline1PlanSources> {
  return api.get<Pipeline1PlanSources>(`/api/pipeline1/plan/${planId}/sources`);
}

export async function fetchExecutionRun(executionId: string): Promise<Pipeline1ExecutionRun> {
  return api.get<Pipeline1ExecutionRun>(`/api/pipeline1/runs/${executionId}`);
}

export interface Pipeline2ValidationHandoffResult {
  report_id?: string;
  verification_status?: string;
  mandatory_coverage_score?: number;
  source_traceability_score?: number;
  unsupported_requirements_count?: number;
  contradiction_count?: number;
}

export async function submitToPipeline2Validation(planId: string): Promise<Pipeline2ValidationHandoffResult> {
  return api.post<Pipeline2ValidationHandoffResult>(`/api/pipeline2/validate/${planId}`, {});
}
