from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from database.session import get_db
from database.models import (
    JobRole, RoleRequirementMatrix, RequirementTypeEnum, PriorityLevelEnum
)
from role_matrix.matrix_manager import matrix_manager
from role_matrix.matrix_validator import matrix_validator
from security.auth import require_document_manager_role
from schemas.matrix_schemas import (
    JobRoleCreateSchema, JobRoleUpdateSchema, JobRoleResponseSchema,
    MatrixRequirementCreateSchema, MatrixRequirementUpdateSchema, MatrixRequirementResponseSchema,
    MatrixValidationResponseSchema, RRMSummaryResponseSchema
)

router = APIRouter(prefix="", tags=["Role Requirement Matrix (RRM) & Role Management"])


# =============================================================================
# 1. ROLE MANAGEMENT ENDPOINTS
# =============================================================================

@router.get("/roles", response_model=List[JobRoleResponseSchema])
def list_roles(db: Session = Depends(get_db)):
    """Retrieves all active job roles, seeding default roles if table is empty."""
    roles = db.query(JobRole).filter(JobRole.is_active == True).all()
    if not roles:
        roles = matrix_manager.seed_default_roles(db)
    return roles


@router.post("/roles", response_model=JobRoleResponseSchema, status_code=status.HTTP_201_CREATED)
def create_role(
    req: JobRoleCreateSchema,
    db: Session = Depends(get_db),
    user_role: str = Depends(require_document_manager_role)
):
    """Creates a new job role."""
    try:
        role = matrix_manager.create_role(
            db=db,
            role_code=req.role_code,
            title=req.title,
            department=req.department,
            description=req.description or "",
            experience_level=req.required_experience_level
        )
        return role
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/roles/{role_identifier}", response_model=JobRoleResponseSchema)
def get_role(role_identifier: str, db: Session = Depends(get_db)):
    """Retrieves details of a specific job role by role_id or role_code."""
    role = matrix_manager.get_role_by_id_or_code(db, role_identifier)
    if not role:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Job role '{role_identifier}' not found.")
    return role


@router.put("/roles/{role_identifier}", response_model=JobRoleResponseSchema)
def update_role(
    role_identifier: str,
    req: JobRoleUpdateSchema,
    db: Session = Depends(get_db),
    user_role: str = Depends(require_document_manager_role)
):
    """Updates an existing job role."""
    try:
        update_data = req.dict(exclude_unset=True)
        role = matrix_manager.update_role(db, role_identifier, update_data)
        return role
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/roles/{role_identifier}", status_code=status.HTTP_200_OK)
def delete_role(
    role_identifier: str,
    db: Session = Depends(get_db),
    user_role: str = Depends(require_document_manager_role)
):
    """Deactivates a job role."""
    try:
        matrix_manager.delete_role(db, role_identifier)
        return {"message": f"Job role '{role_identifier}' deactivated successfully."}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("/roles/{role_identifier}/requirements", response_model=List[MatrixRequirementResponseSchema])
def get_role_requirements(role_identifier: str, db: Session = Depends(get_db)):
    """Retrieves all active ground-truth matrix requirements associated with a specific role."""
    role = matrix_manager.get_role_by_id_or_code(db, role_identifier)
    if not role:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Job role '{role_identifier}' not found.")

    reqs = matrix_manager.get_ground_truth_matrix_for_role(db, role.role_code)
    results = []
    for r in reqs:
        prereqs = r.prerequisite_requirement_ids if isinstance(r.prerequisite_requirement_ids, list) else []
        results.append(
            MatrixRequirementResponseSchema(
                requirement_id=r.requirement_id,
                job_role_id=r.job_role_id,
                role_code=role.role_code,
                role_title=role.title,
                title=r.title or r.policy_requirement[:50],
                description=r.description,
                department=r.department or role.department,
                policy_requirement=r.policy_requirement,
                process_requirement=r.process_requirement,
                required_competency=r.required_competency,
                is_mandatory=r.is_mandatory,
                requirement_type=r.requirement_type.value if hasattr(r.requirement_type, "value") else str(r.requirement_type),
                priority=r.priority.value if hasattr(r.priority, "value") else str(r.priority),
                due_stage=r.due_stage.value if hasattr(r.due_stage, "value") else str(r.due_stage),
                source_document_id=r.source_document_id,
                source_document_version=r.source_document_version or 1,
                source_section_id=r.source_section_id,
                source_location=r.source_location,
                prerequisite_requirement_ids=prereqs,
                required_task_description=r.required_task_description,
                required_assessment_topic=r.required_assessment_topic,
                is_active=r.is_active,
                created_at=r.created_at
            )
        )
    return results


