from fastapi.testclient import TestClient
from src.main import app
from database.session import init_db

client = TestClient(app)

def setup_module():
    init_db()

def test_list_and_seed_roles():
    response = client.get("/api/roles")
    assert response.status_code == 200
    roles = response.json()
    assert len(roles) >= 10
    role_codes = [r["role_code"] for r in roles]
    assert "R001" in role_codes  # Customer Support Executive
    assert "R002" in role_codes  # Sales Executive

def test_create_new_role():
    new_role = {
        "role_code": "R011",
        "title": "Compliance Auditor",
        "department": "Legal",
        "description": "Audits corporate policy adherence.",
        "required_experience_level": "intermediate"
    }
    response = client.post("/api/roles", json=new_role)
    assert response.status_code == 201
    res = response.json()
    assert res["role_code"] == "R011"

def test_add_matrix_requirement_and_retrieve():
    # First upload a test document to serve as valid source
    doc_content = "General Escalation Overview.\n# Section 4.2: Customer Escalation Procedure\nAll complaints must be escalated within 24h.".encode("utf-8")
    files = {"file": ("sop_07.md", doc_content, "text/markdown")}
    data = {
        "document_id": "SOP-07",
        "title": "Customer Escalation SOP",
        "category": "department_sop",
        "effective_date": "2026-01-01",
        "version": 1
    }
    client.post("/api/documents/upload", files=files, data=data)

    req_payload = {
        "requirement_id": "REQ-CS-001",
        "role_identifier": "R001",
        "policy_requirement": "Customer complaints must be responded to within 24 hours.",
        "process_requirement": "SOP-07 Section 4.2 Escalation Procedure",
        "required_competency": "Customer Escalation Handling",
        "is_mandatory": True,
        "requirement_type": "must_know",
        "priority": "high",
        "due_stage": "week_1",
        "source_document_id": "SOP-07",
        "source_section_id": "Sec-1",
        "required_task_description": "Handle simulated customer complaint escalation.",
        "required_assessment_topic": "Escalation Timelines"
    }

    response = client.post("/api/matrix/requirements", json=req_payload)
    assert response.status_code == 201, response.text
    res = response.json()
    assert res["requirement_id"] == "REQ-CS-001"

    # Retrieve matrix for R001
    get_res = client.get("/api/matrix/requirements/R001")
    assert get_res.status_code == 200
    matrix = get_res.json()
    assert len(matrix) >= 1
    assert matrix[0]["requirement_id"] == "REQ-CS-001"

def test_validate_matrix_integrity():
    response = client.get("/api/matrix/validate/R001")
    assert response.status_code == 200
    res = response.json()
    assert res["role_code"] == "R001"
    assert res["total_requirements"] >= 1
