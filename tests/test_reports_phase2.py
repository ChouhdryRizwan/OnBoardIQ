"""
OnBoardIQ — Phase 8 Reports & Analytics Comprehensive Test Suite
Contains 30+ requirement test cases for deterministic reporting engine, RBAC, filters, and multi-format exports.
"""

import pytest
import uuid
import io
import csv
from datetime import date, datetime
from fastapi.testclient import TestClient
from src.main import app
from database.session import init_db, get_db
from database.models import (
    User, JobRole, EmployeeProfile, CompanyDocument, DocumentChunk,
    RoleRequirementMatrix, OnboardingPlan, LearningModule, OnboardingStage,
    ValidationReport, RequirementComparisonDetail, HallucinationFlag,
    ContradictionFlag, ValidationIssue, ManualReviewQueue, UserRoleEnum,
    VerificationStatusEnum, MatchResultEnum, ProgressStatusEnum
)

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    init_db()

def _create_test_report_data(suffix="rep1"):
    """Helper to seed clean test data into database for reports verification."""
    db = next(get_db())

    # User & Employee
    email = f"user_{suffix}@skillsprint.ai"
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(user_id=str(uuid.uuid4()), email=email, password_hash="hash", full_name=f"Report User {suffix}", role=UserRoleEnum.EMPLOYEE)
        db.add(user)
        db.flush()

    role_code = f"ROLE_{suffix}"
    job_role = db.query(JobRole).filter(JobRole.role_code == role_code).first()
    if not job_role:
        job_role = JobRole(role_id=str(uuid.uuid4()), role_code=role_code, title=f"Analyst {suffix}", department="Engineering")
        db.add(job_role)
        db.flush()

    emp = db.query(EmployeeProfile).filter(EmployeeProfile.user_id == user.user_id).first()
    if not emp:
        emp = EmployeeProfile(
            employee_id=str(uuid.uuid4()), user_id=user.user_id, employee_code=f"EMP_{suffix}",
            job_role_id=job_role.role_id, department="Engineering", joining_date=date(2026, 1, 1),
            training_status=ProgressStatusEnum.ON_TRACK
        )
        db.add(emp)
        db.flush()

    # Document
    doc_id = f"DOC_{suffix}"
    doc = db.query(CompanyDocument).filter(CompanyDocument.document_id == doc_id, CompanyDocument.version == 1).first()
    if not doc:
        doc = CompanyDocument(
            document_id=doc_id, title=f"Doc {suffix}", category="hr_policy", version=1,
            effective_date=date(2026, 1, 1), file_format="pdf", file_path="test.pdf",
            file_size_bytes=200, content_hash=f"hash_{suffix}"
        )
        db.add(doc)
        db.flush()

        chunk = DocumentChunk(
            document_id=doc_id, document_version=1, section_id=f"Sec_{suffix}",
            chunk_text=f"Text for chunk {suffix}", chunk_index=1, page_number=1
        )
        db.add(chunk)
        db.flush()

    # RRM Requirement
    req_id = f"REQ_{suffix}"
    req = db.query(RoleRequirementMatrix).filter(RoleRequirementMatrix.requirement_id == req_id).first()
    if not req:
        req = RoleRequirementMatrix(
            requirement_id=req_id, job_role_id=job_role.role_id, title=f"Req {suffix}",
            policy_requirement="Policy statement", required_competency="Competency",
            is_mandatory=True, source_document_id=doc_id, source_document_version=1,
            source_section_id=f"Sec_{suffix}"
        )
        db.add(req)
        db.flush()

    # Onboarding Plan & Modules
    plan = db.query(OnboardingPlan).filter(OnboardingPlan.employee_id == emp.employee_id).first()
    if not plan:
        plan = OnboardingPlan(
            plan_id=str(uuid.uuid4()), employee_id=emp.employee_id, job_role_id=job_role.role_id,
            prompt_version="v1.0", genai_model="mock-genai", verification_status=VerificationStatusEnum.VERIFIED
        )
        db.add(plan)
        db.flush()

        stage = OnboardingStage(stage_id=str(uuid.uuid4()), plan_id=plan.plan_id, stage_name="week_1", stage_order=1)
        db.add(stage)
        db.flush()

        mod = LearningModule(
            module_id=str(uuid.uuid4()), stage_id=stage.stage_id, module_code=f"MOD_{suffix}",
            title=f"Module {suffix}", purpose="Purpose", requirement_id=req_id,
            is_mandatory=True, source_document_id=doc_id, source_section_id=f"Sec_{suffix}",
            completion_criteria="Criteria", is_completed=True, completed_at=datetime.utcnow()
        )
        db.add(mod)
        db.flush()

        val_report = ValidationReport(
            report_id=str(uuid.uuid4()), plan_id=plan.plan_id,
            verification_status=VerificationStatusEnum.VERIFIED,
            mandatory_coverage_score=100.0, source_traceability_score=100.0,
            consistency_score=100.0, total_mandatory_requirements=1, covered_mandatory_requirements=1
        )
        db.add(val_report)
        db.flush()

        detail = RequirementComparisonDetail(
            comparison_id=str(uuid.uuid4()), report_id=val_report.report_id, requirement_id=req_id,
            job_role_code=role_code, python_expected_source_doc=doc_id, python_expected_source_sec=f"Sec_{suffix}",
            python_expected_mandatory=True, genai_output_source_doc=doc_id, genai_output_source_sec=f"Sec_{suffix}",
            genai_output_mandatory=True, match_result=MatchResultEnum.MATCH, validation_status=VerificationStatusEnum.VERIFIED
        )
        db.add(detail)
        db.flush()

    res_user_id = user.user_id
    res_role_id = job_role.role_id
    res_emp_id = emp.employee_id
    res_plan_id = plan.plan_id if plan else ""
    res_req_id = req.requirement_id
    res_doc_id = doc.document_id

    db.commit()
    return res_user_id, res_role_id, res_emp_id, res_plan_id, res_req_id, res_doc_id

