import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query, Header
from sqlalchemy.orm import Session

from database.session import get_db
from database.models import (
    CompanyDocument, PolicyUpdateRecord, AffectedRequirementImpact, AffectedModuleImpact,
    PolicyAuditEvent, OnboardingPlan, EmployeeProfile, JobRole, User, LearningModule, EmployeeLearningPlan
)
from policy_engine.impact_analyzer import impact_analyzer
from policy_engine.selective_regenerator import selective_regenerator
from policy_engine.audit_logger import audit_logger
from schemas.policy_update_schemas import (
    PolicyUpdateSummaryResponse, AffectedRequirementResponse, AffectedPlanResponse,
    AffectedEmployeeResponse, RegenerationStatusResponse, PolicyAuditEventResponse
)

router = APIRouter(prefix="/policy-updates", tags=["Policy Update Detection & Selective Regeneration"])

def _verify_admin_access(x_user_role: Optional[str] = Header(None, alias="X-User-Role")):
    """Requirement 16: Security RBAC — Only authorized users can trigger policy analysis/regeneration."""
    if x_user_role and x_user_role.lower() == "employee":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden. Employees cannot trigger policy analysis or selective regeneration."
        )

@router.get("", response_model=List[PolicyUpdateSummaryResponse])
def list_policy_updates(db: Session = Depends(get_db)):
    """List all detected policy updates."""
    records = db.query(PolicyUpdateRecord).order_by(PolicyUpdateRecord.detected_at.desc()).all()
    results = []
    for r in records:
        doc = db.query(CompanyDocument).filter(CompanyDocument.document_id == r.document_id).first()
        results.append(PolicyUpdateSummaryResponse(
            update_id=r.update_id,
            document_id=r.document_id,
            document_title=doc.title if doc else r.document_id,
            old_version=r.old_version,
            new_version=r.new_version,
            change_type=r.change_type,
            affected_roles_count=r.affected_roles_count,
            affected_plans_count=r.affected_plans_count,
            affected_modules_count=r.affected_modules_count,
            affected_employees_count=r.affected_employees_count,
            status=r.status,
            detected_at=r.detected_at.isoformat() if r.detected_at else ""
        ))
    return results

