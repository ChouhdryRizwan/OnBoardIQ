import { api } from '../api';

export interface JobRoleResponseSchema {
  role_id: string;
  role_code: string;
  title: string;
  department: string;
  description?: string | null;
  required_experience_level: string;
  is_active: boolean;
  created_at: string;
}

export interface JobRoleCreateSchema {
  role_code: string;
  title: string;
  department: string;
  description?: string;
  required_experience_level?: string;
}

export interface JobRoleUpdateSchema {
  title?: string;
  department?: string;
  description?: string;
  required_experience_level?: string;
  is_active?: boolean;
}

export interface MatrixRequirementResponseSchema {
  requirement_id: string;
  job_role_id: string;
  role_code: string;
  role_title: string;
  title?: string | null;
  description?: string | null;
  department?: string | null;
  policy_requirement: string;
  process_requirement?: string | null;
  required_competency: string;
  is_mandatory: boolean;
  requirement_type: string;
  priority: string;
  due_stage: string;
  source_document_id: string;
  source_document_version: number;
  source_section_id: string;
  source_location?: string | null;
  prerequisite_requirement_ids?: string[];
  required_task_description?: string | null;
  required_assessment_topic?: string | null;
  is_active: boolean;
  created_at: string;
}

export interface MatrixRequirementCreateSchema {
  requirement_id: string;
  role_identifier: string;
  title?: string;
  description?: string;
  department?: string;
  policy_requirement: string;
  process_requirement?: string;
  required_competency: string;
  is_mandatory?: boolean;
  requirement_type?: string;
  priority?: string;
  due_stage?: string;
  source_document_id: string;
  source_document_version?: number;
  source_section_id: string;
  source_location?: string;
  prerequisite_requirement_ids?: string[];
  required_task_description?: string;
  required_assessment_topic?: string;
}

export interface MatrixRequirementUpdateSchema {
  title?: string;
  description?: string;
  department?: string;
  policy_requirement?: string;
  process_requirement?: string;
  required_competency?: string;
  is_mandatory?: boolean;
  requirement_type?: string;
  priority?: string;
  due_stage?: string;
  source_document_id?: string;
  source_document_version?: number;
  source_section_id?: string;
  source_location?: string;
  prerequisite_requirement_ids?: string[];
  required_task_description?: string;
  required_assessment_topic?: string;
  is_active?: boolean;
}

export interface MatrixValidationIssue {
  type?: string;
  requirement_id?: string;
  detail?: string;
  message?: string;
}

export interface MatrixValidationResponseSchema {
  role_code: string;
  role_title: string;
  total_requirements: number;
  mandatory_requirements: number;
  valid_ground_truth_references: number;
  is_matrix_valid: boolean;
  issues: MatrixValidationIssue[];
}

export interface RRMSummaryResponseSchema {
  total_roles: number;
  total_requirements: number;
  mandatory_requirements: number;
  optional_requirements: number;
  requirements_by_priority: Record<string, number>;
  requirements_by_classification: Record<string, number>;
  requirements_by_department: Record<string, number>;
}

export interface RequirementFilterParams {
  role_id?: string;
  department?: string;
  is_mandatory?: boolean;
  classification?: string;
  priority?: string;
  source_document_id?: string;
  status_filter?: boolean;
}

// Service Functions
export async function fetchRoles(): Promise<JobRoleResponseSchema[]> {
  return api.get<JobRoleResponseSchema[]>('/api/roles');
}

export async function createRole(data: JobRoleCreateSchema): Promise<JobRoleResponseSchema> {
  return api.post<JobRoleResponseSchema>('/api/roles', data);
}

export async function getRole(roleIdentifier: string): Promise<JobRoleResponseSchema> {
  return api.get<JobRoleResponseSchema>(`/api/roles/${roleIdentifier}`);
}

export async function updateRole(roleIdentifier: string, data: JobRoleUpdateSchema): Promise<JobRoleResponseSchema> {
  return api.put<JobRoleResponseSchema>(`/api/roles/${roleIdentifier}`, data);
}

export async function deleteRole(roleIdentifier: string): Promise<{ message: string }> {
  return api.delete<{ message: string }>(`/api/roles/${roleIdentifier}`);
}

export async function fetchRoleRequirements(roleIdentifier: string): Promise<MatrixRequirementResponseSchema[]> {
  return api.get<MatrixRequirementResponseSchema[]>(`/api/roles/${roleIdentifier}/requirements`);
}

export async function fetchRrmSummary(): Promise<RRMSummaryResponseSchema> {
  return api.get<RRMSummaryResponseSchema>('/api/matrix/summary');
}

export async function fetchRequirements(params?: RequirementFilterParams): Promise<MatrixRequirementResponseSchema[]> {
  const queryParams = new URLSearchParams();
  if (params?.role_id) queryParams.append('role_id', params.role_id);
  if (params?.department) queryParams.append('department', params.department);
  if (params?.is_mandatory !== undefined) queryParams.append('is_mandatory', String(params.is_mandatory));
  if (params?.classification) queryParams.append('classification', params.classification);
  if (params?.priority) queryParams.append('priority', params.priority);
  if (params?.source_document_id) queryParams.append('source_document_id', params.source_document_id);
  if (params?.status_filter !== undefined) queryParams.append('status_filter', String(params.status_filter));

  const url = `/api/matrix/requirements${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return api.get<MatrixRequirementResponseSchema[]>(url);
}

export async function createRequirement(data: MatrixRequirementCreateSchema): Promise<MatrixRequirementResponseSchema> {
  return api.post<MatrixRequirementResponseSchema>('/api/matrix/requirements', data);
}

export async function updateRequirement(
  reqId: string,
  data: MatrixRequirementUpdateSchema
): Promise<MatrixRequirementResponseSchema> {
  return api.put<MatrixRequirementResponseSchema>(`/api/matrix/requirements/${reqId}`, data);
}

export async function deleteRequirement(reqId: string): Promise<{ message: string }> {
  return api.delete<{ message: string }>(`/api/matrix/requirements/${reqId}`);
}

export async function fetchDocumentRequirements(docId: string): Promise<MatrixRequirementResponseSchema[]> {
  return api.get<MatrixRequirementResponseSchema[]>(`/api/matrix/document/${docId}/requirements`);
}

export async function validateRoleMatrix(roleIdentifier: string): Promise<MatrixValidationResponseSchema> {
  return api.get<MatrixValidationResponseSchema>(`/api/matrix/validate/${roleIdentifier}`);
}
