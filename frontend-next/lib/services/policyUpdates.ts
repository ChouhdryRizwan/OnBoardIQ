import { api } from '../api';

export interface PolicyUpdateSummaryResponse {
  update_id: string;
  document_id: string;
  document_title: string;
  old_version: number;
  new_version: number;
  change_type: string;
  affected_roles_count: number;
  affected_plans_count: number;
  affected_modules_count: number;
  affected_employees_count: number;
  status: string; // "detected", "analyzed", "regenerating", "completed"
  detected_at: string;
}

export interface AffectedRequirementResponse {
  impact_item_id: string;
  requirement_id: string;
  old_source_version: number;
  new_source_version: number;
  change_type: string;
  affected_roles: string[];
}

export interface AffectedPlanResponse {
  plan_id: string;
  employee_id: string;
  employee_name: string;
  role_title: string;
  department: string;
  affected_modules_count: number;
  status: string;
}

export interface AffectedEmployeeResponse {
  employee_id: string;
  employee_name: string;
  role_title: string;
  department: string;
  plan_id: string;
  affected_module_title: string;
  reason: string;
  old_version: number;
  new_version: number;
  current_progress: number;
}

export interface RegenerationStatusResponse {
  update_id: string;
  status: string;
  total_affected_modules: number;
  regenerated_count: number;
  validated_count: number;
  review_required_count: number;
}

export interface PolicyAuditEventResponse {
  event_id: string;
  event_type: string;
  username: string;
  entity_type: string;
  entity_id: string;
  old_value?: Record<string, unknown> | null;
  new_value?: Record<string, unknown> | null;
  reason?: string | null;
  performed_at: string;
}

export async function fetchPolicyUpdates(): Promise<PolicyUpdateSummaryResponse[]> {
  return api.get<PolicyUpdateSummaryResponse[]>('/api/policy-updates');
}

export async function triggerImpactAnalysis(
  documentId: string,
  version: number
): Promise<PolicyUpdateSummaryResponse> {
  return api.post<PolicyUpdateSummaryResponse>(
    `/api/policy-updates/policies/${documentId}/versions/${version}/impact-analysis`,
    {}
  );
}

export async function fetchPolicyUpdateSummary(updateId: string): Promise<PolicyUpdateSummaryResponse> {
  return api.get<PolicyUpdateSummaryResponse>(`/api/policy-updates/${updateId}`);
}

export async function fetchAffectedRequirements(updateId: string): Promise<AffectedRequirementResponse[]> {
  return api.get<AffectedRequirementResponse[]>(`/api/policy-updates/${updateId}/requirements`);
}

export async function fetchAffectedPlans(updateId: string): Promise<AffectedPlanResponse[]> {
  return api.get<AffectedPlanResponse[]>(`/api/policy-updates/${updateId}/plans`);
}

export async function fetchAffectedEmployees(updateId: string): Promise<AffectedEmployeeResponse[]> {
  return api.get<AffectedEmployeeResponse[]>(`/api/policy-updates/${updateId}/employees`);
}

export async function triggerSelectiveRegeneration(updateId: string): Promise<RegenerationStatusResponse> {
  return api.post<RegenerationStatusResponse>(`/api/policy-updates/${updateId}/regenerate`, {});
}

export async function fetchRegenerationStatus(updateId: string): Promise<RegenerationStatusResponse> {
  return api.get<RegenerationStatusResponse>(`/api/policy-updates/${updateId}/regeneration-status`);
}

export async function fetchPolicyUpdateAuditHistory(updateId: string): Promise<PolicyAuditEventResponse[]> {
  return api.get<PolicyAuditEventResponse[]>(`/api/policy-updates/${updateId}/history`);
}
