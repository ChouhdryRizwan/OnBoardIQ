export type UserRole = 'admin' | 'training_manager' | 'reviewer' | 'manager' | 'employee' | 'compliance_manager' | 'hr_manager';

export interface User {
  user_id: string;
  id?: string;
  email: string;
  full_name: string;
  name?: string;
  role: UserRole;
  department?: string;
  created_at?: string;
}

export interface EmployeeProfile {
  employee_id: string;
  user_id?: string;
  employee_code?: string;
  name: string;
  email: string;
  role_identifier: string;
  role_code?: string;
  role_title?: string;
  department: string;
  experience_level?: string;
  joining_date?: string;
  location?: string;
  status?: string;
}

export interface JobRole {
  role_id: string;
  role_code: string;
  title: string;
  department: string;
  description?: string;
  required_experience_level?: string;
  created_at?: string;
}

export interface CompanyDocument {
  document_id: string;
  title: string;
  category: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  version: string;
  checksum: string;
  chunk_count: number;
  uploaded_at: string;
  is_active: boolean;
}

export interface DocumentChunk {
  chunk_id: string;
  document_id: string;
  section_heading: string;
  page_number?: number;
  chunk_index: number;
  content: string;
  token_count?: number;
}

export interface RoleRequirementMatrix {
  matrix_id: string;
  job_role_id: string;
  role_code: string;
  version: string;
  mandatory_documents: string[];
  mandatory_topics: string[];
  minimum_passing_score: number;
  required_certifications?: string[];
  created_at: string;
  updated_at: string;
}

export interface OnboardingPlan {
  plan_id: string;
  employee_id: string;
  job_role_id: string;
  role_code?: string;
  plan_version: string;
  verification_status: 'verified' | 'verified_with_warning' | 'partially_verified' | 'manual_review_required' | 'outdated_source';
  final_approval_status?: string;
  mandatory_coverage_score?: number;
  source_traceability_score?: number;
  consistency_score?: number;
  generated_at: string;
  stages?: Record<string, unknown>[];
}

export interface ValidationReport {
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
  evaluated_at: string;
  requires_manual_review: boolean;
  missing_requirements?: string[];
  unsupported_claims?: string[];
  flagged_items?: string[];
}

export interface HumanReviewQueueItem {
  review_id: string;
  plan_id: string;
  employee_id: string;
  job_role_id: string;
  verification_status: string;
  coverage_score: number;
  submitted_at: string;
  status: 'pending' | 'approved' | 'rejected' | 'edited';
  reviewer_id?: string;
  reviewer_comments?: string;
  reviewed_at?: string;
}

export interface PolicyUpdate {
  update_id: string;
  document_id: string;
  previous_version: string;
  new_version: string;
  detected_at: string;
  impacted_plans_count: number;
  impacted_employees_count: number;
  status: 'detected' | 'analyzing' | 'regenerated' | 'completed';
}

export interface EmployeeDashboardData {
  employee: EmployeeProfile;
  active_plan?: OnboardingPlan;
  overall_progress_pct: number;
  completed_modules_count: number;
  total_modules_count: number;
  passed_quizzes_count: number;
  total_quizzes_count: number;
  weak_areas?: string[];
}
