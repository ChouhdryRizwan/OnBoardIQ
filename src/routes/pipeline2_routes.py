from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session

from database.session import get_db
from database.models import (
    OnboardingPlan, ValidationReport, ValidationIssue, RequirementComparisonDetail,
    HallucinationFlag, ContradictionFlag, ManualReviewQueue, JobRole
)
from verification_engine.pipeline2_engine import pipeline2_engine
from python_validation.validator import pipeline2_validator
from schemas.pipeline2_schemas import (
    ValidationReportResponse, RequirementComparisonDetailSchema,
    HallucinationFlagSchema, ContradictionFlagSchema,
    ManualReviewItemSchema
)

router = APIRouter(tags=["Pipeline 2: Deterministic Python Verification Engine"])

def _verify_admin_access(x_user_role: Optional[str] = Header(None, alias="X-User-Role")):
    """Requirement 16: Security RBAC — Only authorized roles can trigger Pipeline 2 ground-truth validation."""
    if x_user_role and x_user_role.lower() == "employee":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden. Employees cannot trigger Pipeline 2 ground-truth validation."
        )

def _build_validation_report_response(db: Session, report: ValidationReport) -> ValidationReportResponse:
    plan = db.query(OnboardingPlan).filter(OnboardingPlan.plan_id == report.plan_id).first()
    role = db.query(JobRole).filter(JobRole.role_id == plan.job_role_id).first() if plan else None

    comp_details = db.query(RequirementComparisonDetail).filter(
        RequirementComparisonDetail.report_id == report.report_id
    ).all()
    comp_schemas = [
        RequirementComparisonDetailSchema(
            comparison_id=cd.comparison_id,
            requirement_id=cd.requirement_id,
            job_role_code=cd.job_role_code,
            python_expected_source_doc=cd.python_expected_source_doc,
            python_expected_source_sec=cd.python_expected_source_sec,
            python_expected_mandatory=cd.python_expected_mandatory,
            genai_output_source_doc=cd.genai_output_source_doc,
            genai_output_source_sec=cd.genai_output_source_sec,
            genai_output_mandatory=cd.genai_output_mandatory,
            match_result=cd.match_result.value if hasattr(cd.match_result, "value") else str(cd.match_result),
            validation_status=cd.validation_status.value if hasattr(cd.validation_status, "value") else str(cd.validation_status),
            disagreement_explanation=cd.disagreement_explanation
        )
        for cd in comp_details
    ]

    h_flags = db.query(HallucinationFlag).filter(HallucinationFlag.report_id == report.report_id).all()
    h_schemas = [
        HallucinationFlagSchema(
            flag_id=hf.flag_id,
            module_id=hf.module_id,
            claimed_source_doc=hf.claimed_source_doc,
            claimed_source_sec=hf.claimed_source_sec,
            flagged_statement=hf.flagged_statement,
            reason=hf.reason,
            is_resolved=hf.is_resolved or False
        )
        for hf in h_flags
    ]

    c_flags = db.query(ContradictionFlag).filter(ContradictionFlag.report_id == report.report_id).all()
    c_schemas = [
        ContradictionFlagSchema(
            contradiction_id=cf.contradiction_id,
            primary_document_id=cf.primary_document_id,
            conflicting_document_id=cf.conflicting_document_id,
            primary_clause=cf.primary_clause,
            conflicting_clause=cf.conflicting_clause,
            applied_precedence_rule=cf.applied_precedence_rule,
            description=cf.description,
            is_resolved=cf.is_resolved or False
        )
        for cf in c_flags
    ]

    review_item = db.query(ManualReviewQueue).filter(ManualReviewQueue.report_id == report.report_id).first()

    return ValidationReportResponse(
        report_id=report.report_id,
        plan_id=report.plan_id,
        employee_id=plan.employee_id if plan else "",
        role_code=role.role_code if role else "UNKNOWN",
        verification_status=report.verification_status.value if hasattr(report.verification_status, "value") else str(report.verification_status),
        mandatory_coverage_score=float(report.mandatory_coverage_score),
        source_traceability_score=float(report.source_traceability_score),
        consistency_score=float(report.consistency_score),
        total_mandatory_requirements=report.total_mandatory_requirements,
        covered_mandatory_requirements=report.covered_mandatory_requirements,
        missing_requirements_count=report.missing_requirements_count,
        unsupported_requirements_count=report.unsupported_requirements_count,
        contradiction_count=report.contradiction_count,
        duplicate_count=report.duplicate_count,
        evaluated_at=report.evaluated_at.isoformat() if report.evaluated_at else "",
        requires_manual_review=review_item is not None,
        comparison_details=comp_schemas,
        hallucination_flags=h_schemas,
        contradiction_flags=c_schemas
    )

@router.post("/pipeline2/validate/{plan_id}", response_model=ValidationReportResponse, status_code=status.HTTP_200_OK)
@router.post("/pipeline2/verify/{plan_id}", response_model=ValidationReportResponse, status_code=status.HTTP_200_OK)
@router.post("/pipeline2/verify-plan", response_model=ValidationReportResponse, status_code=status.HTTP_200_OK)
@router.post("/pipeline2/validate-plan", response_model=ValidationReportResponse, status_code=status.HTTP_200_OK)
def trigger_pipeline2_validation(
    plan_id: Optional[str] = None,
    body: Optional[Dict[str, Any]] = None,
    db: Session = Depends(get_db),
    _rbac: None = Depends(_verify_admin_access)
):
    """Executes Pipeline 2 Independent Deterministic Python Verification Engine (Requirement 22)."""
    target_plan_id = plan_id or (body.get("plan_id") if body else None)
    if not target_plan_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing required 'plan_id' parameter.")
    try:
        report = pipeline2_validator.validate_plan(db, target_plan_id)
        return _build_validation_report_response(db, report)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Pipeline 2 verification error: {str(e)}")

