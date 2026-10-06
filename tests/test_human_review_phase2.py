import pytest
import uuid
from datetime import date
from fastapi.testclient import TestClient
from src.main import app
from database.session import init_db, get_db
from database.models import (
    JobRole, EmployeeProfile, RoleRequirementMatrix, CompanyDocument, DocumentChunk,
    OnboardingPlan, ValidationReport, ManualReviewQueue, ReviewAuditTrail, VerificationStatusEnum
)

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    init_db()

def _setup_test_plan_and_review_queue():
    """Helper to set up role, document, employee, plan, validation report, and review queue item."""
    db = next(get_db())

    # 1. Role
    role = db.query(JobRole).filter(JobRole.role_code == "R_HR_TEST").first()
    if not role:
        role = JobRole(role_code="R_HR_TEST", title="Review Analyst", department="HR")
        db.add(role)
        db.flush()

    # 2. Document & Chunk
    doc = db.query(CompanyDocument).filter(CompanyDocument.document_id == "POL-HR-001").first()
    if not doc:
        doc = CompanyDocument(
            document_id="POL-HR-001", title="HR Standard", category="hr_policy",
            version=1, effective_date=date(2026, 1, 1), status="active",
            file_format="pdf", file_path="hr.pdf", file_size_bytes=200, content_hash="hrhash"
        )
        db.add(doc)
        db.flush()

        chunk = DocumentChunk(
            document_id="POL-HR-001", document_version=1, section_id="Sec-HR-1",
            chunk_text="Standard HR procedures.", chunk_index=1
        )
        db.add(chunk)
        db.flush()

    # 3. Requirement
    req = db.query(RoleRequirementMatrix).filter(RoleRequirementMatrix.requirement_id == "REQ-HR-001").first()
    if not req:
        req = RoleRequirementMatrix(
            requirement_id="REQ-HR-001", job_role_id=role.role_id, title="HR Orientation",
            policy_requirement="Employee must acknowledge HR policy.", required_competency="Policy Knowledge",
            is_mandatory=True, source_document_id="POL-HR-001", source_document_version=1, source_section_id="Sec-HR-1"
        )
        db.add(req)
        db.commit()

    # 4. Employee & Plan
    unique_suffix = uuid.uuid4().hex[:6]
    emp_res = client.post("/api/employees", json={
        "name": f"David Reviewee {unique_suffix}",
        "email": f"david.review_{unique_suffix}@company.com",
        "role_identifier": "R_HR_TEST",
        "department": "HR",
        "experience_level": "beginner",
        "joining_date": "2026-04-01"
    })
    emp_id = emp_res.json()["employee_id"]

    gen_res = client.post("/api/pipeline1/generate", json={"employee_id": emp_id, "role_identifier": "R_HR_TEST"})
    plan_id = gen_res.json()["plan_id"]

    # 5. Validation Run
    val_res = client.post(f"/api/pipeline2/validate/{plan_id}")
    report_id = val_res.json()["report_id"]

    # 6. Manual Review Queue Item
    review_queue = db.query(ManualReviewQueue).filter(ManualReviewQueue.plan_id == plan_id).first()
    if not review_queue:
        review_queue = ManualReviewQueue(
            report_id=report_id,
            plan_id=plan_id,
            status="pending",
            reason_for_review="Initial review test item"
        )
        db.add(review_queue)
        db.commit()
        db.refresh(review_queue)

    return review_queue.review_id, plan_id, report_id

def test_human_review_queue_retrieval():
    """Test retrieving human review queue items."""
    review_id, plan_id, report_id = _setup_test_plan_and_review_queue()

    res = client.get("/api/human-review/queue")
    assert res.status_code == 200
    queue_list = res.json()
    assert isinstance(queue_list, list)
    assert len(queue_list) >= 1

    item_res = client.get(f"/api/human-review/queue/{review_id}")
    assert item_res.status_code == 200
    details = item_res.json()
    assert details["review_queue_item"]["review_id"] == review_id
    assert details["plan_details"]["plan_id"] == plan_id

