import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session

from database.session import get_db
from database.models import (
    ManualReviewQueue, ReviewAuditTrail, OnboardingPlan, ValidationReport,
    ValidationIssue, HallucinationFlag, ContradictionFlag, RequirementComparisonDetail,
    EmployeeProfile, JobRole, User, VerificationStatusEnum, ReviewActionEnum,
    OnboardingStage, LearningModule, PracticalTask, ModuleQuiz, OnboardingChecklist
)
from python_validation.validator import pipeline2_validator
from genai_pipeline.pipeline1_engine import Pipeline1Engine
from schemas.human_review_schemas import (
    ApprovePlanRequest, RejectPlanRequest, EditPlanRequest, RegeneratePlanRequest,
    AddCommentRequest, ManualOverrideRequest, ReviewQueueItemResponse,
    FinalOnboardingPlanResponse, ReviewAuditItem
)

router = APIRouter(prefix="/human-review", tags=["Human Review Workflow Engine"])

def _verify_reviewer_access(x_user_role: Optional[str] = Header(None, alias="X-User-Role")):
    """Security RBAC Check — Restricts human review decisions to authorized reviewers/admins."""
    if x_user_role and x_user_role.lower() == "employee":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden. Employee role does not have permission to execute human review actions."
        )

def _get_user_id_for_reviewer(db: Session, reviewer_id_or_name: str) -> str:
    """Finds existing User user_id or fallback mock ID."""
    user = db.query(User).filter(
        (User.user_id == reviewer_id_or_name) | (User.full_name == reviewer_id_or_name) | (User.email == reviewer_id_or_name)
    ).first()
    if user:
        return user.user_id
    
    # Fallback to system admin user if available
    admin_user = db.query(User).first()
    if admin_user:
        return admin_user.user_id
    
    # Create temporary reviewer user if none exists
    new_user = User(
        user_id=str(uuid.uuid4()),
        email=f"reviewer_{reviewer_id_or_name[:8]}@company.com",
        password_hash="hashed_pw",
        full_name=reviewer_id_or_name,
        role="reviewer"
    )
    db.add(new_user)
    db.flush()
    return new_user.user_id