@router.post("/policies/{document_id}/versions/{version}/impact-analysis", response_model=PolicyUpdateSummaryResponse)
def trigger_impact_analysis(
    document_id: str,
    version: int,
    db: Session = Depends(get_db),
    _rbac: None = Depends(_verify_admin_access)
):
    """Trigger deterministic impact analysis for a policy document version update."""
    try:
        rec = impact_analyzer.analyze_policy_impact(db, document_id, version)
        doc = db.query(CompanyDocument).filter(CompanyDocument.document_id == document_id).first()
        return PolicyUpdateSummaryResponse(
            update_id=rec.update_id,
            document_id=rec.document_id,
            document_title=doc.title if doc else rec.document_id,
            old_version=rec.old_version,
            new_version=rec.new_version,
            change_type=rec.change_type,
            affected_roles_count=rec.affected_roles_count,
            affected_plans_count=rec.affected_plans_count,
            affected_modules_count=rec.affected_modules_count,
            affected_employees_count=rec.affected_employees_count,
            status=rec.status,
            detected_at=rec.detected_at.isoformat() if rec.detected_at else ""
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

@router.get("/{update_id}", response_model=PolicyUpdateSummaryResponse)
def get_policy_update_summary(update_id: str, db: Session = Depends(get_db)):
    """Retrieve policy update summary by update_id."""
    rec = db.query(PolicyUpdateRecord).filter(PolicyUpdateRecord.update_id == update_id).first()
    if not rec:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Policy update '{update_id}' not found.")

    doc = db.query(CompanyDocument).filter(CompanyDocument.document_id == rec.document_id).first()
    return PolicyUpdateSummaryResponse(
        update_id=rec.update_id,
        document_id=rec.document_id,
        document_title=doc.title if doc else rec.document_id,
        old_version=rec.old_version,
        new_version=rec.new_version,
        change_type=rec.change_type,
        affected_roles_count=rec.affected_roles_count,
        affected_plans_count=rec.affected_plans_count,
        affected_modules_count=rec.affected_modules_count,
        affected_employees_count=rec.affected_employees_count,
        status=rec.status,
        detected_at=rec.detected_at.isoformat() if rec.detected_at else ""
    )

@router.get("/{update_id}/requirements", response_model=List[AffectedRequirementResponse])
def get_affected_requirements(update_id: str, db: Session = Depends(get_db)):
    """Retrieve affected RRM requirements for a policy update."""
    impacts = db.query(AffectedRequirementImpact).filter(AffectedRequirementImpact.update_id == update_id).all()
    return [
        AffectedRequirementResponse(
            impact_item_id=i.impact_item_id,
            requirement_id=i.requirement_id,
            old_source_version=i.old_source_version,
            new_source_version=i.new_source_version,
            change_type=i.change_type,
            affected_roles=i.affected_roles or []
        ) for i in impacts
    ]

@router.get("/{update_id}/plans", response_model=List[AffectedPlanResponse])
def get_affected_plans(update_id: str, db: Session = Depends(get_db)):
    """Retrieve affected onboarding plans for a policy update."""
    impacts = db.query(AffectedModuleImpact).filter(AffectedModuleImpact.update_id == update_id).all()
    results = []
    seen_plans = set()

    for i in impacts:
        if i.plan_id in seen_plans:
            continue
        seen_plans.add(i.plan_id)

        plan = db.query(OnboardingPlan).filter(OnboardingPlan.plan_id == i.plan_id).first()
        emp = db.query(EmployeeProfile).filter(EmployeeProfile.employee_id == plan.employee_id).first() if plan else None
        user = db.query(User).filter(User.user_id == emp.user_id).first() if emp else None
        role = db.query(JobRole).filter(JobRole.role_id == plan.job_role_id).first() if plan else None

        mod_count = db.query(AffectedModuleImpact).filter(
            AffectedModuleImpact.update_id == update_id,
            AffectedModuleImpact.plan_id == i.plan_id
        ).count()

        results.append(AffectedPlanResponse(
            plan_id=i.plan_id,
            employee_id=emp.employee_id if emp else "",
            employee_name=user.full_name if user else "Employee",
            role_title=role.title if role else "Role",
            department=role.department if role else "General",
            affected_modules_count=mod_count,
            status=i.status
        ))
    return results

@router.get("/{update_id}/employees", response_model=List[AffectedEmployeeResponse])
def get_affected_employees(update_id: str, db: Session = Depends(get_db)):
    """Retrieve affected employees and their current learning plan progress."""
    rec = db.query(PolicyUpdateRecord).filter(PolicyUpdateRecord.update_id == update_id).first()
    if not rec:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Policy update '{update_id}' not found.")

    impacts = db.query(AffectedModuleImpact).filter(AffectedModuleImpact.update_id == update_id).all()
    results = []

    for i in impacts:
        plan = db.query(OnboardingPlan).filter(OnboardingPlan.plan_id == i.plan_id).first()
        if not plan:
            continue

        emp = db.query(EmployeeProfile).filter(EmployeeProfile.employee_id == plan.employee_id).first()
        user = db.query(User).filter(User.user_id == emp.user_id).first() if emp else None
        role = db.query(JobRole).filter(JobRole.role_id == plan.job_role_id).first() if plan else None
        mod = db.query(LearningModule).filter(LearningModule.module_id == i.module_id).first()
        learn_plan = db.query(EmployeeLearningPlan).filter(EmployeeLearningPlan.employee_id == emp.employee_id).first() if emp else None

        results.append(AffectedEmployeeResponse(
            employee_id=emp.employee_id if emp else "",
            employee_name=user.full_name if user else "Employee",
            role_title=role.title if role else "Role",
            department=role.department if role else "General",
            plan_id=i.plan_id,
            affected_module_title=mod.title if mod else "Module",
            reason=f"Source policy '{rec.document_id}' updated from v{rec.old_version} to v{rec.new_version}.",
            old_version=rec.old_version,
            new_version=rec.new_version,
            current_progress=float(learn_plan.overall_progress_percentage) if learn_plan else 0.0
        ))
    return results

@router.post("/{update_id}/regenerate", response_model=RegenerationStatusResponse)
def trigger_selective_regeneration(
    update_id: str,
    db: Session = Depends(get_db),
    _rbac: None = Depends(_verify_admin_access)
):
    """Trigger selective module regeneration via Pipeline 1 & re-validation via Pipeline 2."""
    try:
        res = selective_regenerator.regenerate_affected_content(db, update_id)
        return RegenerationStatusResponse(
            update_id=update_id,
            status=res["status"],
            total_affected_modules=res["total_affected_modules"],
            regenerated_count=res["regenerated_count"],
            validated_count=res["validated_count"],
            review_required_count=res["review_required_count"]
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

@router.get("/{update_id}/regeneration-status", response_model=RegenerationStatusResponse)
def get_regeneration_status(update_id: str, db: Session = Depends(get_db)):
    """Retrieve regeneration progress status."""
    rec = db.query(PolicyUpdateRecord).filter(PolicyUpdateRecord.update_id == update_id).first()
    if not rec:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Policy update '{update_id}' not found.")

    impacts = db.query(AffectedModuleImpact).filter(AffectedModuleImpact.update_id == update_id).all()
    regen_cnt = sum(1 for i in impacts if i.status in ["regenerated", "validated", "review_required", "published"])
    val_cnt = sum(1 for i in impacts if i.status in ["validated", "published"])
    rev_cnt = sum(1 for i in impacts if i.status == "review_required")

    return RegenerationStatusResponse(
        update_id=update_id,
        status=rec.status,
        total_affected_modules=len(impacts),
        regenerated_count=regen_cnt,
        validated_count=val_cnt,
        review_required_count=rev_cnt
    )

@router.get("/{update_id}/history", response_model=List[PolicyAuditEventResponse])
def get_policy_update_audit_history(update_id: str, db: Session = Depends(get_db)):
    """Retrieve full audit event log history for a policy update."""
    events = db.query(PolicyAuditEvent).order_by(PolicyAuditEvent.performed_at.asc()).all()
    return [
        PolicyAuditEventResponse(
            event_id=e.event_id,
            event_type=e.event_type,
            username=e.username,
            entity_type=e.entity_type,
            entity_id=e.entity_id,
            old_value=e.old_value,
            new_value=e.new_value,
            reason=e.reason,
            performed_at=e.performed_at.isoformat() if e.performed_at else ""
        ) for e in events
    ]
