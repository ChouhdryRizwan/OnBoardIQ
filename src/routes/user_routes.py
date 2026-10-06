import uuid
from datetime import datetime, date
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, Header
from sqlalchemy.orm import Session

from database.session import get_db
from database.models import User, EmployeeProfile, JobRole, UserRoleEnum, DifficultyLevelEnum, ProgressStatusEnum
from schemas.user_schemas import (
    UserResponseSchema, UserCreateSchema, UserUpdateSchema,
    UserStatusUpdateSchema, UserRoleUpdateSchema, UserKPIStatsSchema
)

router = APIRouter(prefix="/users", tags=["Admin User Management & RBAC"])

def _verify_admin_access(x_user_role: Optional[str] = Header(None, alias="X-User-Role")):
    """Security RBAC Check — Restricts user management administration to administrators."""
    if not x_user_role or x_user_role.lower() != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden. Administrator role required to access User Management."
        )

def _format_user_response(user: User, profile: Optional[EmployeeProfile] = None, role: Optional[JobRole] = None) -> dict:
    role_str = user.role.value if hasattr(user.role, "value") else str(user.role)
    
    emp_id = profile.employee_id if profile else None
    emp_code = profile.employee_code if profile else None
    dept = profile.department if profile else (role.department if role else None)
    job_role_id = profile.job_role_id if profile else None
    role_code = role.role_code if role else None
    role_title = role.title if role else None
    location = profile.location if profile else None
    exp_level = profile.experience_level.value if (profile and hasattr(profile.experience_level, "value")) else (str(profile.experience_level) if profile else None)
    join_date = profile.joining_date.isoformat() if (profile and profile.joining_date) else None

    return {
        "user_id": user.user_id,
        "email": user.email,
        "full_name": user.full_name,
        "role": role_str,
        "is_active": user.is_active,
        "created_at": user.created_at.isoformat() if user.created_at else None,
        "updated_at": user.updated_at.isoformat() if user.updated_at else None,
        "employee_id": emp_id,
        "employee_code": emp_code,
        "job_role_id": job_role_id,
        "role_code": role_code,
        "role_title": role_title,
        "department": dept,
        "location": location,
        "experience_level": exp_level,
        "joining_date": join_date
    }

@router.get("/stats", response_model=UserKPIStatsSchema)
def get_user_stats(
    db: Session = Depends(get_db),
    _rbac: None = Depends(_verify_admin_access)
):
    """Retrieve top-level KPI metrics for User Management."""
    users = db.query(User).all()
    total_users = len(users)
    active_users = sum(1 for u in users if u.is_active)
    inactive_users = total_users - active_users

    admin_count = 0
    training_manager_count = 0
    reviewer_count = 0
    manager_count = 0
    employee_count = 0

    for u in users:
        r = (u.role.value if hasattr(u.role, "value") else str(u.role)).lower()
        if r == "admin":
            admin_count += 1
        elif r == "training_manager":
            training_manager_count += 1
        elif r == "reviewer":
            reviewer_count += 1
        elif r == "manager":
            manager_count += 1
        elif r == "employee":
            employee_count += 1

    total_employees = db.query(EmployeeProfile).count()

    return UserKPIStatsSchema(
        total_users=total_users,
        active_users=active_users,
        inactive_users=inactive_users,
        total_employees=total_employees,
        admin_count=admin_count,
        training_manager_count=training_manager_count,
        reviewer_count=reviewer_count,
        manager_count=manager_count,
        employee_count=employee_count
    )

