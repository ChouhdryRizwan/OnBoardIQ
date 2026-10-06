"""
Hallucination & Unsupported Content Report Service — Leverages Pipeline 2 validation results & flags.
100% Deterministic Python execution.
"""

from typing import List, Optional
from sqlalchemy.orm import Session
from database.models import (
    ValidationReport, HallucinationFlag, ContradictionFlag, ValidationIssue,
    OnboardingPlan, EmployeeProfile, User, JobRole, ManualReviewQueue, ReviewAuditTrail
)
from schemas.report_schemas import HallucinationReportItem


def get_hallucination_report(
    db: Session,
    flag_type: Optional[str] = None,
    severity: Optional[str] = None,
    review_status: Optional[str] = None
) -> List[HallucinationReportItem]:
    reports = db.query(ValidationReport).all()
    results: List[HallucinationReportItem] = []

    for val_report in reports:
        plan = val_report.plan
        if not plan:
            continue

        emp = plan.employee
        user = emp.user if emp else None
        job_role = emp.job_role if emp else None
        val_status = plan.verification_status.value if hasattr(plan.verification_status, 'value') else str(plan.verification_status)

        # Check review queue for human decision
        rev_queue = db.query(ManualReviewQueue).filter(ManualReviewQueue.plan_id == plan.plan_id).first()
        rev_status = rev_queue.status if rev_queue else ("pending" if val_report.hallucination_flags or val_report.contradiction_flags else "resolved")
        
        audit_trail = db.query(ReviewAuditTrail).filter(ReviewAuditTrail.review_id == rev_queue.review_id).first() if rev_queue else None
        human_decision = audit_trail.action_taken.value if audit_trail and hasattr(audit_trail.action_taken, 'value') else None

        # 1. Process explicit HallucinationFlags
        for hflag in val_report.hallucination_flags:
            f_type = "hallucination"
            if flag_type and flag_type.lower() != f_type:
                continue

            sev = "high"
            if severity and severity.lower() != sev:
                continue

            if review_status and review_status.lower() != rev_status.lower():
                continue

            item = HallucinationReportItem(
                plan_id=plan.plan_id,
                employee_name=user.full_name if user else "Unknown",
                role_title=job_role.title if job_role else "Unknown",
                module_id=hflag.module_id,
                module_title="Flagged Module",
                requirement_id=None,
                validation_status=val_status,
                flag_type=f_type,
                flagged_statement=hflag.flagged_statement,
                reason=hflag.reason,
                severity=sev,
                review_status=rev_status,
                human_decision=human_decision
            )
            results.append(item)

        # 2. Process ContradictionFlags
        for cflag in val_report.contradiction_flags:
            f_type = "contradiction"
            if flag_type and flag_type.lower() != f_type:
                continue

            sev = "critical"
            if severity and severity.lower() != sev:
                continue

            if review_status and review_status.lower() != rev_status.lower():
                continue

            item = HallucinationReportItem(
                plan_id=plan.plan_id,
                employee_name=user.full_name if user else "Unknown",
                role_title=job_role.title if job_role else "Unknown",
                module_id=None,
                module_title=None,
                requirement_id=None,
                validation_status=val_status,
                flag_type=f_type,
                flagged_statement=f"Primary: {cflag.primary_clause} vs Conflicting: {cflag.conflicting_clause}",
                reason=cflag.description,
                severity=sev,
                review_status=rev_status,
                human_decision=human_decision
            )
            results.append(item)

        # 3. Process ValidationIssues (unsupported, missing traceability)
        for issue in val_report.issues:
            f_type = issue.issue_type.lower() if issue.issue_type else "unsupported"
            if "missing" in f_type:
                f_type = "missing_traceability"
            elif "unsupported" in f_type:
                f_type = "unsupported"

            if flag_type and flag_type.lower() not in f_type:
                continue

            sev = issue.severity.lower() if issue.severity else "medium"
            if severity and severity.lower() != sev:
                continue

            if review_status and review_status.lower() != rev_status.lower():
                continue

            item = HallucinationReportItem(
                plan_id=plan.plan_id,
                employee_name=user.full_name if user else "Unknown",
                role_title=job_role.title if job_role else "Unknown",
                module_id=None,
                module_title=None,
                requirement_id=issue.requirement_id,
                validation_status=val_status,
                flag_type=f_type,
                flagged_statement=issue.generated_value or issue.explanation,
                reason=issue.explanation,
                severity=sev,
                review_status=rev_status,
                human_decision=human_decision
            )
            results.append(item)

    return results
