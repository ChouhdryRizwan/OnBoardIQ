"""
Role Coverage Service — Computes role requirement matrix coverage & verification status.
100% Deterministic Python calculation.
"""

from typing import List, Optional
from sqlalchemy.orm import Session
from database.models import JobRole, RoleRequirementMatrix, OnboardingPlan, VerificationStatusEnum
from schemas.report_schemas import RoleCoverageReportItem


def get_role_coverage_report(
    db: Session,
    department: Optional[str] = None,
    role_code: Optional[str] = None
) -> List[RoleCoverageReportItem]:
    query = db.query(JobRole).filter(JobRole.is_active == True)

    if department:
        query = query.filter(JobRole.department.ilike(f"%{department.strip()}%"))
    if role_code:
        query = query.filter(JobRole.role_code.ilike(f"%{role_code.strip()}%"))

    roles = query.all()
    results: List[RoleCoverageReportItem] = []

    for role in roles:
        requirements = db.query(RoleRequirementMatrix).filter(
            RoleRequirementMatrix.job_role_id == role.role_id,
            RoleRequirementMatrix.is_active == True
        ).all()

        total_rrm = len(requirements)
        mandatory = sum(1 for r in requirements if r.is_mandatory)
        optional = total_rrm - mandatory

        # Check active onboarding plans for this role
        plans = db.query(OnboardingPlan).filter(
            OnboardingPlan.job_role_id == role.role_id,
            OnboardingPlan.is_current_active == True
        ).all()

        covered_req_ids = set()
        verified_count = 0
        validation_failures = 0

        for plan in plans:
            for stage in plan.stages:
                for mod in stage.modules:
                    if mod.requirement_id:
                        covered_req_ids.add(mod.requirement_id)

            if plan.verification_status == VerificationStatusEnum.VERIFIED:
                verified_count += 1
            elif plan.verification_status in [
                VerificationStatusEnum.SOURCE_SUPPORT_MISSING,
                VerificationStatusEnum.REQUIREMENT_MISSING,
                VerificationStatusEnum.UNSUPPORTED_REQUIREMENT,
                VerificationStatusEnum.CONTRADICTION_DETECTED
            ]:
                validation_failures += 1

        covered_requirements = len(covered_req_ids)
        missing_requirements = max(0, total_rrm - covered_requirements)
        coverage_percentage = (covered_requirements / total_rrm * 100.0) if total_rrm > 0 else 0.0

        current_version = plans[0].prompt_version if plans else "v1.0"
        outdated_status = "current" if validation_failures == 0 else "requires_revalidation"

        item = RoleCoverageReportItem(
            role_code=role.role_code,
            role_title=role.title,
            department=role.department,
            total_rrm_requirements=total_rrm,
            mandatory_requirements=mandatory,
            optional_requirements=optional,
            covered_requirements=covered_requirements,
            missing_requirements=missing_requirements,
            verified_requirements=verified_count,
            validation_failures=validation_failures,
            coverage_percentage=round(coverage_percentage, 2),
            current_plan_version=current_version,
            outdated_status=outdated_status
        )
        results.append(item)

    return results
