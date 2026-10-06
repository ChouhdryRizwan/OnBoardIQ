import uuid
from datetime import date, datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from database.session import get_db
from database.models import EmployeeProfile, JobRole, User, UserRoleEnum, ProgressStatusEnum, DifficultyLevelEnum
from schemas.employee_schemas import EmployeeCreateSchema, EmployeeUpdateSchema, EmployeeResponseSchema

router = APIRouter(prefix="/api/employees", tags=["Employee Management"])

def _format_employee_response(profile: EmployeeProfile, user: Optional[User], role: Optional[JobRole]) -> dict:
    return {
        "employee_id": profile.employee_id,
        "employee_code": profile.employee_code,
        "user_id": profile.user_id or (user.user_id if user else None),
        "name": user.full_name if user else "Employee",
        "email": user.email if user else f"emp_{profile.employee_code.lower()}@company.com",
        "job_role_id": profile.job_role_id,
        "role_code": role.role_code if role else "UNKNOWN",
        "role_title": role.title if role else "Job Role",
        "department": profile.department,
        "experience_level": profile.experience_level.value if hasattr(profile.experience_level, "value") else str(profile.experience_level),
        "location": profile.location,
        "joining_date": profile.joining_date or date.today(),
        "training_status": profile.training_status.value if hasattr(profile.training_status, "value") else str(profile.training_status),
        "is_active": user.is_active if user else True,
        "created_at": profile.created_at or datetime.utcnow()
    }

@router.post("", response_model=EmployeeResponseSchema, status_code=status.HTTP_201_CREATED)
def create_employee(req: EmployeeCreateSchema, db: Session = Depends(get_db)):
    """Create a new employee profile and associate user account."""
    # Resolve job role
    role = db.query(JobRole).filter(
        (JobRole.role_id == req.role_identifier) | (JobRole.role_code == req.role_identifier)
    ).first()
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job Role '{req.role_identifier}' not found."
        )

    # Check email duplicate
    existing_user = db.query(User).filter(User.email == req.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"User with email '{req.email}' already exists."
        )

    # Create User record
    user_id = str(uuid.uuid4())
    user = User(
        user_id=user_id,
        email=req.email,
        password_hash="pbkdf2:sha256:default_hash_for_test",
        full_name=req.name,
        role=UserRoleEnum.EMPLOYEE,
        is_active=True
    )
    db.add(user)
    db.flush()

    # Create Employee Profile record
    emp_code = f"EMP-{uuid.uuid4().hex[:6].upper()}"
    try:
        exp_enum = DifficultyLevelEnum(req.experience_level.lower())
    except ValueError:
        exp_enum = DifficultyLevelEnum.BEGINNER

    profile = EmployeeProfile(
        employee_id=str(uuid.uuid4()),
        user_id=user_id,
        employee_code=emp_code,
        job_role_id=role.role_id,
        department=req.department or role.department,
        experience_level=exp_enum,
        location=req.location or "Headquarters",
        joining_date=req.joining_date or date.today(),
        required_competencies=req.required_competencies or [],
        training_status=ProgressStatusEnum.ON_TRACK
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)

    return _format_employee_response(profile, user, role)

@router.get("", response_model=List[EmployeeResponseSchema])
def list_employees(
    department: Optional[str] = None,
    role_id: Optional[str] = None,
    is_active: Optional[bool] = True,
    db: Session = Depends(get_db)
):
    """List all employees with optional filters."""
    query = db.query(EmployeeProfile, User, JobRole).join(
        User, EmployeeProfile.user_id == User.user_id
    ).join(
        JobRole, EmployeeProfile.job_role_id == JobRole.role_id
    )

    if department:
        query = query.filter(EmployeeProfile.department == department)
    if role_id:
        query = query.filter(
            (EmployeeProfile.job_role_id == role_id) | (JobRole.role_code == role_id)
        )
    if is_active is not None:
        query = query.filter(User.is_active == is_active)

    results = query.all()
    return [_format_employee_response(p, u, r) for p, u, r in results]

@router.get("/{employee_id}", response_model=EmployeeResponseSchema)
def get_employee(employee_id: str, db: Session = Depends(get_db)):
    """Retrieve an employee profile by employee_id or employee_code."""
    record = db.query(EmployeeProfile, User, JobRole).join(
        User, EmployeeProfile.user_id == User.user_id
    ).join(
        JobRole, EmployeeProfile.job_role_id == JobRole.role_id
    ).filter(
        (EmployeeProfile.employee_id == employee_id) | (EmployeeProfile.employee_code == employee_id)
    ).first()

    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee '{employee_id}' not found."
        )

    p, u, r = record
    return _format_employee_response(p, u, r)

@router.put("/{employee_id}", response_model=EmployeeResponseSchema)
def update_employee(employee_id: str, req: EmployeeUpdateSchema, db: Session = Depends(get_db)):
    """Update employee details."""
    record = db.query(EmployeeProfile, User, JobRole).join(
        User, EmployeeProfile.user_id == User.user_id
    ).join(
        JobRole, EmployeeProfile.job_role_id == JobRole.role_id
    ).filter(
        (EmployeeProfile.employee_id == employee_id) | (EmployeeProfile.employee_code == employee_id)
    ).first()

    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee '{employee_id}' not found."
        )

    profile, user, role = record

    if req.name:
        user.full_name = req.name
    if req.email:
        user.email = req.email
    if req.is_active is not None:
        user.is_active = req.is_active

    if req.role_identifier:
        new_role = db.query(JobRole).filter(
            (JobRole.role_id == req.role_identifier) | (JobRole.role_code == req.role_identifier)
        ).first()
        if new_role:
            profile.job_role_id = new_role.role_id
            role = new_role

    if req.department:
        profile.department = req.department
    if req.experience_level:
        try:
            profile.experience_level = DifficultyLevelEnum(req.experience_level.lower())
        except ValueError:
            pass
    if req.joining_date:
        profile.joining_date = req.joining_date
    if req.location:
        profile.location = req.location
    if req.required_competencies is not None:
        profile.required_competencies = req.required_competencies

    db.commit()
    return _format_employee_response(profile, user, role)

@router.delete("/{employee_id}")
def deactivate_employee(employee_id: str, db: Session = Depends(get_db)):
    """Deactivate an employee account."""
    record = db.query(EmployeeProfile, User).join(
        User, EmployeeProfile.user_id == User.user_id
    ).filter(
        (EmployeeProfile.employee_id == employee_id) | (EmployeeProfile.employee_code == employee_id)
    ).first()

    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee '{employee_id}' not found."
        )

    profile, user = record
    user.is_active = False
    profile.training_status = ProgressStatusEnum.BEHIND_SCHEDULE
    db.commit()

    return {"message": f"Employee '{employee_id}' has been deactivated.", "employee_id": profile.employee_id}
