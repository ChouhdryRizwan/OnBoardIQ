"""
Policy Coverage Service — Policy document version status, coverage, and impact report.
100% Deterministic Python execution.
"""

from typing import List, Optional
from sqlalchemy.orm import Session
from database.models import (
    CompanyDocument, RoleRequirementMatrix, LearningModule, OnboardingPlan, PolicyUpdateImpact
)
from schemas.report_schemas import PolicyCoverageReportItem


def get_policy_coverage_report(
    db: Session,
    document_id: Optional[str] = None
) -> List[PolicyCoverageReportItem]:
    doc_query = db.query(CompanyDocument)
    if document_id:
        doc_query = doc_query.filter(CompanyDocument.document_id == document_id.strip())

    documents = doc_query.all()
    results: List[PolicyCoverageReportItem] = []

    for doc in documents:
        # Requirements linked to this document
        requirements = db.query(RoleRequirementMatrix).filter(
            RoleRequirementMatrix.source_document_id == doc.document_id
        ).all()

        req_count = len(requirements)
        role_ids = {r.job_role_id for r in requirements if r.job_role_id}
        roles_count = len(role_ids)

        # Learning modules linked
        modules = db.query(LearningModule).filter(
            LearningModule.source_document_id == doc.document_id
        ).all()
        modules_count = len(modules)

        # Plans linked
        plans = db.query(OnboardingPlan).filter(
            OnboardingPlan.job_role_id.in_(list(role_ids))
        ).all() if role_ids else []

        plans_count = len(plans)
        employee_ids = {p.employee_id for p in plans}
        employees_count = len(employee_ids)

        # Impact record
        impact = db.query(PolicyUpdateImpact).filter(
            PolicyUpdateImpact.updated_document_id == doc.document_id
        ).first()

        outdated_count = impact.affected_plans_count if impact else 0
        regen_status = impact.selective_regeneration_status if impact else "completed"
        reval_status = "revalidated" if regen_status == "completed" else "pending"

        if doc.version > 1 and regen_status != "completed":
            ver_status = "outdated"
        elif doc.version > 1:
            ver_status = "approved"
        else:
            ver_status = "current"

        coverage_pct = 100.0 if req_count > 0 and modules_count > 0 else (50.0 if req_count > 0 else 0.0)

        item = PolicyCoverageReportItem(
            document_id=doc.document_id,
            document_title=doc.title,
            policy_version=doc.version,
            effective_date=doc.effective_date.isoformat() if doc.effective_date else "",
            affected_roles_count=roles_count,
            affected_requirements_count=req_count,
            affected_modules_count=modules_count,
            affected_employees_count=employees_count,
            affected_plans_count=plans_count,
            current_coverage_percentage=round(coverage_pct, 2),
            outdated_plans_count=outdated_count,
            regeneration_status=regen_status,
            revalidation_status=reval_status,
            version_status=ver_status
        )
        results.append(item)

    return results