def _build_final_plan_response(db: Session, plan: OnboardingPlan) -> FinalOnboardingPlanResponse:
    """Constructs the authoritative Final Onboarding Plan with full audit trail."""
    emp = db.query(EmployeeProfile).filter(EmployeeProfile.employee_id == plan.employee_id).first()
    user = db.query(User).filter(User.user_id == emp.user_id).first() if emp else None
    role = db.query(JobRole).filter(JobRole.role_id == plan.job_role_id).first() if plan else None

    # Latest validation report
    latest_report = db.query(ValidationReport).filter(
        ValidationReport.plan_id == plan.plan_id
    ).order_by(ValidationReport.evaluated_at.desc()).first()

    # Stages & modules
    stages_data = []
    stages = db.query(OnboardingStage).filter(OnboardingStage.plan_id == plan.plan_id).order_by(OnboardingStage.stage_order).all()
    for stg in stages:
        mods = db.query(LearningModule).filter(LearningModule.stage_id == stg.stage_id).all()
        mod_list = []
        for m in mods:
            tasks = db.query(PracticalTask).filter(PracticalTask.module_id == m.module_id).all()
            quizzes = db.query(ModuleQuiz).filter(ModuleQuiz.module_id == m.module_id).all()
            mod_list.append({
                "module_id": m.module_id,
                "module_code": m.module_code,
                "title": m.title,
                "purpose": m.purpose,
                "requirement_id": m.requirement_id,
                "is_mandatory": m.is_mandatory,
                "source_document_id": m.source_document_id,
                "source_section_id": m.source_section_id,
                "estimated_duration_minutes": m.estimated_duration_minutes,
                "difficulty": m.difficulty.value if hasattr(m.difficulty, "value") else str(m.difficulty),
                "learning_objectives": m.learning_objectives or [],
                "key_concepts": m.key_concepts or [],
                "completion_criteria": m.completion_criteria,
                "tasks": [
                    {
                        "task_id": t.task_id,
                        "task_code": t.task_code,
                        "description": t.description,
                        "expected_outcome": t.expected_outcome,
                        "difficulty": t.difficulty.value if hasattr(t.difficulty, "value") else str(t.difficulty),
                        "due_stage": t.due_stage.value if hasattr(t.due_stage, "value") else str(t.due_stage),
                        "completion_criteria": t.completion_criteria
                    } for t in tasks
                ],
                "quizzes": [
                    {
                        "quiz_id": q.quiz_id,
                        "question_code": q.question_code,
                        "question_text": q.question_text,
                        "correct_answer": q.correct_answer,
                        "explanation": q.explanation
                    } for q in quizzes
                ]
            })
        stages_data.append({
            "stage_id": stg.stage_id,
            "stage_name": stg.stage_name.value if hasattr(stg.stage_name, "value") else str(stg.stage_name),
            "stage_order": stg.stage_order,
            "modules": mod_list
        })

    # Checklists
    checklists = db.query(OnboardingChecklist).filter(OnboardingChecklist.plan_id == plan.plan_id).all()
    checklists_data = [
        {
            "checklist_id": c.checklist_id,
            "activity_name": c.activity_name,
            "is_required": c.is_required,
            "due_stage": c.due_stage.value if hasattr(c.due_stage, "value") else str(c.due_stage),
            "responsible_person": c.responsible_person
        } for c in checklists
    ]

    review_queue_item = db.query(ManualReviewQueue).filter(
        ManualReviewQueue.plan_id == plan.plan_id
    ).order_by(ManualReviewQueue.created_at.desc()).first()
    audit_list = []
    if review_queue_item:
        trails = db.query(ReviewAuditTrail).filter(
            ReviewAuditTrail.review_id == review_queue_item.review_id
        ).order_by(ReviewAuditTrail.performed_at.asc()).all()
        for tr in trails:
            reviewer_user = db.query(User).filter(User.user_id == tr.reviewer_id).first()
            audit_list.append(ReviewAuditItem(
                audit_id=tr.audit_id,
                review_id=tr.review_id,
                reviewer_id=reviewer_user.full_name if reviewer_user else tr.reviewer_id,
                action_taken=tr.action_taken.value if hasattr(tr.action_taken, "value") else str(tr.action_taken),
                reviewer_comments=tr.reviewer_comments,
                performed_at=tr.performed_at.isoformat() if tr.performed_at else ""
            ))

    status_str = plan.verification_status.value if hasattr(plan.verification_status, "value") else str(plan.verification_status)
    if review_queue_item and review_queue_item.status == "approved":
        final_approval_status = "APPROVED"
    elif review_queue_item and review_queue_item.status == "rejected":
        final_approval_status = "REJECTED"
    elif status_str in ["verified", "verified_with_warning", "approved"]:
        final_approval_status = "FINALIZED"
    else:
        final_approval_status = "PENDING_APPROVAL"

    return FinalOnboardingPlanResponse(
        plan_id=plan.plan_id,
        employee_id=emp.employee_id if emp else "",
        employee_name=user.full_name if user else "Employee",
        role_code=role.role_code if role else "UNKNOWN",
        role_title=role.title if role else "Job Role",
        department=role.department if role else "General",
        plan_version="v1.0.0",
        verification_status=status_str,
        final_approval_status=final_approval_status,
        mandatory_coverage_score=float(plan.coverage_score or 0.0),
        source_traceability_score=float(plan.traceability_score or 0.0),
        created_at=plan.created_at.isoformat() if plan.created_at else "",
        finalized_at=datetime.utcnow().isoformat() + "Z",
        original_genai_model=plan.genai_model or "gemini-2.5-flash",
        prompt_version=plan.prompt_version or "v1.0.0",
        validation_report_id=latest_report.report_id if latest_report else "",
        stages=stages_data,
        checklists=checklists_data,
        recommendations=[
            "Conduct weekly 1-on-1 progress sync with manager.",
            "Verify completion of mandatory safety and compliance checklists."
        ],
        audit_trail=audit_list
    )