# =============================================================================
# 1. OVERVIEW METRICS TESTS (Tests 1 - 3)
# =============================================================================

def test_01_overview_metrics_success():
    _create_test_report_data("t1")
    resp = client.get("/api/reports/overview", headers={"X-User-Role": "admin"})
    assert resp.status_code == 200
    data = resp.json()
    assert "total_employees" in data
    assert "average_progress_percentage" in data
    assert data["total_employees"] >= 1
    assert data["total_roles"] >= 1

def test_02_overview_metrics_zero_denominator_safe():
    resp = client.get("/api/reports/overview", headers={"X-User-Role": "admin"})
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data["average_progress_percentage"], float)

def test_03_overview_metrics_rbac_denied():
    resp = client.get("/api/reports/overview", headers={"X-User-Role": "employee"})
    assert resp.status_code == 403

# =============================================================================
# 2. EMPLOYEE PROGRESS REPORT TESTS (Tests 4 - 8)
# =============================================================================

def test_04_employee_progress_report_default():
    _create_test_report_data("t4")
    resp = client.get("/api/reports/employee-progress", headers={"X-User-Role": "admin"})
    assert resp.status_code == 200
    data = resp.json()
    assert "total" in data
    assert "items" in data
    assert len(data["items"]) >= 1

def test_05_employee_progress_report_search_filter():
    _create_test_report_data("t5")
    resp = client.get("/api/reports/employee-progress?search=User t5", headers={"X-User-Role": "admin"})
    assert resp.status_code == 200
    data = resp.json()
    assert any(i["employee_name"] == "Report User t5" for i in data["items"])

def test_06_employee_progress_report_department_filter():
    _create_test_report_data("t6")
    resp = client.get("/api/reports/employee-progress?department=Engineering", headers={"X-User-Role": "admin"})
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["items"]) >= 1

def test_07_employee_progress_report_sorting():
    _create_test_report_data("t7a")
    _create_test_report_data("t7b")
    resp = client.get("/api/reports/employee-progress?sort_by=progress&order=desc", headers={"X-User-Role": "admin"})
    assert resp.status_code == 200

def test_08_employee_progress_report_pagination():
    _create_test_report_data("t8")
    resp = client.get("/api/reports/employee-progress?page=1&size=2", headers={"X-User-Role": "admin"})
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["items"]) <= 2

# =============================================================================
# 3. ROLE COVERAGE REPORT TESTS (Tests 9 - 11)
# =============================================================================

def test_09_role_coverage_report():
    _create_test_report_data("t9")
    resp = client.get("/api/reports/role-coverage", headers={"X-User-Role": "admin"})
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert "coverage_percentage" in data[0]

def test_10_role_coverage_filter_role():
    _create_test_report_data("t10")
    resp = client.get("/api/reports/role-coverage?role_code=ROLE_t10", headers={"X-User-Role": "admin"})
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 1
    assert data[0]["role_code"] == "ROLE_t10"

def test_11_role_coverage_rbac():
    resp = client.get("/api/reports/role-coverage", headers={"X-User-Role": "employee"})
    assert resp.status_code == 403

# =============================================================================
# 4. MANDATORY TRAINING REPORT TESTS (Tests 12 - 14)
# =============================================================================

def test_12_mandatory_training_report():
    _create_test_report_data("t12")
    resp = client.get("/api/reports/mandatory-training", headers={"X-User-Role": "admin"})
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert len(data) >= 1

def test_13_mandatory_training_department_filter():
    _create_test_report_data("t13")
    resp = client.get("/api/reports/mandatory-training?department=Engineering", headers={"X-User-Role": "admin"})
    assert resp.status_code == 200

def test_14_mandatory_training_optional_included():
    resp = client.get("/api/reports/mandatory-training?is_mandatory_only=false", headers={"X-User-Role": "admin"})
    assert resp.status_code == 200

