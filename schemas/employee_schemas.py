from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date, datetime

class EmployeeCreateSchema(BaseModel):
    name: str = Field(..., description="Full name of the employee")
    email: str = Field(..., description="Corporate email address")
    role_identifier: str = Field(..., description="Job role ID or role code (e.g. R001)")
    department: str = Field(..., description="Department name")
    experience_level: str = Field("beginner", description="beginner, intermediate, advanced")
    joining_date: Optional[date] = Field(None, description="Date of joining")
    location: Optional[str] = Field("Headquarters", description="Work location")
    required_competencies: Optional[List[str]] = Field(default_factory=list)

class EmployeeUpdateSchema(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    role_identifier: Optional[str] = None
    department: Optional[str] = None
    experience_level: Optional[str] = None
    joining_date: Optional[date] = None
    location: Optional[str] = None
    required_competencies: Optional[List[str]] = None
    training_status: Optional[str] = None
    is_active: Optional[bool] = None

class EmployeeResponseSchema(BaseModel):
    employee_id: str
    employee_code: str
    user_id: Optional[str] = None
    name: str
    email: str
    job_role_id: str
    role_code: str
    role_title: str
    department: str
    experience_level: str
    location: Optional[str] = None
    joining_date: date
    training_status: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