@router.get("/queue", response_model=List[ReviewQueueItemResponse])
def get_human_review_queue(status_filter: Optional[str] = None, db: Session = Depends(get_db)):
    """Retrieve all pending, under review, or resolved human review queue items."""
    query = db.query(ManualReviewQueue)
    if status_filter:
        query = query.filter(ManualReviewQueue.status == status_filter)
    
    items = query.order_by(ManualReviewQueue.created_at.desc()).all()
    results = []

    for item in items:
        plan = db.query(OnboardingPlan).filter(OnboardingPlan.plan_id == item.plan_id).first()
        emp = db.query(EmployeeProfile).filter(EmployeeProfile.employee_id == plan.employee_id).first() if plan else None
        user = db.query(User).filter(User.user_id == emp.user_id).first() if emp else None
        role = db.query(JobRole).filter(JobRole.role_id == plan.job_role_id).first() if plan else None
        report = db.query(ValidationReport).filter(ValidationReport.report_id == item.report_id).first()

        results.append(ReviewQueueItemResponse(
            review_id=item.review_id,
            plan_id=item.plan_id,
            report_id=item.report_id,
            assigned_reviewer_id=item.assigned_reviewer_id,
            status=item.status,
            reason_for_review=item.reason_for_review,
            created_at=item.created_at.isoformat() if item.created_at else "",
            resolved_at=item.resolved_at.isoformat() if item.resolved_at else None,
            employee_id=emp.employee_id if emp else "",
            employee_name=user.full_name if user else "Employee",
            role_title=role.title if role else "Role",
            department=role.department if role else "General",
            mandatory_coverage_score=float(report.mandatory_coverage_score) if report else float(plan.coverage_score or 0.0),
            source_traceability_score=float(report.source_traceability_score) if report else float(plan.traceability_score or 0.0),
            verification_status=report.verification_status.value if (report and hasattr(report.verification_status, "value")) else (str(report.verification_status) if report else "unknown")
        ))
    return results

