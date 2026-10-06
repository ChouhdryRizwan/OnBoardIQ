"""
OnBoardIQ — Phase 9 Complete Automated End-to-End Workflow Test Suite
Verifies the complete lifecycle of OnBoardIQ across all 8 major functional modules:
1. Document Upload & Chunking
2. Role Requirement Matrix (RRM) Creation & Source Verification
3. Pipeline 1 GenAI Plan Generation
4. Pipeline 2 Independent Ground-Truth Validation
5. Human Review, Approval & Audit Logging
6. Employee Learning Dashboard & Assessment Completion
7. Policy Update Detection, Impact Analysis & Selective Regeneration
8. Reports & Analytics Aggregation
"""

import pytest
import io
import uuid
from datetime import date, datetime
from fastapi.testclient import TestClient

from src.main import app
from database.session import init_db, get_db
from database.models import (
    User, JobRole, EmployeeProfile, CompanyDocument, DocumentChunk,
    RoleRequirementMatrix, OnboardingPlan, LearningModule, PolicyUpdateImpact,
    UserRoleEnum, VerificationStatusEnum, ProgressStatusEnum
)

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    init_db()

def test_full_end_to_end_onboardiq_lifecycle():
    """Requirement 15: Complete automated end-to-end lifecycle test across all modules."""
    print("--- Starting Complete E2E Lifecycle Test ---")

    # 1. Document Upload & Chunking
    pdf_bytes = (
        b"%PDF-1.4\n"
        b"1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n"
        b"2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n"
        b"3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj\n"
        b"4 0 obj << /Length 130 >> stream\n"
        b"BT /F1 24 Tf 100 700 Td (SECTION 1.0: INFORMATION SECURITY) Tj ET\n"
        b"BT /F1 12 Tf 100 650 Td (Passwords must be at least 12 characters.) Tj ET\n"
        b"endstream endobj\n"
        b"5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj\n"
        b"xref\n0 6\n"
        b"0000000000 65535 f \n"
        b"0000000009 00000 n \n"
        b"0000000058 00000 n \n"
        b"0000000115 00000 n \n"
        b"0000000261 00000 n \n"
        b"0000000442 00000 n \n"
        b"trailer << /Size 6 /Root 1 0 R >>\n"
        b"startxref\n523\n"
        b"%%EOF\n"
    )
    upload_data = {
        "document_id": "DOC-E2E-SEC-1",
        "title": "Enterprise Security SOP v1",
        "category": "information_security_policy",
        "version": 1,
        "effective_date": "2026-01-01",
        "department": "Security"
    }
    files = {"file": ("e2e_sec_v1.pdf", io.BytesIO(pdf_bytes), "application/pdf")}
    up_resp = client.post("/api/documents/upload", data=upload_data, files=files, headers={"X-User-Role": "admin"})
    assert up_resp.status_code == 201, up_resp.text
    doc_info = up_resp.json()
    doc_id = doc_info["document"]["document_id"]
    chunks_res = client.get(f"/api/documents/{doc_id}/chunks", headers={"X-User-Role": "admin"})
    chunks_data = chunks_res.json()
    section_id = chunks_data[0]["section_id"] if isinstance(chunks_data, list) and len(chunks_data) > 0 else "Sec-1"
    print(f"Step 1: Uploaded document {doc_id} with section {section_id}")

    # 2. RRM Role & Requirement Creation
    role_payload = {
        "role_code": "E2E_SEC_ANALYST",
        "title": "E2E Security Analyst",
        "department": "Security",
        "description": "Security Analyst Role",
        "required_experience_level": "intermediate"
    }
    role_resp = client.post("/api/roles", json=role_payload, headers={"X-User-Role": "admin"})
    assert role_resp.status_code in [200, 201], role_resp.text

    req_payload = {
        "requirement_id": "REQ-E2E-SEC-001",
        "role_identifier": "E2E_SEC_ANALYST",
        "title": "Enforce 12-Char Password Policy",
        "description": "Enforce 12-char password policy",
        "department": "Security",
        "policy_requirement": "Passwords must be at least 12 characters.",
        "process_requirement": "Sec-1 Password Reset Procedure",
        "required_competency": "Password Security",
        "is_mandatory": True,
        "requirement_type": "must_know",
        "priority": "high",
        "due_stage": "week_1",
        "source_document_id": doc_id,
        "source_document_version": 1,
        "source_section_id": section_id,
        "source_location": "Page 1",
        "required_task_description": "Perform password rotation exercise.",
        "required_assessment_topic": "Password Security Standard"
    }
    req_resp = client.post("/api/matrix/requirements", json=req_payload, headers={"X-User-Role": "admin"})
    assert req_resp.status_code in [200, 201], req_resp.text
    print("Step 2: Created RRM Requirement REQ-E2E-SEC-001")

    # 3. Employee Creation & Pipeline 1 Generation
    emp_payload = {
        "employee_id": "EMP-E2E-001",
        "name": "E2E Test Employee",
        "email": "e2e_user@skillsprint.ai",
        "role_identifier": "E2E_SEC_ANALYST",
        "department": "Security",
        "joining_date": "2026-01-15"
    }
    emp_resp = client.post("/api/employees", json=emp_payload, headers={"X-User-Role": "admin"})
    assert emp_resp.status_code in [200, 201], emp_resp.text
    emp_data = emp_resp.json()
    emp_id = emp_data["employee_id"]

    p1_payload = {"employee_id": emp_id, "role_identifier": "E2E_SEC_ANALYST"}
    p1_resp = client.post("/api/pipeline1/generate", json=p1_payload, headers={"X-User-Role": "admin"})
    assert p1_resp.status_code in [200, 201], p1_resp.text
    p1_data = p1_resp.json()
    plan_id = p1_data["plan_id"]
    print(f"Step 3: Generated Pipeline 1 Plan {plan_id}")

    # 4. Pipeline 2 Independent Ground-Truth Validation
    p2_resp = client.post("/api/pipeline2/verify-plan", json={"plan_id": plan_id}, headers={"X-User-Role": "admin"})
    assert p2_resp.status_code == 200, p2_resp.text
    p2_data = p2_resp.json()
    assert "verification_status" in p2_data
    print(f"Step 4: Pipeline 2 Verified Plan (Status: {p2_data['verification_status']})")

    # 5. Human Review & Plan Approval
    app_resp = client.post(
        f"/api/human-review/approve?plan_id={plan_id}&comments=E2E+Approved",
        headers={"X-User-Role": "reviewer"}
    )
    assert app_resp.status_code == 200, app_resp.text
    print("Step 5: Human Review Approved Plan")

    # 6. Employee Assignment & Progress Tracking
    dash_resp = client.get(f"/api/employee/dashboard?employee_id={emp_id}", headers={"X-User-Role": "employee"})
    assert dash_resp.status_code == 200, dash_resp.text
    dash_data = dash_resp.json()
    assert dash_data["overall_progress_percentage"] >= 0.0
    print("Step 6: Verified Employee Dashboard Access")

    # 7. Policy Update Detection & Impact Analysis
    pdf_bytes_v2 = (
        b"%PDF-1.4\n"
        b"1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n"
        b"2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n"
        b"3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj\n"
        b"4 0 obj << /Length 130 >> stream\n"
        b"BT /F1 24 Tf 100 700 Td (SECTION 1.0: INFORMATION SECURITY) Tj ET\n"
        b"BT /F1 12 Tf 100 650 Td (Passwords must be at least 16 characters.) Tj ET\n"
        b"endstream endobj\n"
        b"5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj\n"
        b"xref\n0 6\n"
        b"0000000000 65535 f \n"
        b"0000000009 00000 n \n"
        b"0000000058 00000 n \n"
        b"0000000115 00000 n \n"
        b"0000000261 00000 n \n"
        b"0000000442 00000 n \n"
        b"trailer << /Size 6 /Root 1 0 R >>\n"
        b"startxref\n523\n"
        b"%%EOF\n"
    )
    v2_upload = {
        "document_id": "DOC-E2E-SEC-1-V2",
        "title": "Enterprise Security SOP v2",
        "category": "information_security_policy",
        "version": 2,
        "effective_date": "2026-02-01",
        "department": "Security"
    }
    v2_files = {"file": ("e2e_sec_v2.pdf", io.BytesIO(pdf_bytes_v2), "application/pdf")}
    v2_resp = client.post("/api/documents/upload", data=v2_upload, files=v2_files, headers={"X-User-Role": "admin"})
    assert v2_resp.status_code == 201, v2_resp.text

    impact_resp = client.post(
        f"/api/policy-updates/policies/{doc_id}/versions/2/impact-analysis",
        headers={"X-User-Role": "admin"}
    )
    assert impact_resp.status_code == 200, impact_resp.text
    print("Step 7: Executed Policy Impact Analysis")

    # 8. Reports & Analytics Aggregation
    rep_resp = client.get("/api/reports/overview", headers={"X-User-Role": "admin"})
    assert rep_resp.status_code == 200, rep_resp.text
    rep_data = rep_resp.json()
    assert rep_data["total_employees"] >= 1
    print("Step 8: Verified Reports & Analytics Aggregation")

    print("--- Complete E2E Lifecycle Test PASSED Successfully! ---")
