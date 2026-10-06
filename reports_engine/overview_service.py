"""
Overview Service — Computes high-level KPI and summary metrics for OnBoardIQ.
Deterministic Python calculation without GenAI.
"""

from typing import Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func
from database.models import (
    User, EmployeeProfile, JobRole, RoleRequirementMatrix,
    OnboardingPlan, LearningModule, ManualReviewQueue, ValidationReport,
    CompanyDocument, PolicyUpdateImpact, VerificationStatusEnum, UserRoleEnum
)
from schemas.report_schemas import OverviewMetricsResponse


def get_overview_metrics(db: Session) -> OverviewMetricsResponse:
    # 1. Total & Active Employees
    total_employees = db.query(EmployeeProfile).count()
    active_employees = db.query(EmployeeProfile).join(User).filter(User.is_active == True).count()

    # 2. Roles & Requirements
    total_roles = db.query(JobRole).filter(JobRole.is_active == True).count()
    total_requirements = db.query(RoleRequirementMatrix).filter(RoleRequirementMatrix.is_active == True).count()
    mandatory_requirements = db.query(RoleRequirementMatrix).filter(
        RoleRequirementMatrix.is_active == True,
        RoleRequirementMatrix.is_mandatory == True
    ).count()

    # 3. Active Training Plans & Completed Plans
    active_training_plans = db.query(OnboardingPlan).filter(OnboardingPlan.is_current_active == True).count()
    
    # Calculate average progress
    # Progress is determined by completed learning modules vs total learning modules per plan
    plans = db.query(OnboardingPlan).filter(OnboardingPlan.is_current_active == True).all()
    total_progress_sum = 0.0
    completed_plans_count = 0

    for plan in plans:
        # Get modules for this plan via stage -> modules
        total_mods = 0
        completed_mods = 0
        for stage in plan.stages:
            for mod in stage.modules:
                total_mods += 1
                if mod.is_completed:
                    completed_mods += 1
        
        if total_mods > 0:
            prog = (completed_mods / total_mods) * 100.0
            total_progress_sum += prog
            if completed_mods == total_mods:
                completed_plans_count += 1
        elif plan.verification_status == VerificationStatusEnum.VERIFIED:
            completed_plans_count += 1

    avg_progress = (total_progress_sum / len(plans)) if plans else 0.0

    # 4. Pending Reviews
    pending_reviews = db.query(ManualReviewQueue).filter(ManualReviewQueue.status == "pending").count()

    # 5. Validation Failures
    failing_statuses = [
        VerificationStatusEnum.SOURCE_SUPPORT_MISSING,
        VerificationStatusEnum.REQUIREMENT_MISSING,
        VerificationStatusEnum.UNSUPPORTED_REQUIREMENT,
        VerificationStatusEnum.CONTRADICTION_DETECTED
    ]
    validation_failures = db.query(OnboardingPlan).filter(
        OnboardingPlan.verification_status.in_(failing_statuses)
    ).count()

    # 6. Outdated Plans & Policy Changes
    outdated_plans = db.query(PolicyUpdateImpact).filter(
        PolicyUpdateImpact.selective_regeneration_status == "pending"
    ).count()
    
    policy_changes_count = db.query(PolicyUpdateImpact).count()
    if policy_changes_count == 0:
        # Fallback to document versions > 1
        policy_changes_count = db.query(CompanyDocument).filter(CompanyDocument.version > 1).count()

    # 7. Assessment Completion Rate
    total_modules_count = db.query(LearningModule).count()
    completed_modules_count = db.query(LearningModule).filter(LearningModule.is_completed == True).count()
    assessment_completion_rate = (
        (completed_modules_count / total_modules_count) * 100.0
    ) if total_modules_count > 0 else 0.0

    # 8. Pipeline 2 Ground-Truth Validation Metrics
    avg_cov = db.query(func.avg(ValidationReport.mandatory_coverage_score)).scalar()
    avg_trace = db.query(func.avg(ValidationReport.source_traceability_score)).scalar()
    avg_mandatory_coverage_pct = round(float(avg_cov), 2) if avg_cov is not None else 0.0
    avg_source_traceability_pct = round(float(avg_trace), 2) if avg_trace is not None else 0.0

    return OverviewMetricsResponse(
        total_employees=total_employees,
        active_employees=active_employees,
        total_roles=total_roles,
        total_requirements=total_requirements,
        mandatory_requirements=mandatory_requirements,
        active_training_plans=active_training_plans,
        completed_plans=completed_plans_count,
        average_progress_percentage=round(avg_progress, 2),
        pending_reviews=pending_reviews,
        validation_failures=validation_failures,
        outdated_plans=outdated_plans,
        policy_changes_count=policy_changes_count,
        assessment_completion_rate=round(assessment_completion_rate, 2),
        avg_mandatory_coverage_pct=avg_mandatory_coverage_pct,
        avg_source_traceability_pct=avg_source_traceability_pct
    )