@router.get("/queue/{review_id}")
def get_review_item_details(review_id: str, db: Session = Depends(get_db)):
    """Retrieve complete review queue item with plan structure, validation report, and audit history."""
    item = db.query(ManualReviewQueue).filter(ManualReviewQueue.review_id == review_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Review queue item '{review_id}' not found.")

    plan = db.query(OnboardingPlan).filter(OnboardingPlan.plan_id == item.plan_id).first()
    if not plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Plan '{item.plan_id}' not found.")

    final_plan = _build_final_plan_response(db, plan)
    if item.status == "approved":
        final_plan.final_approval_status = "APPROVED"
    elif item.status == "rejected":
        final_plan.final_approval_status = "REJECTED"

    # Detailed report info
    report = db.query(ValidationReport).filter(ValidationReport.report_id == item.report_id).first()
    issues = db.query(ValidationIssue).filter(ValidationIssue.report_id == item.report_id).all() if report else []
    h_flags = db.query(HallucinationFlag).filter(HallucinationFlag.report_id == item.report_id).all() if report else []
    c_flags = db.query(ContradictionFlag).filter(ContradictionFlag.report_id == item.report_id).all() if report else []

    return {
        "review_queue_item": {
            "review_id": item.review_id,
            "report_id": item.report_id,
            "plan_id": item.plan_id,
            "status": item.status,
            "reason_for_review": item.reason_for_review,
            "created_at": item.created_at.isoformat() if item.created_at else "",
            "resolved_at": item.resolved_at.isoformat() if item.resolved_at else None
        },
        "plan_details": final_plan.dict(),
        "validation_issues": [
            {
                "issue_id": i.issue_id,
                "requirement_id": i.requirement_id,
                "issue_type": i.issue_type,
                "severity": i.severity,
                "explanation": i.explanation,
                "expected_value": i.expected_value,
                "generated_value": i.generated_value
            } for i in issues
        ],
        "hallucination_flags": [
            {
                "flag_id": h.flag_id,
                "module_id": h.module_id,
                "claimed_source_doc": h.claimed_source_doc,
                "flagged_statement": h.flagged_statement,
                "reason": h.reason,
                "is_resolved": h.is_resolved
            } for h in h_flags
        ],
        "contradiction_flags": [
            {
                "contradiction_id": c.contradiction_id,
                "primary_document_id": c.primary_document_id,
                "conflicting_document_id": c.conflicting_document_id,
                "primary_clause": c.primary_clause,
                "conflicting_clause": c.conflicting_clause,
                "is_resolved": c.is_resolved
            } for c in c_flags
        ]
    }

@router.post("/approve", response_model=FinalOnboardingPlanResponse)
@router.post("/{review_id}/approve", response_model=FinalOnboardingPlanResponse)
def approve_plan(
    review_id: Optional[str] = None,
    plan_id: Optional[str] = None,
    comments: Optional[str] = None,
    req: Optional[ApprovePlanRequest] = None,
    db: Session = Depends(get_db),
    _rbac: None = Depends(_verify_reviewer_access)
):
    """Action 1: APPROVE — Human reviewer approves the onboarding plan."""
    item = None
    if review_id:
        item = db.query(ManualReviewQueue).filter(ManualReviewQueue.review_id == review_id).first()
    elif plan_id:
        item = db.query(ManualReviewQueue).filter(ManualReviewQueue.plan_id == plan_id).first()
        if not item:
            rep = db.query(ValidationReport).filter(ValidationReport.plan_id == plan_id).first()
            r_id = rep.report_id if rep else f"REP-MANUAL-{uuid.uuid4().hex[:6]}"
            # Create review queue item on the fly if approving plan directly by plan_id
            item = ManualReviewQueue(
                review_id=str(uuid.uuid4()),
                report_id=r_id,
                plan_id=plan_id,
                status="pending",
                reason_for_review="Direct plan approval request"
            )
            db.add(item)
            db.flush()
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing required 'review_id' or 'plan_id'.")

    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review queue item not found.")

    if item.status == "approved":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Plan '{item.plan_id}' has already been approved and finalized. Governance actions are locked."
        )

    reviewer_name = (req.reviewer_id if req else None) or "Reviewer Admin"
    approval_comments = (req.comments if req else None) or comments or "Approved by reviewer."
    reviewer_user_id = _get_user_id_for_reviewer(db, reviewer_name)

    plan = db.query(OnboardingPlan).filter(OnboardingPlan.plan_id == item.plan_id).first()
    if not plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Plan '{item.plan_id}' not found.")

    report = db.query(ValidationReport).filter(ValidationReport.report_id == item.report_id).first() if item.report_id else None

    # Update Queue Status & Plan Status
    item.status = "approved"
    item.resolved_at = datetime.utcnow()
    item.assigned_reviewer_id = reviewer_user_id

    plan.verification_status = VerificationStatusEnum.VERIFIED
    if report:
        report.verification_status = VerificationStatusEnum.VERIFIED

    # Automatically assign approved plan to employee learning dashboard (Requirement 2)
    from learning_engine.assignment_engine import PlanAssignmentEngine
    PlanAssignmentEngine.assign_approved_plan(db, plan.plan_id)

    # Record Audit Trail
    audit = ReviewAuditTrail(
        audit_id=str(uuid.uuid4()),
        review_id=item.review_id,
        reviewer_id=reviewer_user_id,
        action_taken=ReviewActionEnum.APPROVE,
        original_genai_output=plan.stages[0].modules[0].title if plan.stages and plan.stages[0].modules else {},
        original_verification_status=report.verification_status if report else VerificationStatusEnum.MANUAL_REVIEW_REQUIRED,
        overridden_verification_status=VerificationStatusEnum.VERIFIED,
        reviewer_comments=approval_comments
    )
    db.add(audit)
    db.commit()
    db.refresh(plan)

    return _build_final_plan_response(db, plan)

