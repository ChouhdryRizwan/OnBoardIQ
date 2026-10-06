"""
OnBoardIQ — Reports & Analytics API Routes
FastAPI Router for Phase 8 Deterministic Analytics & Reporting Engine.
"""

from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query, Header, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from database.session import get_db
from schemas.report_schemas import (
    OverviewMetricsResponse, EmployeeProgressReportResponse, RoleCoverageReportItem,
    MandatoryTrainingReportItem, AssessmentReportSummary, TraceabilityReportItem,
    HallucinationReportItem, PolicyCoverageReportItem, GenAIPythonComparisonSummary,
    PlanComparisonResponse
)
from reports_engine.overview_service import get_overview_metrics
from reports_engine.employee_report_service import get_employee_progress_report
from reports_engine.role_coverage_service import get_role_coverage_report
from reports_engine.mandatory_training_service import get_mandatory_training_report
from reports_engine.assessment_report_service import get_assessment_report
from reports_engine.traceability_report_service import get_source_traceability_report
from reports_engine.hallucination_report_service import get_hallucination_report
from reports_engine.policy_report_service import get_policy_coverage_report
from reports_engine.comparison_service import get_genai_vs_python_comparison, compare_plans_or_entities
from reports_engine.export_service import export_report_data

router = APIRouter(prefix="/reports", tags=["Reports & Analytics"])


def _verify_report_access(x_user_role: Optional[str] = Header(None, alias="X-User-Role")):
    """Security RBAC Check — Restricts employee access to administrative reports."""
    if x_user_role and x_user_role.lower() == "employee":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden. Employee role does not have access to administrative reporting suite."
        )


@router.get("/overview", response_model=OverviewMetricsResponse)
def get_overview(
    db: Session = Depends(get_db),
    _rbac: None = Depends(_verify_report_access)
):
    """Compute top-level KPI metrics cards across OnBoardIQ."""
    return get_overview_metrics(db)


@router.get("/employee-progress", response_model=EmployeeProgressReportResponse)
def get_employee_progress(
    search: Optional[str] = Query(None, description="Search employee name, email, or code"),
    department: Optional[str] = Query(None, description="Filter by department"),
    role_code: Optional[str] = Query(None, description="Filter by role code"),
    status: Optional[str] = Query(None, description="Filter by training status"),
    sort_by: str = Query("employee_name", description="Field to sort by"),
    order: str = Query("asc", description="Sort direction: asc or desc"),
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(10, ge=1, le=1000, description="Page size"),
    db: Session = Depends(get_db),
    _rbac: None = Depends(_verify_report_access)
):
    """Retrieve paginated employee learning progress report with filtering & sorting."""
    return get_employee_progress_report(
        db, search=search, department=department, role_code=role_code,
        status=status, sort_by=sort_by, order=order, page=page, size=size
    )


@router.get("/role-coverage", response_model=List[RoleCoverageReportItem])
def get_role_coverage(
    department: Optional[str] = Query(None),
    role_code: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _rbac: None = Depends(_verify_report_access)
):
    """Retrieve Role Requirement Matrix coverage & verification metrics."""
    return get_role_coverage_report(db, department=department, role_code=role_code)


@router.get("/mandatory-training", response_model=List[MandatoryTrainingReportItem])
def get_mandatory_training(
    department: Optional[str] = Query(None),
    role_code: Optional[str] = Query(None),
    is_mandatory_only: bool = Query(True),
    db: Session = Depends(get_db),
    _rbac: None = Depends(_verify_report_access)
):
    """Retrieve mandatory requirement completion and verification status per employee."""
    return get_mandatory_training_report(db, department=department, role_code=role_code, is_mandatory_only=is_mandatory_only)


@router.get("/assessments", response_model=AssessmentReportSummary)
def get_assessments(
    department: Optional[str] = Query(None),
    role_code: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _rbac: None = Depends(_verify_report_access)
):
    """Retrieve assessment analytics, quiz attempts, pass/fail rates, and weak areas."""
    return get_assessment_report(db, department=department, role_code=role_code, status=status)


@router.get("/traceability", response_model=List[TraceabilityReportItem])
def get_traceability(
    document_id: Optional[str] = Query(None),
    role_code: Optional[str] = Query(None),
    requirement_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _rbac: None = Depends(_verify_report_access)
):
    """Retrieve source traceability linking Document Chunk -> Requirement -> Plan Module -> Validation."""
    return get_source_traceability_report(db, document_id=document_id, role_code=role_code, requirement_id=requirement_id)


@router.get("/hallucinations", response_model=List[HallucinationReportItem])
def get_hallucinations(
    flag_type: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    review_status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _rbac: None = Depends(_verify_report_access)
):
    """Retrieve Pipeline 2 hallucination flags, contradictions, and unsupported content."""
    return get_hallucination_report(db, flag_type=flag_type, severity=severity, review_status=review_status)


@router.get("/policy-coverage", response_model=List[PolicyCoverageReportItem])
def get_policy_coverage(
    document_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _rbac: None = Depends(_verify_report_access)
):
    """Retrieve policy version coverage, affected entities, and regeneration status."""
    return get_policy_coverage_report(db, document_id=document_id)


@router.get("/genai-vs-python", response_model=GenAIPythonComparisonSummary)
def get_genai_vs_python(
    plan_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _rbac: None = Depends(_verify_report_access)
):
    """Retrieve comparison analysis between GenAI output and Python ground-truth validation."""
    return get_genai_vs_python_comparison(db, plan_id=plan_id)


@router.post("/compare-entities", response_model=PlanComparisonResponse)
def post_compare_entities(
    comparison_type: str = Query("plan_vs_plan"),
    entity_1_id: str = Query(...),
    entity_2_id: str = Query(...),
    db: Session = Depends(get_db),
    _rbac: None = Depends(_verify_report_access)
):
    """Compare two plans, roles, departments, or policies for differences and similarity."""
    return compare_plans_or_entities(db, comparison_type=comparison_type, entity_1_id=entity_1_id, entity_2_id=entity_2_id)


@router.get("/export")
def export_report(
    report_type: str = Query("employee_progress"),
    export_format: str = Query("csv"),
    search: Optional[str] = Query(None),
    department: Optional[str] = Query(None),
    role_code: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _rbac: None = Depends(_verify_report_access)
):
    """Export report data in CSV, Excel, or HTML PDF format while preserving active query filters."""
    file_bytes, media_type, filename = export_report_data(
        db, report_type=report_type, export_format=export_format,
        search=search, department=department, role_code=role_code, status=status
    )
    return Response(
        content=file_bytes,
        media_type=media_type,
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

