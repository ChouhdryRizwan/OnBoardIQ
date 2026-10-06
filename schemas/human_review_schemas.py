from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class ApprovePlanRequest(BaseModel):
    reviewer_id: str = Field(..., description="ID or name of the human reviewer")
    comments: Optional[str] = Field(None, description="Approval notes or summary")

class RejectPlanRequest(BaseModel):
    reviewer_id: str = Field(..., description="ID or name of the human reviewer")
    reason: str = Field(..., description="Mandatory reason for rejecting the generated plan")

class EditPlanRequest(BaseModel):
    reviewer_id: str = Field(..., description="ID or name of the human reviewer")
    edited_plan_structure: Dict[str, Any] = Field(..., description="Full or partial modified onboarding plan structure")
    comments: Optional[str] = Field(None, description="Explanation of manual edits made")

class RegeneratePlanRequest(BaseModel):
    reviewer_id: str = Field(..., description="ID or name of the human reviewer")
    feedback_prompt: Optional[str] = Field(None, description="Custom feedback instructions for GenAI regeneration")
    override_parameters: Optional[Dict[str, Any]] = Field(None, description="Parameter overrides for Pipeline 1 generation")

class AddCommentRequest(BaseModel):
    reviewer_id: str = Field(..., description="ID or name of the human reviewer")
    comment: str = Field(..., description="Review comment or audit log note")

class ManualOverrideRequest(BaseModel):
    reviewer_id: str = Field(..., description="ID or name of the human reviewer")
    override_reason: str = Field(..., description="Justification for manual override of validation flags")
    target_issue_ids: Optional[List[str]] = Field(default=[], description="Specific validation issue IDs to resolve/override")
    force_status: str = Field("verified", description="Forced verification status (e.g., 'verified' or 'verified_with_warning')")

class ReviewAuditItem(BaseModel):
    audit_id: str
    review_id: str
    reviewer_id: str
    action_taken: str
    reviewer_comments: str
    performed_at: str

class ReviewQueueItemResponse(BaseModel):
    review_id: str
    plan_id: str
    report_id: str
    assigned_reviewer_id: Optional[str] = None
    status: str
    reason_for_review: str
    created_at: str
    resolved_at: Optional[str] = None
    employee_id: str
    employee_name: str
    role_title: str
    department: str
    mandatory_coverage_score: float
    source_traceability_score: float
    verification_status: str

class FinalOnboardingPlanResponse(BaseModel):
    plan_id: str
    employee_id: str
    employee_name: str
    role_code: str
    role_title: str
    department: str
    plan_version: str
    verification_status: str
    final_approval_status: str
    mandatory_coverage_score: float
    source_traceability_score: float
    created_at: str
    finalized_at: str
    original_genai_model: str
    prompt_version: str
    validation_report_id: str
    stages: List[Dict[str, Any]]
    checklists: List[Dict[str, Any]]
    recommendations: List[str]
    audit_trail: List[ReviewAuditItem]