# =============================================================================
# 2. ROLE REQUIREMENT MATRIX (RRM) ENDPOINTS
# =============================================================================

@router.get("/matrix/summary", response_model=RRMSummaryResponseSchema)
def get_rrm_summary(db: Session = Depends(get_db)):
    """Retrieves RRM dashboard summary statistics."""
    return matrix_manager.get_rrm_summary_statistics(db)


@router.get("/matrix/requirements", response_model=List[MatrixRequirementResponseSchema])
def list_requirements(
    role_id: Optional[str] = Query(None),
    department: Optional[str] = Query(None),
    is_mandatory: Optional[bool] = Query(None),
    classification: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    source_document_id: Optional[str] = Query(None),
    status_filter: Optional[bool] = Query(True),
    db: Session = Depends(get_db)
):
    """Retrieves requirement matrix items with multi-parameter filtering."""
    query = db.query(RoleRequirementMatrix)

    if status_filter is not None:
        query = query.filter(RoleRequirementMatrix.is_active == status_filter)

    if role_id:
        role = matrix_manager.get_role_by_id_or_code(db, role_id)
        if role:
            query = query.filter(RoleRequirementMatrix.job_role_id == role.role_id)

    if department:
        query = query.filter(RoleRequirementMatrix.department == department)

    if is_mandatory is not None:
        query = query.filter(RoleRequirementMatrix.is_mandatory == is_mandatory)

    if classification:
        try:
            req_enum = RequirementTypeEnum(classification.lower())
            query = query.filter(RoleRequirementMatrix.requirement_type == req_enum)
        except ValueError:
            pass

    if priority:
        try:
            prio_enum = PriorityLevelEnum(priority.lower())
            query = query.filter(RoleRequirementMatrix.priority == prio_enum)
        except ValueError:
            pass

    if source_document_id:
        query = query.filter(RoleRequirementMatrix.source_document_id == source_document_id)

    reqs = query.order_by(RoleRequirementMatrix.created_at.desc()).all()
    results = []
    for r in reqs:
        role_obj = db.query(JobRole).filter(JobRole.role_id == r.job_role_id).first()
        prereqs = r.prerequisite_requirement_ids if isinstance(r.prerequisite_requirement_ids, list) else []
        results.append(
            MatrixRequirementResponseSchema(
                requirement_id=r.requirement_id,
                job_role_id=r.job_role_id,
                role_code=role_obj.role_code if role_obj else "",
                role_title=role_obj.title if role_obj else "",
                title=r.title or r.policy_requirement[:50],
                description=r.description,
                department=r.department or (role_obj.department if role_obj else None),
                policy_requirement=r.policy_requirement,
                process_requirement=r.process_requirement,
                required_competency=r.required_competency,
                is_mandatory=r.is_mandatory,
                requirement_type=r.requirement_type.value if hasattr(r.requirement_type, "value") else str(r.requirement_type),
                priority=r.priority.value if hasattr(r.priority, "value") else str(r.priority),
                due_stage=r.due_stage.value if hasattr(r.due_stage, "value") else str(r.due_stage),
                source_document_id=r.source_document_id,
                source_document_version=r.source_document_version or 1,
                source_section_id=r.source_section_id,
                source_location=r.source_location,
                prerequisite_requirement_ids=prereqs,
                required_task_description=r.required_task_description,
                required_assessment_topic=r.required_assessment_topic,
                is_active=r.is_active,
                created_at=r.created_at
            )
        )
    return results


