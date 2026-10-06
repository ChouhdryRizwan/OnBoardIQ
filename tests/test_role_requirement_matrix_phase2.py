import pytest
from fastapi.testclient import TestClient
from src.main import app
from database.session import init_db, get_db
from database.models import JobRole, RoleRequirementMatrix, CompanyDocument, DocumentChunk, DocumentStatusEnum
from role_matrix.matrix_manager import matrix_manager

client = TestClient(app)

def test_create_and_list_roles():
    """Test creating and listing job roles."""
    payload = {
        "role_code": "R099",
        "title": "Data Security Auditor",
        "department": "Security & Risk",
        "description": "Audits data privacy and security policy adherence.",
        "required_experience_level": "intermediate"
    }

    res = client.post("/api/roles", json=payload)
    assert res.status_code == 201, res.text
    role = res.json()
    assert role["role_code"] == "R099"
    assert role["title"] == "Data Security Auditor"

    list_res = client.get("/api/roles")
    assert list_res.status_code == 200
    roles = list_res.json()
    assert any(r["role_code"] == "R099" for r in roles)

def test_create_valid_mandatory_and_optional_requirements():
    """Test creating mandatory and optional requirements with valid source document & section."""
    # 1. Upload valid test document
    doc_content = "# Section 1.0: Security Guidelines\nAll staff must update passwords every 90 days.".encode("utf-8")
    files = {"file": ("sec_policy.md", doc_content, "text/markdown")}
    doc_data = {
        "document_id": "POL-SEC-001",
        "title": "Security Policy 2026",
        "category": "information_security_policy",
        "effective_date": "2026-01-01",
        "version": 1
    }
    client.post("/api/documents/upload", files=files, data=doc_data)

    # 2. Create Mandatory Requirement
    mand_payload = {
        "requirement_id": "REQ-SEC-001",
        "role_identifier": "R099",
        "title": "Password Renewal Policy",
        "description": "Enforce 90-day password change rule.",
        "department": "Security & Risk",
        "policy_requirement": "Passwords must be updated every 90 days.",
        "process_requirement": "Sec-1 Password Reset Procedure",
        "required_competency": "Password Security Management",
        "is_mandatory": True,
        "requirement_type": "must_know",
        "priority": "high",
        "due_stage": "day_1",
        "source_document_id": "POL-SEC-001",
        "source_document_version": 1,
        "source_section_id": "Sec-1",
        "source_location": "Page 1",
        "required_task_description": "Perform password rotation exercise.",
        "required_assessment_topic": "Password Security Standard"
    }

    res_mand = client.post("/api/matrix/requirements", json=mand_payload)
    assert res_mand.status_code == 201, res_mand.text
    req_mand = res_mand.json()
    assert req_mand["requirement_id"] == "REQ-SEC-001"
    assert req_mand["is_mandatory"] is True

    # 3. Create Optional Requirement
    opt_payload = {
        "requirement_id": "REQ-SEC-002",
        "role_identifier": "R099",
        "title": "Advanced Threat Intelligence",
        "description": "Optional training on threat intelligence tools.",
        "department": "Security & Risk",
        "policy_requirement": "Familiarity with threat intelligence feeds.",
        "required_competency": "Threat Analysis",
        "is_mandatory": False,
        "requirement_type": "recommended",
        "priority": "low",
        "due_stage": "first_30_days",
        "source_document_id": "POL-SEC-001",
        "source_document_version": 1,
        "source_section_id": "Sec-1"
    }

    res_opt = client.post("/api/matrix/requirements", json=opt_payload)
    assert res_opt.status_code == 201, res_opt.text
    req_opt = res_opt.json()
    assert req_opt["requirement_id"] == "REQ-SEC-002"
    assert req_opt["is_mandatory"] is False