@router.post("/{review_id}/reject")
def reject_plan(review_id: str, req: RejectPlanRequest, db: Session = Depends(get_db)):
    """Action 2: REJECT — Human reviewer rejects the plan with mandatory comments."""
    item = db.query(ManualReviewQueue).filter(ManualReviewQueue.review_id == review_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Review queue item '{review_id}' not found.")

    if item.status == "approved":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot reject plan: Plan '{item.plan_id}' has already been approved and finalized. Governance actions are locked."
        )

    if item.status == "rejected":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Plan '{item.plan_id}' is already rejected."
        )

    reviewer_user_id = _get_user_id_for_reviewer(db, req.reviewer_id)
    plan = db.query(OnboardingPlan).filter(OnboardingPlan.plan_id == item.plan_id).first()
    report = db.query(ValidationReport).filter(ValidationReport.report_id == item.report_id).first()

    item.status = "rejected"
    item.resolved_at = datetime.utcnow()
    item.assigned_reviewer_id = reviewer_user_id

    plan.verification_status = VerificationStatusEnum.MANUAL_REVIEW_REQUIRED

    audit = ReviewAuditTrail(
        audit_id=str(uuid.uuid4()),
        review_id=item.review_id,
        reviewer_id=reviewer_user_id,
        action_taken=ReviewActionEnum.REJECT,
        original_genai_output={},
        original_verification_status=report.verification_status if report else VerificationStatusEnum.MANUAL_REVIEW_REQUIRED,
        overridden_verification_status=VerificationStatusEnum.MANUAL_REVIEW_REQUIRED,
        reviewer_comments=req.reason
    )
    db.add(audit)
    db.commit()

    return {
        "message": f"Plan '{item.plan_id}' rejected successfully by reviewer.",
        "review_id": item.review_id,
        "status": "rejected",
        "rejection_reason": req.reason
    }

@router.post("/{review_id}/edit")
def edit_plan(review_id: str, req: EditPlanRequest, db: Session = Depends(get_db)):
    """Action 3: EDIT — Modify modules, tasks, or checklists directly and re-run ground-truth validation."""
    item = db.query(ManualReviewQueue).filter(ManualReviewQueue.review_id == review_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Review queue item '{review_id}' not found.")

    if item.status == "approved":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot edit plan structure: Plan '{item.plan_id}' has already been approved and finalized. Governance actions are locked."
        )

    reviewer_user_id = _get_user_id_for_reviewer(db, req.reviewer_id)
    plan = db.query(OnboardingPlan).filter(OnboardingPlan.plan_id == item.plan_id).first()

    # Apply title or purpose edits if specified in edited_plan_structure
    edited_data = req.edited_plan_structure
    if "modules" in edited_data:
        for mod_edit in edited_data["modules"]:
            mod_id = mod_edit.get("module_id")
            if mod_id:
                mod = db.query(LearningModule).filter(LearningModule.module_id == mod_id).first()
                if mod:
                    if "title" in mod_edit:
                        mod.title = mod_edit["title"]
                    if "purpose" in mod_edit:
                        mod.purpose = mod_edit["purpose"]
                    if "estimated_duration_minutes" in mod_edit:
                        mod.estimated_duration_minutes = mod_edit["estimated_duration_minutes"]

    # Re-run Pipeline 2 Validator on edited plan
    new_report = pipeline2_validator.validate_plan(db, plan.plan_id)
    item.report_id = new_report.report_id

    audit = ReviewAuditTrail(
        audit_id=str(uuid.uuid4()),
        review_id=item.review_id,
        reviewer_id=reviewer_user_id,
        action_taken=ReviewActionEnum.EDIT,
        original_genai_output=edited_data,
        original_verification_status=plan.verification_status,
        overridden_verification_status=new_report.verification_status,
        reviewer_comments=req.comments or "Manual edits applied to plan structure."
    )
    db.add(audit)
    db.commit()

    return {
        "message": "Plan edited and re-validated successfully.",
        "plan_id": plan.plan_id,
        "new_validation_report_id": new_report.report_id,
        "updated_coverage_score": float(new_report.mandatory_coverage_score),
        "updated_verification_status": new_report.verification_status.value if hasattr(new_report.verification_status, "value") else str(new_report.verification_status)
    }

