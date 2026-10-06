from typing import Optional, List
from pydantic import BaseModel, Field

class UserResponseSchema(BaseModel):
    user_id: str
    email: str
    full_name: str
    role: str
    is_active: bool
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    employee_id: Optional[str] = None
    employee_code: Optional[str] = None
    job_role_id: Optional[str] = None
    role_code: Optional[str] = None
    role_title: Optional[str] = None
    department: Optional[str] = None
    location: Optional[str] = None
    experience_level: Optional[str] = None
    joining_date: Optional[str] = None

class UserCreateSchema(BaseModel):
    email: str
    full_name: str
    role: str = "employee"
    is_active: bool = True
    password: Optional[str] = None
    department: Optional[str] = None
    role_identifier: Optional[str] = None
    location: Optional[str] = None

class UserUpdateSchema(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None
    department: Optional[str] = None
    role_identifier: Optional[str] = None
    location: Optional[str] = None

class UserStatusUpdateSchema(BaseModel):
    is_active: bool

class UserRoleUpdateSchema(BaseModel):
    role: str

class UserKPIStatsSchema(BaseModel):
    total_users: int
    active_users: int
    inactive_users: int
    total_employees: int
    admin_count: int
    training_manager_count: int
    reviewer_count: int
    manager_count: int
    employee_count: int