# =============================================================================
# 5. ASSESSMENT ANALYTICS REPORT TESTS (Tests 15 - 17)
# =============================================================================

def test_15_assessment_report_summary():
    _create_test_report_data("t15")
    resp = client.get("/api/reports/assessments", headers={"X-User-Role": "admin"})
    assert resp.status_code == 200
    data = resp.json()
    assert "total_assessments" in data
    assert "pass_rate_percentage" in data

def test_16_assessment_report_filter_status():
    resp = client.get("/api/reports/assessments?status=passed", headers={"X-User-Role": "admin"})
    assert resp.status_code == 200

def test_17_assessment_report_rbac():
    resp = client.get("/api/reports/assessments", headers={"X-User-Role": "employee"})
    assert resp.status_code == 403

# =============================================================================
# 6. SOURCE TRACEABILITY REPORT TESTS (Tests 18 - 20)
# =============================================================================

def test_18_source_traceability_report():
    _create_test_report_data("t18")
    resp = client.get("/api/reports/traceability", headers={"X-User-Role": "admin"})
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)

def test_19_source_traceability_filter_doc():
    _create_test_report_data("t19")
    resp = client.get("/api/reports/traceability?document_id=DOC_t19", headers={"X-User-Role": "admin"})
    assert resp.status_code == 200

def test_20_source_traceability_rbac():
    resp = client.get("/api/reports/traceability", headers={"X-User-Role": "employee"})
    assert resp.status_code == 403

# =============================================================================
# 7. HALLUCINATION & UNSUPPORTED REPORT TESTS (Tests 21 - 23)
# =============================================================================

def test_21_hallucination_report():
    _create_test_report_data("t21")
    resp = client.get("/api/reports/hallucinations", headers={"X-User-Role": "admin"})
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)

def test_22_hallucination_report_filter_type():
    resp = client.get("/api/reports/hallucinations?flag_type=hallucination", headers={"X-User-Role": "admin"})
    assert resp.status_code == 200

def test_23_hallucination_report_rbac():
    resp = client.get("/api/reports/hallucinations", headers={"X-User-Role": "employee"})
    assert resp.status_code == 403

# =============================================================================
# 8. POLICY COVERAGE REPORT TESTS (Tests 24 - 26)
# =============================================================================

def test_24_policy_coverage_report():
    _create_test_report_data("t24")
    resp = client.get("/api/reports/policy-coverage", headers={"X-User-Role": "admin"})
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)

def test_25_policy_coverage_doc_filter():
    _create_test_report_data("t25")
    resp = client.get("/api/reports/policy-coverage?document_id=DOC_t25", headers={"X-User-Role": "admin"})
    assert resp.status_code == 200

def test_26_policy_coverage_rbac():
    resp = client.get("/api/reports/policy-coverage", headers={"X-User-Role": "employee"})
    assert resp.status_code == 403

# =============================================================================
# 9. GENAI VS PYTHON COMPARISON & ENTITY DIFF TESTS (Tests 27 - 29)
# =============================================================================

def test_27_genai_vs_python_comparison():
    _create_test_report_data("t27")
    resp = client.get("/api/reports/genai-vs-python", headers={"X-User-Role": "admin"})
    assert resp.status_code == 200
    data = resp.json()
    assert "agreement_percentage" in data

def test_28_compare_entities():
    user_id, role_id, emp_id, plan_id, req_id, doc_id = _create_test_report_data("t28")
    resp = client.post(
        f"/api/reports/compare-entities?comparison_type=plan_vs_plan&entity_1_id={plan_id}&entity_2_id={plan_id}",
        headers={"X-User-Role": "admin"}
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["similarity_percentage"] == 100.0

def test_29_compare_entities_rbac():
    resp = client.post("/api/reports/compare-entities?entity_1_id=p1&entity_2_id=p2", headers={"X-User-Role": "employee"})
    assert resp.status_code == 403

# =============================================================================
# 10. MULTI-FORMAT EXPORT TESTS (Tests 30 - 32)
# =============================================================================

def test_30_export_report_csv():
    _create_test_report_data("t30")
    resp = client.get("/api/reports/export?report_type=employee_progress&export_format=csv", headers={"X-User-Role": "admin"})
    assert resp.status_code == 200
    assert "text/csv" in resp.headers["content-type"]
    assert len(resp.content) > 0

def test_31_export_report_excel():
    _create_test_report_data("t31")
    resp = client.get("/api/reports/export?report_type=role_coverage&export_format=excel", headers={"X-User-Role": "admin"})
    assert resp.status_code == 200

def test_32_export_report_pdf_html():
    _create_test_report_data("t32")
    resp = client.get("/api/reports/export?report_type=mandatory_training&export_format=pdf", headers={"X-User-Role": "admin"})
    assert resp.status_code == 200
    assert "text/html" in resp.headers["content-type"]
    assert b"OnBoardIQ" in resp.content