def test_human_review_approve_action():
    """Test Action 1: APPROVE plan."""
    review_id, plan_id, _ = _setup_test_plan_and_review_queue()

    approve_res = client.post(f"/api/human-review/{review_id}/approve", json={
        "reviewer_id": "Manager Admin",
        "comments": "Plan verified and approved for deployment."
    })
    assert approve_res.status_code == 200
    final_plan = approve_res.json()
    assert final_plan["plan_id"] == plan_id
    assert final_plan["verification_status"] == "verified"
    assert final_plan["final_approval_status"] in ["FINALIZED", "APPROVED"]
    assert len(final_plan["audit_trail"]) >= 1
    assert final_plan["audit_trail"][-1]["action_taken"] == "approve"

def test_human_review_reject_action():
    """Test Action 2: REJECT plan."""
    review_id, plan_id, _ = _setup_test_plan_and_review_queue()

    reject_res = client.post(f"/api/human-review/{review_id}/reject", json={
        "reviewer_id": "Manager Admin",
        "reason": "Missing key security topics for HR role."
    })
    assert reject_res.status_code == 200
    body = reject_res.json()
    assert body["status"] == "rejected"
    assert body["rejection_reason"] == "Missing key security topics for HR role."

def test_human_review_edit_action():
    """Test Action 3: EDIT plan structure."""
    review_id, plan_id, _ = _setup_test_plan_and_review_queue()

    # Retrieve current plan details to get module ID
    details_res = client.get(f"/api/human-review/queue/{review_id}")
    module_id = details_res.json()["plan_details"]["stages"][0]["modules"][0]["module_id"]

    edit_res = client.post(f"/api/human-review/{review_id}/edit", json={
        "reviewer_id": "Manager Admin",
        "edited_plan_structure": {
            "modules": [
                {"module_id": module_id, "title": "Updated HR Orientation Module", "estimated_duration_minutes": 45}
            ]
        },
        "comments": "Updated module title and duration."
    })
    assert edit_res.status_code == 200
    edit_body = edit_res.json()
    assert edit_body["plan_id"] == plan_id
    assert "new_validation_report_id" in edit_body

def test_human_review_regenerate_action():
    """Test Action 4: REGENERATE plan via Pipeline 1."""
    review_id, plan_id, _ = _setup_test_plan_and_review_queue()

    regen_res = client.post(f"/api/human-review/{review_id}/regenerate", json={
        "reviewer_id": "Manager Admin",
        "feedback_prompt": "Please emphasize compliance timelines and onboarding checklists."
    })
    assert regen_res.status_code == 200
    body = regen_res.json()
    assert "new_plan_id" in body
    assert body["new_plan_id"] != plan_id

def test_human_review_comment_and_override_actions():
    """Test Action 5 & 6: COMMENT and MANUAL OVERRIDE actions."""
    review_id, plan_id, _ = _setup_test_plan_and_review_queue()

    # 1. Comment
    comment_res = client.post(f"/api/human-review/{review_id}/comment", json={
        "reviewer_id": "Reviewer Bob",
        "comment": "Checking document citations with legal team."
    })
    assert comment_res.status_code == 200
    assert comment_res.json()["comment"] == "Checking document citations with legal team."

    # 2. Override
    override_res = client.post(f"/api/human-review/{review_id}/override", json={
        "reviewer_id": "Reviewer Bob",
        "override_reason": "Pre-approved by VP of HR.",
        "force_status": "verified"
    })
    assert override_res.status_code == 200
    assert override_res.json()["new_status"] == "verified"

def test_final_onboarding_plan_export():
    """Test fetching Final Onboarding Plan API endpoint."""
    review_id, plan_id, _ = _setup_test_plan_and_review_queue()

    # Approve plan first
    client.post(f"/api/human-review/{review_id}/approve", json={"reviewer_id": "Admin", "comments": "Approved"})

    final_res = client.get(f"/api/human-review/plan/{plan_id}/final")
    assert final_res.status_code == 200
    final_plan = final_res.json()
    assert final_plan["plan_id"] == plan_id
    assert final_plan["final_approval_status"] in ["FINALIZED", "APPROVED"]
    assert isinstance(final_plan["stages"], list)
    assert isinstance(final_plan["audit_trail"], list)
