from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

# 1. Overview Metrics Schema
class OverviewMetricsResponse(BaseModel):
    total_employees: int
    active_employees: int
    total_roles: int
    total_requirements: int
    mandatory_requirements: int
    active_training_plans: int
    completed_plans: int
    average_progress_percentage: float
    pending_reviews: int
    validation_failures: int
    outdated_plans: int
    policy_changes_count: int
    assessment_completion_rate: float
    avg_mandatory_coverage_pct: Optional[float] = None
    avg_source_traceability_pct: Optional[float] = None

# 2. Employee Progress Report Item Schema
class EmployeeProgressReportItem(BaseModel):
    employee_id: str
    employee_name: str
    email: str
    department: str
    role_code: str
    role_title: str
    plan_id: Optional[str] = None
    plan_version: str
    overall_progress_percentage: float
    completed_modules: int
    total_modules: int
    completed_tasks: int
    total_tasks: int
    assessment_attempts: int
    assessment_score_avg: float
    current_status: str  # on_track, requires_attention, behind_schedule, assessment_required, completed
    last_activity_at: Optional[str] = None
    weak_areas: List[str] = []
    outstanding_requirements: List[str] = []

class EmployeeProgressReportResponse(BaseModel):
    total: int
    page: int
    size: int
    items: List[EmployeeProgressReportItem]

# 3. Role Coverage Report Item Schema
class RoleCoverageReportItem(BaseModel):
    role_code: str
    role_title: str
    department: str
    total_rrm_requirements: int
    mandatory_requirements: int
    optional_requirements: int
    covered_requirements: int
    missing_requirements: int
    verified_requirements: int
    validation_failures: int
    coverage_percentage: float
    current_plan_version: str
    outdated_status: str

# 4. Mandatory Training Report Item Schema
class MandatoryTrainingReportItem(BaseModel):
    requirement_id: str
    requirement_title: str
    role_code: str
    role_title: str
    employee_name: str
    department: str
    source_document_id: str
    source_document_version: int
    source_section_id: str
    training_module_id: Optional[str] = None
    training_module_title: Optional[str] = None
    is_mandatory: bool
    completion_status: str
    assessment_status: str
    validation_status: str
    human_review_status: str

# 5. Assessment Report Schema
class AssessmentReportItem(BaseModel):
    employee_id: str
    employee_name: str
    role_title: str
    module_title: str
    assessment_topic: str
    attempts_count: int
    best_score: float
    latest_score: float
    pass_fail_result: str  # passed, failed, requires_review
    passing_threshold: float
    completion_date: Optional[str] = None
    weak_areas: List[str] = []

class AssessmentReportSummary(BaseModel):
    total_assessments: int
    completed_assessments: int
    passed_assessments: int
    failed_assessments: int
    average_score: float
    pass_rate_percentage: float
    employees_requiring_reassessment_count: int
    items: List[AssessmentReportItem]

# 6. Source Traceability Report Schema
class TraceabilityReportItem(BaseModel):
    source_document_id: str
    source_document_title: str
    source_document_version: int
    page_number: Optional[int] = None
    section_id: str
    paragraph_reference: Optional[str] = None
    chunk_id: str
    requirement_id: str
    role_code: str
    module_id: str
    module_title: str
    plan_id: str
    validation_status: str
    human_review_status: str

# 7. Hallucination / Unsupported Content Report Schema
class HallucinationReportItem(BaseModel):
    plan_id: str
    employee_name: str
    role_title: str
    module_id: Optional[str] = None
    module_title: Optional[str] = None
    requirement_id: Optional[str] = None
    validation_status: str
    flag_type: str  # hallucination, contradiction, missing_traceability, unsupported
    flagged_statement: str
    reason: str
    severity: str  # critical, high, medium, low
    review_status: str  # pending, resolved, overridden
    human_decision: Optional[str] = None

# 8. Policy Coverage Report Schema
class PolicyCoverageReportItem(BaseModel):
    document_id: str
    document_title: str
    policy_version: int
    effective_date: str
    affected_roles_count: int
    affected_requirements_count: int
    affected_modules_count: int
    affected_employees_count: int
    affected_plans_count: int
    current_coverage_percentage: float
    outdated_plans_count: int
    regeneration_status: str
    revalidation_status: str
    version_status: str  # current, outdated, regeneration_pending, revalidated, approved

# 9. GenAI vs Python Comparison Report Schema
class GenAIPythonComparisonItem(BaseModel):
    plan_id: str
    module_id: str
    requirement_id: str
    genai_classification: str
    python_classification: str
    genai_priority: str
    python_priority: str
    genai_due_stage: str
    python_due_stage: str
    traceability_match: bool
    mandatory_coverage_match: bool
    role_relevance_match: bool
    overall_match: bool
    validation_status: str
    final_human_decision: str

class GenAIPythonComparisonSummary(BaseModel):
    total_comparisons: int
    agreements_count: int
    disagreements_count: int
    agreement_percentage: float
    validation_failures_count: int
    human_overrides_count: int
    items: List[GenAIPythonComparisonItem]

# 10. Plan / Entity Comparison Schema
class PlanComparisonDifference(BaseModel):
    category: str
    item_id: str
    entity_1_value: Any
    entity_2_value: Any
    is_match: bool
    difference_note: str

class PlanComparisonResponse(BaseModel):
    comparison_type: str  # plan_vs_plan, role_vs_role, dept_vs_dept, policy_vs_policy
    entity_1_id: str
    entity_1_label: str
    entity_2_id: str
    entity_2_label: str
    total_items_compared: int
    matches_count: int
    differences_count: int
    similarity_percentage: float
    differences: List[PlanComparisonDifference]
