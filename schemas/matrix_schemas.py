from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import datetime

class JobRoleCreateSchema(BaseModel):
    role_code: str = Field(..., example="R011")
    title: str = Field(..., example="Compliance Officer")
    department: str = Field(..., example="Legal & Compliance")
    description: Optional[str] = None
    required_experience_level: str = Field("beginner", example="intermediate")

class JobRoleUpdateSchema(BaseModel):
    title: Optional[str] = None
    department: Optional[str] = None
    description: Optional[str] = None
    required_experience_level: Optional[str] = None
    is_active: Optional[bool] = None

class JobRoleResponseSchema(BaseModel):
    role_id: str
    role_code: str
    title: str
    department: str
    description: Optional[str] = None
    required_experience_level: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class MatrixRequirementCreateSchema(BaseModel):
    requirement_id: str = Field(..., example="REQ-CS-001")
    role_identifier: str = Field(..., example="R001")
    title: Optional[str] = Field(None, example="Escalation SLA Compliance")
    description: Optional[str] = Field(None, example="24-hour escalation resolution policy requirement.")
    department: Optional[str] = Field(None, example="Customer Support")
    policy_requirement: str = Field(..., example="Must adhere to 24-hour SLA for customer complaint escalations.")
    process_requirement: Optional[str] = Field(None, example="SOP-07 Section 4.2 Escalation Workflow")
    required_competency: str = Field(..., example="Customer Communication & Escalation Management")
    is_mandatory: bool = True
    requirement_type: str = Field("must_know", example="must_know")
    priority: str = Field("high", example="high")
    due_stage: str = Field("week_1", example="day_1")
    source_document_id: str = Field(..., example="SOP-07")
    source_document_version: int = Field(1, example=1)
    source_section_id: str = Field(..., example="4.2")
    source_location: Optional[str] = Field(None, example="Page 3, Para 2")
    prerequisite_requirement_ids: List[str] = Field(default_factory=list)
    required_task_description: Optional[str] = Field(None, example="Respond to a simulated customer complaint scenario.")
    required_assessment_topic: Optional[str] = Field(None, example="Customer Complaint Handling Rules")

class MatrixRequirementUpdateSchema(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    department: Optional[str] = None
    policy_requirement: Optional[str] = None
    process_requirement: Optional[str] = None
    required_competency: Optional[str] = None
    is_mandatory: Optional[bool] = None
    requirement_type: Optional[str] = None
    priority: Optional[str] = None
    due_stage: Optional[str] = None
    source_document_id: Optional[str] = None
    source_document_version: Optional[int] = None
    source_section_id: Optional[str] = None
    source_location: Optional[str] = None
    prerequisite_requirement_ids: Optional[List[str]] = None
    required_task_description: Optional[str] = None
    required_assessment_topic: Optional[str] = None
    is_active: Optional[bool] = None

class MatrixRequirementResponseSchema(BaseModel):
    requirement_id: str
    job_role_id: str
    role_code: str = ""
    role_title: str = ""
    title: Optional[str] = None
    description: Optional[str] = None
    department: Optional[str] = None
    policy_requirement: str
    process_requirement: Optional[str] = None
    required_competency: str
    is_mandatory: bool
    requirement_type: str
    priority: str
    due_stage: str
    source_document_id: str
    source_document_version: int = 1
    source_section_id: str
    source_location: Optional[str] = None
    prerequisite_requirement_ids: List[str] = Field(default_factory=list)
    required_task_description: Optional[str] = None
    required_assessment_topic: Optional[str] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class MatrixValidationResponseSchema(BaseModel):
    role_code: str
    role_title: str
    total_requirements: int
    mandatory_requirements: int
    valid_ground_truth_references: int
    is_matrix_valid: bool
    issues: List[dict]

class RRMSummaryResponseSchema(BaseModel):
    total_roles: int
    total_requirements: int
    mandatory_requirements: int
    optional_requirements: int
    requirements_by_priority: Dict[str, int]
    requirements_by_classification: Dict[str, int]
    requirements_by_department: Dict[str, int]