def test_invalid_source_document_and_section_rejection():
    """Test rejecting requirement creation when source document or section ID is non-existent."""
    # Invalid Document ID
    invalid_doc_payload = {
        "requirement_id": "REQ-INVALID-001",
        "role_identifier": "R099",
        "policy_requirement": "Requirement citing non-existent document.",
        "required_competency": "General Knowledge",
        "source_document_id": "NON-EXISTENT-DOC-999",
        "source_section_id": "Sec-1"
    }
    res_doc = client.post("/api/matrix/requirements", json=invalid_doc_payload)
    assert res_doc.status_code == 400
    assert "Invalid_Document_ID" in res_doc.json()["detail"] or "does not exist" in res_doc.json()["detail"]

    # Invalid Section ID
    invalid_sec_payload = {
        "requirement_id": "REQ-INVALID-002",
        "role_identifier": "R099",
        "policy_requirement": "Requirement citing invalid section ID.",
        "required_competency": "General Knowledge",
        "source_document_id": "POL-SEC-001",
        "source_section_id": "NON-EXISTENT-SEC-999"
    }
    res_sec = client.post("/api/matrix/requirements", json=invalid_sec_payload)
    assert res_sec.status_code == 400
    assert "Invalid_Section_ID" in res_sec.json()["detail"] or "not found" in res_sec.json()["detail"]

def test_duplicate_requirement_id_rejection():
    """Test rejecting creation of duplicate requirement ID."""
    dup_payload = {
        "requirement_id": "REQ-SEC-001", # Existing ID
        "role_identifier": "R099",
        "policy_requirement": "Duplicate requirement attempt.",
        "required_competency": "Duplicate Check",
        "source_document_id": "POL-SEC-001",
        "source_section_id": "Sec-1"
    }
    res = client.post("/api/matrix/requirements", json=dup_payload)
    assert res.status_code == 400
    assert "already exists" in res.json()["detail"]

def test_prerequisite_validation_and_circular_rejection():
    """Test prerequisite requirement validation and circular dependency detection."""
    # Create prerequisite requirement A
    req_a = {
        "requirement_id": "REQ-A-001",
        "role_identifier": "R099",
        "policy_requirement": "Basic Security Awareness",
        "required_competency": "Basic Security",
        "source_document_id": "POL-SEC-001",
        "source_section_id": "Sec-1"
    }
    client.post("/api/matrix/requirements", json=req_a)

    # Create requirement B referencing A
    req_b = {
        "requirement_id": "REQ-B-001",
        "role_identifier": "R099",
        "policy_requirement": "Intermediate Threat Hunting",
        "required_competency": "Threat Hunting",
        "source_document_id": "POL-SEC-001",
        "source_section_id": "Sec-1",
        "prerequisite_requirement_ids": ["REQ-A-001"]
    }
    res_b = client.post("/api/matrix/requirements", json=req_b)
    assert res_b.status_code == 201

    # Attempt updating A to reference B (creates A -> B -> A cycle)
    update_a_payload = {
        "prerequisite_requirement_ids": ["REQ-B-001"]
    }
    res_cycle = client.put("/api/matrix/requirements/REQ-A-001", json=update_a_payload)
    assert res_cycle.status_code == 400
    assert "Circular" in res_cycle.json()["detail"]

def test_rrm_filtering_and_summary():
    """Test RRM search filters and dashboard summary endpoint."""
    summary_res = client.get("/api/matrix/summary")
    assert summary_res.status_code == 200
    summary = summary_res.json()
    assert summary["total_roles"] >= 1
    assert summary["total_requirements"] >= 1

    # Filter by mandatory=true
    filter_res = client.get("/api/matrix/requirements?is_mandatory=true&priority=high")
    assert filter_res.status_code == 200
    filtered_list = filter_res.json()
    assert all(r["is_mandatory"] is True for r in filtered_list)
    assert all(r["priority"] == "high" for r in filtered_list)

def test_unauthorized_matrix_modification():
    """Test rejecting RRM modification requests for 'employee' role."""
    payload = {
        "requirement_id": "REQ-UNAUTH-001",
        "role_identifier": "R099",
        "policy_requirement": "Unauthorized requirement creation.",
        "required_competency": "Testing",
        "source_document_id": "POL-SEC-001",
        "source_section_id": "Sec-1"
    }
    headers = {"X-User-Role": "employee"}
    res = client.post("/api/matrix/requirements", json=payload, headers=headers)
    assert res.status_code == 403

def test_pipeline2_ground_truth_query_format():
    """Verify ground-truth query format for Pipeline 2 compatibility (Requirement 12)."""
    db = next(get_db())
    ground_truth = matrix_manager.get_ground_truth_matrix_for_role(db, "R099")
    assert len(ground_truth) >= 1

    first_item = ground_truth[0]
    assert hasattr(first_item, "requirement_id")
    assert hasattr(first_item, "is_mandatory")
    assert hasattr(first_item, "requirement_type")
    assert hasattr(first_item, "source_document_id")
    assert hasattr(first_item, "source_section_id")
