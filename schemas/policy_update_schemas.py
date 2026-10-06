from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class PolicyUpdateSummaryResponse(BaseModel):
    update_id: str
    document_id: str
    document_title: str
    old_version: int
    new_version: int
    change_type: str
    affected_roles_count: int
    affected_plans_count: int
    affected_modules_count: int
    affected_employees_count: int
    status: str
    detected_at: str

class AffectedRequirementResponse(BaseModel):
    impact_item_id: str
    requirement_id: str
    old_source_version: int
    new_source_version: int
    change_type: str
    affected_roles: List[str]

class AffectedPlanResponse(BaseModel):
    plan_id: str
    employee_id: str
    employee_name: str
    role_title: str
    department: str
    affected_modules_count: int
    status: str

class AffectedEmployeeResponse(BaseModel):
    employee_id: str
    employee_name: str
    role_title: str
    department: str
    plan_id: str
    affected_module_title: str
    reason: str
    old_version: int
    new_version: int
    current_progress: float

class RegenerationStatusResponse(BaseModel):
    update_id: str
    status: str
    total_affected_modules: int
    regenerated_count: int
    validated_count: int
    review_required_count: int

class PolicyAuditEventResponse(BaseModel):
    event_id: str
    event_type: str
    username: str
    entity_type: str
    entity_id: str
    old_value: Optional[Dict[str, Any]] = None
    new_value: Optional[Dict[str, Any]] = None
    reason: Optional[str] = None
    performed_at: str
