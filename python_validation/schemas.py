from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class ValidationIssueSchema(BaseModel):
    issue_id: Optional[str] = None
    requirement_id: Optional[str] = None
    issue_type: str = Field(..., description="Type of validation issue")
    severity: str = Field("high", description="critical, high, medium, low, warning")
    explanation: str = Field(..., description="Detailed explanation of the issue")
    source_info: Optional[Dict[str, Any]] = None
    expected_value: Optional[str] = None
    generated_value: Optional[str] = None

class RequirementComparisonItem(BaseModel):
    requirement_id: str
    role: str
    source: str
    python_expected_requirement: str
    genai_result: str
    match: bool
    coverage_status: str
    traceability_status: str
    validation_status: str
    explanation: str

class ValidationMetricsSchema(BaseModel):
    total_mandatory_requirements: int = 0
    covered_mandatory_requirements: int = 0
    missing_mandatory_requirements: int = 0
    mandatory_coverage_percentage: float = 0.0
    total_generated_requirements: int = 0
    supported_requirements: int = 0
    unsupported_requirements: int = 0
    traceability_score: float = 0.0
    role_relevance_score: float = 0.0
    duplicate_count: int = 0
    contradiction_count: int = 0
    outdated_source_count: int = 0
    manual_review_count: int = 0

class ValidationReportResponse(BaseModel):
    validation_run_id: str
    employee_id: str
    role_id: str
    plan_id: str
    timestamp: datetime
    overall_status: str
    metrics: ValidationMetricsSchema
    issues: List[ValidationIssueSchema] = Field(default_factory=list)
    comparisons: List[RequirementComparisonItem] = Field(default_factory=list)
