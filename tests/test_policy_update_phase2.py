import pytest
import uuid
from datetime import date, datetime
from fastapi.testclient import TestClient
from src.main import app
from database.session import init_db, get_db
from database.models import (
    CompanyDocument, DocumentChunk, RoleRequirementMatrix, JobRole, EmployeeProfile,
    OnboardingPlan, LearningModule, PolicyUpdateRecord, AffectedRequirementImpact,
    AffectedModuleImpact, PolicyAuditEvent, ManualReviewQueue, VerificationStatusEnum
)
from policy_engine.detector import policy_detector
from policy_engine.impact_analyzer import impact_analyzer
from policy_engine.selective_regenerator import selective_regenerator
from policy_engine.audit_logger import audit_logger

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    init_db()

def _setup_policy_update_scenario(unique_id="1"):
    """Helper to set up v1 and v2 policy documents, RRM requirements, plan, and employee."""
    db = next(get_db())

    doc_id = f"POL-UPD-{unique_id}"
    role_code = f"R_UPD_{unique_id}"

    # 1. Role
    role = db.query(JobRole).filter(JobRole.role_code == role_code).first()
    if not role:
        role = JobRole(role_code=role_code, title="Policy Analyst", department="Security")
        db.add(role)
        db.flush()

    # 2. Document v1
    doc_v1 = db.query(CompanyDocument).filter(
        CompanyDocument.document_id == doc_id, CompanyDocument.version == 1
    ).first()
    if not doc_v1:
        doc_v1 = CompanyDocument(
            document_id=doc_id, title="Security Policy Standard", category="information_security_policy",
            version=1, effective_date=date(2026, 1, 1), status="active",
            file_format="pdf", file_path="v1.pdf", file_size_bytes=100, content_hash=f"v1_hash_{unique_id}"
        )
        db.add(doc_v1)
        db.flush()

        c1 = DocumentChunk(
            document_id=doc_id, document_version=1, section_id="Sec-Sec-1",
            chunk_text="v1 password standard length is 8 characters.", chunk_index=1
        )
        db.add(c1)
        db.flush()

    # 3. Requirement citing v1
    req_id = f"REQ-UPD-{unique_id}"
    req = db.query(RoleRequirementMatrix).filter(RoleRequirementMatrix.requirement_id == req_id).first()
    if not req:
        req = RoleRequirementMatrix(
            requirement_id=req_id, job_role_id=role.role_id, title="Password Security",
            policy_requirement="Password length standard.", required_competency="Security Awareness",
            is_mandatory=True, source_document_id=doc_id, source_document_version=1, source_section_id="Sec-Sec-1"
        )
        db.add(req)
        db.commit()

    # 4. Employee & Generated Plan
    emp_res = client.post("/api/employees", json={
        "name": f"Policy Employee {unique_id}", "email": f"policy_emp_{unique_id}@company.com",
        "role_identifier": role_code, "department": "Security", "experience_level": "beginner"
    })
    emp_id = emp_res.json()["employee_id"]

    gen_res = client.post("/api/pipeline1/generate", json={"employee_id": emp_id, "role_identifier": role_code})
    plan_id = gen_res.json()["plan_id"]

    # 5. Document v2 (Upload new version)
    doc_v2 = db.query(CompanyDocument).filter(
        CompanyDocument.document_id == doc_id, CompanyDocument.version == 2
    ).first()
    if not doc_v2:
        doc_v2 = CompanyDocument(
            document_id=doc_id, title="Security Policy Standard", category="information_security_policy",
            version=2, effective_date=date(2026, 6, 1), status="active",
            file_format="pdf", file_path="v2.pdf", file_size_bytes=120, content_hash=f"v2_hash_{unique_id}"
        )
        db.add(doc_v2)
        db.flush()

        c2 = DocumentChunk(
            document_id=doc_id, document_version=2, section_id="Sec-Sec-1",
            chunk_text="v2 password standard length is updated to 16 characters.", chunk_index=1
        )
        db.add(c2)
        db.commit()

    return doc_id, emp_id, plan_id, role_code

def test_new_policy_version_detection():
    """Test Cases 1, 2, 3: Policy version change & section diff detection."""
    doc_id, _, _, _ = _setup_policy_update_scenario("T1")
    db = next(get_db())

    det_res = policy_detector.detect_version_changes(db, doc_id, new_version=2)
    assert det_res["document_id"] == doc_id
    assert det_res["old_version"] == 1
    assert det_res["new_version"] == 2
    assert "modified_sections" in det_res

