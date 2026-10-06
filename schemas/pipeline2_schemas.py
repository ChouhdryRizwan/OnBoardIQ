from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class RequirementComparisonDetailSchema(BaseModel):
    comparison_id: str = Field(..., description="Unique comparison detail ID")
    requirement_id: str = Field(..., description="Role matrix requirement ID")
    job_role_code: str = Field(..., description="Job role code")
    python_expected_source_doc: Optional[str] = Field(None, description="Expected ground-truth document ID")
    python_expected_source_sec: Optional[str] = Field(None, description="Expected ground-truth section ID")
    python_expected_mandatory: Optional[bool] = Field(None, description="Expected mandatory flag")
    genai_output_source_doc: Optional[str] = Field(None, description="GenAI plan cited document ID")
    genai_output_source_sec: Optional[str] = Field(None, description="GenAI plan cited section ID")
    genai_output_mandatory: Optional[bool] = Field(None, description="GenAI plan mandatory flag")
    match_result: str = Field(..., description="match, mismatch, missing, or unsupported")
    validation_status: str = Field(..., description="Detailed verification status")
    disagreement_explanation: Optional[str] = Field(None, description="Explanation of discrepancy")

class HallucinationFlagSchema(BaseModel):
    flag_id: str = Field(..., description="Unique hallucination flag ID")
    module_id: Optional[str] = Field(None, description="Associated module ID")
    claimed_source_doc: Optional[str] = Field(None, description="Claimed non-existent document ID")
    claimed_source_sec: Optional[str] = Field(None, description="Claimed non-existent section ID")
    flagged_statement: str = Field(..., description="Unbacked statement or citation")
    reason: str = Field(..., description="Reason for flagging")
    is_resolved: bool = Field(False, description="Resolution status")

class ContradictionFlagSchema(BaseModel):
    contradiction_id: str = Field(..., description="Unique contradiction flag ID")
    primary_document_id: Optional[str] = Field(None, description="Primary document ID")
    conflicting_document_id: Optional[str] = Field(None, description="Conflicting or obsolete document ID")
    primary_clause: str = Field(..., description="Primary rule clause")
    conflicting_clause: str = Field(..., description="Conflicting clause")
    applied_precedence_rule: str = Field(..., description="Precedence rule applied")
    description: str = Field(..., description="Contradiction description")
    is_resolved: bool = Field(False, description="Resolution status")

class Pipeline2VerificationRequest(BaseModel):
    plan_id: str = Field(..., description="Onboarding plan UUID to verify")

class ValidationReportResponse(BaseModel):
    report_id: str = Field(..., description="Unique validation report ID")
    plan_id: str = Field(..., description="Verified onboarding plan ID")
    employee_id: str = Field(..., description="Employee ID")
    role_code: str = Field(..., description="Job role code")
    verification_status: str = Field(..., description="Overall verification status")
    mandatory_coverage_score: float = Field(..., description="Mandatory coverage percentage (0-100)")
    source_traceability_score: float = Field(..., description="Source traceability percentage (0-100)")
    consistency_score: float = Field(..., description="Consistency percentage (0-100)")
    total_mandatory_requirements: int = Field(..., description="Total mandatory requirements in role matrix")
    covered_mandatory_requirements: int = Field(..., description="Covered mandatory requirements count")
    missing_requirements_count: int = Field(..., description="Missing mandatory requirements count")
    unsupported_requirements_count: int = Field(..., description="Unsupported or hallucinated items count")
    contradiction_count: int = Field(..., description="Policy contradiction count")
    duplicate_count: int = Field(..., description="Duplicate items count")
    evaluated_at: str = Field(..., description="Evaluation timestamp")
    requires_manual_review: bool = Field(..., description="True if dispatched to manual review queue")
    comparison_details: List[RequirementComparisonDetailSchema] = Field(default_factory=list)
    hallucination_flags: List[HallucinationFlagSchema] = Field(default_factory=list)
    contradiction_flags: List[ContradictionFlagSchema] = Field(default_factory=list)

class ManualReviewItemSchema(BaseModel):
    review_id: str = Field(..., description="Manual review queue item ID")
    report_id: str = Field(..., description="Validation report ID")
    plan_id: str = Field(..., description="Onboarding plan ID")
    employee_id: str = Field(..., description="Employee ID")
    status: str = Field(..., description="pending, in_review, or resolved")
    reason_for_review: str = Field(..., description="Reason for review queue dispatch")
    created_at: str = Field(..., description="Dispatch timestamp")