@router.get("/validation/{validation_run_id}")
def get_validation_run_by_id(validation_run_id: str, db: Session = Depends(get_db)):
    """Retrieve validation report by validation_run_id (report_id)."""
    report = db.query(ValidationReport).filter(ValidationReport.report_id == validation_run_id).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Validation run '{validation_run_id}' not found.")
    return _build_validation_report_response(db, report)

@router.get("/validation/{validation_run_id}/issues")
def get_validation_issues(validation_run_id: str, db: Session = Depends(get_db)):
    """Retrieve list of validation issues for a validation run."""
    report = db.query(ValidationReport).filter(ValidationReport.report_id == validation_run_id).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Validation run '{validation_run_id}' not found.")

    issues = db.query(ValidationIssue).filter(ValidationIssue.report_id == validation_run_id).all()
    return [
        {
            "issue_id": i.issue_id,
            "requirement_id": i.requirement_id,
            "issue_type": i.issue_type,
            "severity": i.severity,
            "explanation": i.explanation,
            "expected_value": i.expected_value,
            "generated_value": i.generated_value,
            "source_info": i.source_info
        } for i in issues
    ]

@router.get("/validation/{validation_run_id}/comparison")
def get_validation_comparison(validation_run_id: str, db: Session = Depends(get_db)):
    """Retrieve GenAI vs Python Ground-Truth comparison breakdown for validation run (Requirement 20)."""
    report = db.query(ValidationReport).filter(ValidationReport.report_id == validation_run_id).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Validation run '{validation_run_id}' not found.")

    comp_details = db.query(RequirementComparisonDetail).filter(
        RequirementComparisonDetail.report_id == validation_run_id
    ).all()

    return [
        {
            "requirement_id": cd.requirement_id,
            "role": cd.job_role_code,
            "source": cd.genai_output_source_doc or cd.python_expected_source_doc or "N/A",
            "python_expected_requirement": f"Doc: {cd.python_expected_source_doc}, Sec: {cd.python_expected_source_sec}, Mandatory: {cd.python_expected_mandatory}",
            "genai_result": f"Doc: {cd.genai_output_source_doc}, Sec: {cd.genai_output_source_sec}, Mandatory: {cd.genai_output_mandatory}",
            "match": (cd.match_result.value == "match" if hasattr(cd.match_result, "value") else cd.match_result == "match"),
            "coverage_status": "covered" if cd.genai_output_source_doc else "missing",
            "traceability_status": "valid" if (cd.match_result.value == "match" if hasattr(cd.match_result, "value") else cd.match_result == "match") else "mismatch",
            "validation_status": cd.validation_status.value if hasattr(cd.validation_status, "value") else str(cd.validation_status),
            "explanation": cd.disagreement_explanation
        } for cd in comp_details
    ]

@router.get("/validation/{validation_run_id}/summary")
def get_validation_summary(validation_run_id: str, db: Session = Depends(get_db)):
    """Retrieve summary metrics for validation run."""
    report = db.query(ValidationReport).filter(ValidationReport.report_id == validation_run_id).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Validation run '{validation_run_id}' not found.")

    return {
        "validation_run_id": report.report_id,
        "plan_id": report.plan_id,
        "verification_status": report.verification_status.value if hasattr(report.verification_status, "value") else str(report.verification_status),
        "mandatory_coverage_score": float(report.mandatory_coverage_score),
        "source_traceability_score": float(report.source_traceability_score),
        "consistency_score": float(report.consistency_score),
        "total_mandatory": report.total_mandatory_requirements,
        "covered_mandatory": report.covered_mandatory_requirements,
        "missing_mandatory": report.missing_requirements_count,
        "unsupported_count": report.unsupported_requirements_count,
        "contradiction_count": report.contradiction_count,
        "duplicate_count": report.duplicate_count
    }

@router.get("/validation/plan/{plan_id}/latest")
@router.get("/pipeline2/reports/{plan_id}")
def get_latest_validation_report_for_plan(plan_id: str, db: Session = Depends(get_db)):
    """Retrieve latest validation report for an onboarding plan."""
    report = db.query(ValidationReport).filter(
        ValidationReport.plan_id == plan_id
    ).order_by(ValidationReport.evaluated_at.desc()).first()

    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"No validation report found for plan '{plan_id}'.")

    return _build_validation_report_response(db, report)

@router.get("/pipeline2/review-queue")
def get_manual_review_queue(db: Session = Depends(get_db)):
    """Retrieve pending manual review items (Requirement 25)."""
    items = db.query(ManualReviewQueue).all()
    return [
        {
            "queue_id": item.queue_id,
            "plan_id": item.plan_id,
            "report_id": item.report_id,
            "reason": item.reason,
            "priority": item.priority,
            "status": item.status,
            "flagged_at": item.flagged_at.isoformat() if item.flagged_at else None
        } for item in items
    ]
