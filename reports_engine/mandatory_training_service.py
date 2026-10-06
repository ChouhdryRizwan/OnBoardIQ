"""
Mandatory Training Service — Tracks mandatory compliance training per requirement & employee.
100% Deterministic Python calculation.
"""

from typing import List, Optional
from sqlalchemy.orm import Session
from database.models import (
    RoleRequirementMatrix, JobRole, EmployeeProfile, User, OnboardingPlan,
    LearningModule, ManualReviewQueue
)
from schemas.report_schemas import MandatoryTrainingReportItem


def get_mandatory_training_report(
    db: Session,
    department: Optional[str] = None,
    role_code: Optional[str] = None,
    is_mandatory_only: bool = True
) -> List[MandatoryTrainingReportItem]:
    rrm_query = db.query(RoleRequirementMatrix).join(JobRole).filter(RoleRequirementMatrix.is_active == True)

    if is_mandatory_only:
        rrm_query = rrm_query.filter(RoleRequirementMatrix.is_mandatory == True)

    if department:
        rrm_query = rrm_query.filter(RoleRequirementMatrix.department.ilike(f"%{department.strip()}%"))
    if role_code:
        rrm_query = rrm_query.filter(JobRole.role_code.ilike(f"%{role_code.strip()}%"))

    requirements = rrm_query.all()
    results: List[MandatoryTrainingReportItem] = []

    for req in requirements:
        job_role = req.job_role
        employees = db.query(EmployeeProfile).filter(EmployeeProfile.job_role_id == req.job_role_id).all()

        for emp in employees:
            user = emp.user
            plan = db.query(OnboardingPlan).filter(
                OnboardingPlan.employee_id == emp.employee_id,
                OnboardingPlan.is_current_active == True
            ).first()

            matched_mod = None
            if plan:
                for stage in plan.stages:
                    for mod in stage.modules:
                        if mod.requirement_id == req.requirement_id or mod.source_document_id == req.source_document_id:
                            matched_mod = mod
                            break

            completion_status = "pending"
            assessment_status = "pending"

            if matched_mod:
                if matched_mod.is_completed:
                    completion_status = "completed"
                    assessment_status = "passed"
                else:
                    completion_status = "in_progress"

            val_status = plan.verification_status.value if plan and hasattr(plan.verification_status, 'value') else "verified"
            
            # Check manual review queue
            rev_queue = db.query(ManualReviewQueue).filter(
                ManualReviewQueue.plan_id == (plan.plan_id if plan else "")
            ).first()
            human_rev_status = rev_queue.status if rev_queue else "approved"

            item = MandatoryTrainingReportItem(
                requirement_id=req.requirement_id,
                requirement_title=req.title or req.requirement_id,
                role_code=job_role.role_code if job_role else "",
                role_title=job_role.title if job_role else "",
                employee_name=user.full_name if user else "Unassigned",
                department=emp.department,
                source_document_id=req.source_document_id,
                source_document_version=req.source_document_version,
                source_section_id=req.source_section_id,
                training_module_id=matched_mod.module_id if matched_mod else None,
                training_module_title=matched_mod.title if matched_mod else None,
                is_mandatory=req.is_mandatory,
                completion_status=completion_status,
                assessment_status=assessment_status,
                validation_status=val_status,
                human_review_status=human_rev_status
            )
            results.append(item)

    return results