@router.post("/matrix/requirements", response_model=MatrixRequirementResponseSchema, status_code=status.HTTP_201_CREATED)
def create_matrix_requirement(
    req: MatrixRequirementCreateSchema,
    db: Session = Depends(get_db),
    user_role: str = Depends(require_document_manager_role)
):
    """Adds a ground-truth requirement mapping to the Role Requirement Matrix with source validation."""
    try:
        payload = req.dict()
        matrix_item = matrix_manager.add_matrix_requirement(db, payload)
        role_obj = db.query(JobRole).filter(JobRole.role_id == matrix_item.job_role_id).first()
        prereqs = matrix_item.prerequisite_requirement_ids if isinstance(matrix_item.prerequisite_requirement_ids, list) else []

        return MatrixRequirementResponseSchema(
            requirement_id=matrix_item.requirement_id,
            job_role_id=matrix_item.job_role_id,
            role_code=role_obj.role_code if role_obj else "",
            role_title=role_obj.title if role_obj else "",
            title=matrix_item.title or matrix_item.policy_requirement[:50],
            description=matrix_item.description,
            department=matrix_item.department or (role_obj.department if role_obj else None),
            policy_requirement=matrix_item.policy_requirement,
            process_requirement=matrix_item.process_requirement,
            required_competency=matrix_item.required_competency,
            is_mandatory=matrix_item.is_mandatory,
            requirement_type=matrix_item.requirement_type.value if hasattr(matrix_item.requirement_type, "value") else str(matrix_item.requirement_type),
            priority=matrix_item.priority.value if hasattr(matrix_item.priority, "value") else str(matrix_item.priority),
            due_stage=matrix_item.due_stage.value if hasattr(matrix_item.due_stage, "value") else str(matrix_item.due_stage),
            source_document_id=matrix_item.source_document_id,
            source_document_version=matrix_item.source_document_version or 1,
            source_section_id=matrix_item.source_section_id,
            source_location=matrix_item.source_location,
            prerequisite_requirement_ids=prereqs,
            required_task_description=matrix_item.required_task_description,
            required_assessment_topic=matrix_item.required_assessment_topic,
            is_active=matrix_item.is_active,
            created_at=matrix_item.created_at
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/matrix/requirements/{identifier}")
def get_matrix_requirement(identifier: str, db: Session = Depends(get_db)):
    """Retrieves details for a specific matrix requirement or requirements for a role."""
    r = db.query(RoleRequirementMatrix).filter(RoleRequirementMatrix.requirement_id == identifier).first()
    if r:
        role_obj = db.query(JobRole).filter(JobRole.role_id == r.job_role_id).first()
        prereqs = r.prerequisite_requirement_ids if isinstance(r.prerequisite_requirement_ids, list) else []

        return MatrixRequirementResponseSchema(
            requirement_id=r.requirement_id,
            job_role_id=r.job_role_id,
            role_code=role_obj.role_code if role_obj else "",
            role_title=role_obj.title if role_obj else "",
            title=r.title or r.policy_requirement[:50],
            description=r.description,
            department=r.department or (role_obj.department if role_obj else None),
            policy_requirement=r.policy_requirement,
            process_requirement=r.process_requirement,
            required_competency=r.required_competency,
            is_mandatory=r.is_mandatory,
            requirement_type=r.requirement_type.value if hasattr(r.requirement_type, "value") else str(r.requirement_type),
            priority=r.priority.value if hasattr(r.priority, "value") else str(r.priority),
            due_stage=r.due_stage.value if hasattr(r.due_stage, "value") else str(r.due_stage),
            source_document_id=r.source_document_id,
            source_document_version=r.source_document_version or 1,
            source_section_id=r.source_section_id,
            source_location=r.source_location,
            prerequisite_requirement_ids=prereqs,
            required_task_description=r.required_task_description,
            required_assessment_topic=r.required_assessment_topic,
            is_active=r.is_active,
            created_at=r.created_at
        )

    # Check if identifier is a role code or role ID
    role = matrix_manager.get_role_by_id_or_code(db, identifier)
    if role:
        return get_role_requirements(role.role_id, db)

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Requirement or Role '{identifier}' not found.")


@router.put("/matrix/requirements/{requirement_id}", response_model=MatrixRequirementResponseSchema)
def update_matrix_requirement(
    requirement_id: str,
    req: MatrixRequirementUpdateSchema,
    db: Session = Depends(get_db),
    user_role: str = Depends(require_document_manager_role)
):
    """Updates an existing requirement in the Role Requirement Matrix."""
    try:
        payload = req.dict(exclude_unset=True)
        r = matrix_manager.update_matrix_requirement(db, requirement_id, payload)
        role_obj = db.query(JobRole).filter(JobRole.role_id == r.job_role_id).first()
        prereqs = r.prerequisite_requirement_ids if isinstance(r.prerequisite_requirement_ids, list) else []

        return MatrixRequirementResponseSchema(
            requirement_id=r.requirement_id,
            job_role_id=r.job_role_id,
            role_code=role_obj.role_code if role_obj else "",
            role_title=role_obj.title if role_obj else "",
            title=r.title or r.policy_requirement[:50],
            description=r.description,
            department=r.department or (role_obj.department if role_obj else None),
            policy_requirement=r.policy_requirement,
            process_requirement=r.process_requirement,
            required_competency=r.required_competency,
            is_mandatory=r.is_mandatory,
            requirement_type=r.requirement_type.value if hasattr(r.requirement_type, "value") else str(r.requirement_type),
            priority=r.priority.value if hasattr(r.priority, "value") else str(r.priority),
            due_stage=r.due_stage.value if hasattr(r.due_stage, "value") else str(r.due_stage),
            source_document_id=r.source_document_id,
            source_document_version=r.source_document_version or 1,
            source_section_id=r.source_section_id,
            source_location=r.source_location,
            prerequisite_requirement_ids=prereqs,
            required_task_description=r.required_task_description,
            required_assessment_topic=r.required_assessment_topic,
            is_active=r.is_active,
            created_at=r.created_at
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/matrix/requirements/{requirement_id}", status_code=status.HTTP_200_OK)
def delete_matrix_requirement(
    requirement_id: str,
    db: Session = Depends(get_db),
    user_role: str = Depends(require_document_manager_role)
):
    """Deactivates a matrix requirement."""
    try:
        matrix_manager.delete_matrix_requirement(db, requirement_id)
        return {"message": f"Requirement '{requirement_id}' deactivated successfully."}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("/matrix/document/{document_id}/requirements", response_model=List[MatrixRequirementResponseSchema])
def get_requirements_by_document(document_id: str, db: Session = Depends(get_db)):
    """Retrieves all requirements referencing a specific source document ID."""
    reqs = db.query(RoleRequirementMatrix).filter(
        RoleRequirementMatrix.source_document_id == document_id,
        RoleRequirementMatrix.is_active == True
    ).all()

    results = []
    for r in reqs:
        role_obj = db.query(JobRole).filter(JobRole.role_id == r.job_role_id).first()
        prereqs = r.prerequisite_requirement_ids if isinstance(r.prerequisite_requirement_ids, list) else []
        results.append(
            MatrixRequirementResponseSchema(
                requirement_id=r.requirement_id,
                job_role_id=r.job_role_id,
                role_code=role_obj.role_code if role_obj else "",
                role_title=role_obj.title if role_obj else "",
                title=r.title or r.policy_requirement[:50],
                description=r.description,
                department=r.department or (role_obj.department if role_obj else None),
                policy_requirement=r.policy_requirement,
                process_requirement=r.process_requirement,
                required_competency=r.required_competency,
                is_mandatory=r.is_mandatory,
                requirement_type=r.requirement_type.value if hasattr(r.requirement_type, "value") else str(r.requirement_type),
                priority=r.priority.value if hasattr(r.priority, "value") else str(r.priority),
                due_stage=r.due_stage.value if hasattr(r.due_stage, "value") else str(r.due_stage),
                source_document_id=r.source_document_id,
                source_document_version=r.source_document_version or 1,
                source_section_id=r.source_section_id,
                source_location=r.source_location,
                prerequisite_requirement_ids=prereqs,
                required_task_description=r.required_task_description,
                required_assessment_topic=r.required_assessment_topic,
                is_active=r.is_active,
                created_at=r.created_at
            )
        )
    return results


@router.get("/matrix/validate/{role_identifier}", response_model=MatrixValidationResponseSchema)
def validate_role_matrix(role_identifier: str, db: Session = Depends(get_db)):
    """Runs independent deterministic Python validation on a role's requirement matrix."""
    validation_res = matrix_validator.validate_matrix_integrity(db, role_identifier)
    if "error" in validation_res:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=validation_res["error"])
    return validation_res