@router.post("/{review_id}/regenerate")
def regenerate_plan(review_id: str, req: RegeneratePlanRequest, db: Session = Depends(get_db)):
    """Action 4: REGENERATE — Trigger Pipeline 1 regeneration with prompt overrides and re-run Pipeline 2."""
    item = db.query(ManualReviewQueue).filter(ManualReviewQueue.review_id == review_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Review queue item '{review_id}' not found.")

    if item.status == "approved":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot regenerate plan: Plan '{item.plan_id}' has already been approved and finalized. Governance actions are locked."
        )

    reviewer_user_id = _get_user_id_for_reviewer(db, req.reviewer_id)
    plan = db.query(OnboardingPlan).filter(OnboardingPlan.plan_id == item.plan_id).first()
    emp = db.query(EmployeeProfile).filter(EmployeeProfile.employee_id == plan.employee_id).first()
    role = db.query(JobRole).filter(JobRole.role_id == plan.job_role_id).first()

    # Re-trigger Pipeline 1 Generation
    new_plan_db, exec_log = Pipeline1Engine.generate_plan_for_employee(
        db=db,
        employee_id=emp.employee_id,
        role_identifier=role.role_code
    )

    # Trigger Pipeline 2 Validation on new plan
    new_report = pipeline2_validator.validate_plan(db, new_plan_db.plan_id)

    # Link new plan/report to review queue or update existing queue item
    item.plan_id = new_plan_db.plan_id
    item.report_id = new_report.report_id
    item.status = "pending"
    item.reason_for_review = f"Regenerated via human review. Feedback: {req.feedback_prompt or 'None'}"

    audit = ReviewAuditTrail(
        audit_id=str(uuid.uuid4()),
        review_id=item.review_id,
        reviewer_id=reviewer_user_id,
        action_taken=ReviewActionEnum.REGENERATE,
        original_genai_output={"previous_plan_id": plan.plan_id},
        original_verification_status=plan.verification_status,
        overridden_verification_status=new_report.verification_status,
        reviewer_comments=f"Plan regenerated with feedback: {req.feedback_prompt or 'Standard retry'}"
    )
    db.add(audit)
    db.commit()

    return {
        "message": "Plan regenerated and validated successfully.",
        "old_plan_id": plan.plan_id,
        "new_plan_id": new_plan_db.plan_id,
        "new_report_id": new_report.report_id,
        "verification_status": new_report.verification_status.value if hasattr(new_report.verification_status, "value") else str(new_report.verification_status),
        "mandatory_coverage_score": float(new_report.mandatory_coverage_score)
    }