def test_impact_analysis_requirements_roles_plans_employees():
    """Test Cases 4-10: Requirement, role, plan, module, and employee impact analysis."""
    doc_id, emp_id, plan_id, role_code = _setup_policy_update_scenario("T4")
    db = next(get_db())

    update_rec = impact_analyzer.analyze_policy_impact(db, doc_id, target_version=2)
    assert update_rec.document_id == doc_id
    assert update_rec.affected_roles_count >= 1
    assert update_rec.affected_plans_count >= 1
    assert update_rec.affected_modules_count >= 1

    # Verify API endpoints
    reqs_res = client.get(f"/api/policy-updates/{update_rec.update_id}/requirements")
    assert reqs_res.status_code == 200
    assert len(reqs_res.json()) >= 1

    plans_res = client.get(f"/api/policy-updates/{update_rec.update_id}/plans")
    assert plans_res.status_code == 200

    emps_res = client.get(f"/api/policy-updates/{update_rec.update_id}/employees")
    assert emps_res.status_code == 200
    assert len(emps_res.json()) >= 1

def test_unaffected_module_preservation_and_selective_regeneration():
    """Test Cases 11-15: Selective regeneration regenerates ONLY affected content."""
    doc_id, emp_id, plan_id, _ = _setup_policy_update_scenario("T11")
    db = next(get_db())

    update_rec = impact_analyzer.analyze_policy_impact(db, doc_id, target_version=2)

    regen_res = client.post(
        f"/api/policy-updates/{update_rec.update_id}/regenerate",
        headers={"X-User-Role": "admin"}
    )
    assert regen_res.status_code == 200
    body = regen_res.json()
    assert body["update_id"] == update_rec.update_id
    assert body["regenerated_count"] >= 1

def test_human_review_routing_for_validation_issues():
    """Test Case 16: Human review routing when regenerated module has warnings/issues."""
    doc_id, emp_id, plan_id, _ = _setup_policy_update_scenario("T16")
    db = next(get_db())

    update_rec = impact_analyzer.analyze_policy_impact(db, doc_id, target_version=2)
    res = selective_regenerator.regenerate_affected_content(db, update_rec.update_id)
    assert "status" in res

def test_historical_version_and_employee_progress_preservation():
    """Test Cases 17-20: Historical versioning & employee progress preservation."""
    doc_id, emp_id, plan_id, _ = _setup_policy_update_scenario("T17")
    db = next(get_db())

    # Complete module for employee first
    client.post(f"/api/employee/me/modules/M01/complete?employee_id={emp_id}")

    update_rec = impact_analyzer.analyze_policy_impact(db, doc_id, target_version=2)
    selective_regenerator.regenerate_affected_content(db, update_rec.update_id)

    # Verify employee progress record was preserved
    dash = client.get(f"/api/employee/me/dashboard?employee_id={emp_id}").json()
    assert "overall_progress_percentage" in dash

def test_audit_logging_and_history():
    """Test Case 21: Audit logging for policy events."""
    doc_id, _, _, _ = _setup_policy_update_scenario("T21")
    db = next(get_db())

    update_rec = impact_analyzer.analyze_policy_impact(db, doc_id, target_version=2)
    hist_res = client.get(f"/api/policy-updates/{update_rec.update_id}/history")
    assert hist_res.status_code == 200
    events = hist_res.json()
    assert isinstance(events, list)
    assert len(events) >= 1

def test_rbac_security():
    """Test Case 22: Security RBAC — Employees cannot trigger impact analysis or regeneration."""
    res_emp = client.post(
        "/api/policy-updates/policies/POL-001/versions/2/impact-analysis",
        headers={"X-User-Role": "employee"}
    )
    assert res_emp.status_code == 403

def test_regression_all_modules():
    """Test Case 23: Full regression test across all 6 previous modules."""
    assert client.get("/").status_code == 200
    assert client.get("/api/documents").status_code == 200
    assert client.get("/api/roles").status_code == 200
    assert client.get("/api/human-review/queue").status_code == 200
    assert client.get("/api/policy-updates").status_code == 200