@router.get("", response_model=List[UserResponseSchema])
def list_users(
    role: Optional[str] = Query(None, description="Filter by role"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    search: Optional[str] = Query(None, description="Search by name, email, user_id, or employee_code"),
    db: Session = Depends(get_db),
    _rbac: None = Depends(_verify_admin_access)
):
    """Retrieve all users with optional role, status, and text search filters."""
    users = db.query(User).order_by(User.created_at.desc()).all()
    results = []

    for u in users:
        u_role_str = (u.role.value if hasattr(u.role, "value") else str(u.role)).lower()
        if role and role.lower() != "all" and u_role_str != role.lower():
            continue

        if is_active is not None and u.is_active != is_active:
            continue

        profile = db.query(EmployeeProfile).filter(EmployeeProfile.user_id == u.user_id).first()
        job_role = db.query(JobRole).filter(JobRole.role_id == profile.job_role_id).first() if profile else None

        if search:
            s = search.lower().strip()
            name_match = s in (u.full_name or "").lower()
            email_match = s in (u.email or "").lower()
            id_match = s in (u.user_id or "").lower()
            code_match = profile and s in (profile.employee_code or "").lower()
            dept_match = profile and s in (profile.department or "").lower()
            if not (name_match or email_match or id_match or code_match or dept_match):
                continue

        results.append(_format_user_response(u, profile, job_role))

    return results

@router.get("/{user_id}", response_model=UserResponseSchema)
def get_user_details(
    user_id: str,
    db: Session = Depends(get_db),
    x_user_role: Optional[str] = Header(None, alias="X-User-Role"),
    x_user_id: Optional[str] = Header(None, alias="X-User-Id")
):
    """Retrieve details for a specific user. Administrators can view any user; employees can view self."""
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User '{user_id}' not found.")

    is_admin = x_user_role and x_user_role.lower() == "admin"
    is_self = x_user_id and x_user_id == user_id
    if not (is_admin or is_self):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. Cannot view another user's details.")

    profile = db.query(EmployeeProfile).filter(EmployeeProfile.user_id == user.user_id).first()
    job_role = db.query(JobRole).filter(JobRole.role_id == profile.job_role_id).first() if profile else None

    return _format_user_response(user, profile, job_role)

@router.post("", response_model=UserResponseSchema, status_code=status.HTTP_201_CREATED)
def create_user(
    req: UserCreateSchema,
    db: Session = Depends(get_db),
    _rbac: None = Depends(_verify_admin_access)
):
    """Create a new user and optionally link an employee profile."""
    existing_user = db.query(User).filter(User.email == req.email.strip()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"User with email '{req.email}' already exists."
        )

    try:
        user_role_enum = UserRoleEnum(req.role.lower())
    except ValueError:
        user_role_enum = UserRoleEnum.EMPLOYEE

    user_id = str(uuid.uuid4())
    new_user = User(
        user_id=user_id,
        email=req.email.strip(),
        password_hash="pbkdf2:user_default_hash",
        full_name=req.full_name.strip(),
        role=user_role_enum,
        is_active=req.is_active
    )
    db.add(new_user)
    db.flush()

    profile = None
    job_role = None

    if user_role_enum == UserRoleEnum.EMPLOYEE or req.role_identifier or req.department:
        role_record = None
        if req.role_identifier:
            role_record = db.query(JobRole).filter(
                (JobRole.role_id == req.role_identifier) | (JobRole.role_code == req.role_identifier)
            ).first()

        if not role_record:
            role_record = db.query(JobRole).first()

        job_role = role_record
        emp_code = f"EMP-{uuid.uuid4().hex[:6].upper()}"
        profile = EmployeeProfile(
            employee_id=str(uuid.uuid4()),
            user_id=user_id,
            employee_code=emp_code,
            job_role_id=role_record.role_id if role_record else str(uuid.uuid4()),
            department=req.department or (role_record.department if role_record else "General"),
            experience_level=DifficultyLevelEnum.BEGINNER,
            location=req.location or "Corporate Office",
            joining_date=date.today(),
            training_status=ProgressStatusEnum.ON_TRACK
        )
        db.add(profile)

    db.commit()
    db.refresh(new_user)
    if profile:
        db.refresh(profile)

    return _format_user_response(new_user, profile, job_role)

@router.put("/{user_id}", response_model=UserResponseSchema)
def update_user(
    user_id: str,
    req: UserUpdateSchema,
    db: Session = Depends(get_db),
    _rbac: None = Depends(_verify_admin_access)
):
    """Update user information, status, and role assignment."""
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User '{user_id}' not found.")

    if req.email and req.email.strip() != user.email:
        duplicate = db.query(User).filter(User.email == req.email.strip()).first()
        if duplicate:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Email '{req.email}' is already in use.")
        user.email = req.email.strip()

    if req.full_name is not None:
        user.full_name = req.full_name.strip()

    if req.is_active is not None:
        user.is_active = req.is_active

    if req.role:
        try:
            user.role = UserRoleEnum(req.role.lower())
        except ValueError:
            pass

    profile = db.query(EmployeeProfile).filter(EmployeeProfile.user_id == user_id).first()
    job_role = db.query(JobRole).filter(JobRole.role_id == profile.job_role_id).first() if profile else None

    if profile:
        if req.department:
            profile.department = req.department
        if req.location:
            profile.location = req.location
        if req.role_identifier:
            new_role = db.query(JobRole).filter(
                (JobRole.role_id == req.role_identifier) | (JobRole.role_code == req.role_identifier)
            ).first()
            if new_role:
                profile.job_role_id = new_role.role_id
                job_role = new_role

    db.commit()
    db.refresh(user)
    return _format_user_response(user, profile, job_role)

@router.patch("/{user_id}/status", response_model=UserResponseSchema)
def update_user_status(
    user_id: str,
    req: UserStatusUpdateSchema,
    db: Session = Depends(get_db),
    _rbac: None = Depends(_verify_admin_access)
):
    """Toggle activation / deactivation status of a user account."""
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User '{user_id}' not found.")

    user.is_active = req.is_active
    db.commit()
    db.refresh(user)

    profile = db.query(EmployeeProfile).filter(EmployeeProfile.user_id == user_id).first()
    job_role = db.query(JobRole).filter(JobRole.role_id == profile.job_role_id).first() if profile else None

    return _format_user_response(user, profile, job_role)

@router.patch("/{user_id}/role", response_model=UserResponseSchema)
def update_user_role(
    user_id: str,
    req: UserRoleUpdateSchema,
    db: Session = Depends(get_db),
    _rbac: None = Depends(_verify_admin_access)
):
    """Assign or update a user's role."""
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User '{user_id}' not found.")

    try:
        user.role = UserRoleEnum(req.role.lower())
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role '{req.role}'. Valid roles are: admin, training_manager, reviewer, manager, employee."
        )

    db.commit()
    db.refresh(user)

    profile = db.query(EmployeeProfile).filter(EmployeeProfile.user_id == user_id).first()
    job_role = db.query(JobRole).filter(JobRole.role_id == profile.job_role_id).first() if profile else None

    return _format_user_response(user, profile, job_role)