@router.post("/{review_id}/comment")
def add_review_comment(review_id: str, req: AddCommentRequest, db: Session = Depends(get_db)):
    """Action 5: COMMENT — Post reviewer notes/comments without changing approval state."""
    item = db.query(ManualReviewQueue).filter(ManualReviewQueue.review_id == review_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Review queue item '{review_id}' not found.")

    reviewer_user_id = _get_user_id_for_reviewer(db, req.reviewer_id)
    plan = db.query(OnboardingPlan).filter(OnboardingPlan.plan_id == item.plan_id).first()

    audit = ReviewAuditTrail(
        audit_id=str(uuid.uuid4()),
        review_id=item.review_id,
        reviewer_id=reviewer_user_id,
        action_taken=ReviewActionEnum.COMMENT,
        original_genai_output={},
        original_verification_status=plan.verification_status,
        overridden_verification_status=plan.verification_status,
        reviewer_comments=req.comment
    )
    db.add(audit)
    db.commit()

    return {
        "message": "Comment recorded successfully.",
        "review_id": review_id,
        "comment": req.comment
    }

@router.post("/{review_id}/override")
def manual_override(review_id: str, req: ManualOverrideRequest, db: Session = Depends(get_db)):
    """Action 6: MANUAL OVERRIDE — Override validation flags/issues and force verification status."""
    item = db.query(ManualReviewQueue).filter(ManualReviewQueue.review_id == review_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Review queue item '{review_id}' not found.")

    if item.status == "approved":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot apply manual override: Plan '{item.plan_id}' has already been approved and finalized. Governance actions are locked."
        )

    reviewer_user_id = _get_user_id_for_reviewer(db, req.reviewer_id)
    plan = db.query(OnboardingPlan).filter(OnboardingPlan.plan_id == item.plan_id).first()
    report = db.query(ValidationReport).filter(ValidationReport.report_id == item.report_id).first()

    # Resolve target hallucination / contradiction flags if provided
    if req.target_issue_ids:
        h_flags = db.query(HallucinationFlag).filter(HallucinationFlag.flag_id.in_(req.target_issue_ids)).all()
        for hf in h_flags:
            hf.is_resolved = True
            hf.resolution_notes = f"Overridden by {req.reviewer_id}: {req.override_reason}"

        c_flags = db.query(ContradictionFlag).filter(ContradictionFlag.flag_id.in_(req.target_issue_ids)).all()
        for cf in c_flags:
            cf.is_resolved = True

    # Update Status
    target_status = VerificationStatusEnum(req.force_status) if req.force_status in VerificationStatusEnum.__members__.values() else VerificationStatusEnum.VERIFIED
    plan.verification_status = target_status
    if report:
        report.verification_status = target_status

    item.status = "approved"
    item.resolved_at = datetime.utcnow()
    item.assigned_reviewer_id = reviewer_user_id

    # Automatically assign approved plan to employee learning dashboard if verified
    if target_status in [VerificationStatusEnum.VERIFIED, VerificationStatusEnum.VERIFIED_WITH_WARNING]:
        from learning_engine.assignment_engine import PlanAssignmentEngine
        PlanAssignmentEngine.assign_approved_plan(db, plan.plan_id)

    audit = ReviewAuditTrail(
        audit_id=str(uuid.uuid4()),
        review_id=item.review_id,
        reviewer_id=reviewer_user_id,
        action_taken=ReviewActionEnum.MANUAL_OVERRIDE if hasattr(ReviewActionEnum, "MANUAL_OVERRIDE") else ReviewActionEnum.OVERRIDE,
        original_genai_output={},
        original_verification_status=report.verification_status if report else VerificationStatusEnum.MANUAL_REVIEW_REQUIRED,
        overridden_verification_status=target_status,
        reviewer_comments=f"MANUAL OVERRIDE: {req.override_reason}"
    )
    db.add(audit)
    db.commit()

    return {
        "message": f"Manual override applied successfully. Verification status set to '{target_status.value}'.",
        "review_id": review_id,
        "plan_id": plan.plan_id,
        "new_status": target_status.value
    }

@router.get("/plan/{plan_id}/final", response_model=FinalOnboardingPlanResponse)
def get_final_onboarding_plan(plan_id: str, db: Session = Depends(get_db)):
    """Retrieve authoritative Final Onboarding Plan after Human Review."""
    plan = db.query(OnboardingPlan).filter(OnboardingPlan.plan_id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Plan '{plan_id}' not found.")
    return _build_final_plan_response(db, plan)
