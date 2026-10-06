from fastapi.testclient import TestClient
from datetime import date
from src.main import app
from database.session import get_db, init_db
from database.models import User, JobRole, EmployeeProfile, UserRoleEnum, DifficultyLevelEnum, RoleRequirementMatrix

client = TestClient(app)

def test_pipeline2_verification_flow():
    init_db()
    db = next(get_db())

    # 1. Setup Role R001
    role = db.query(JobRole).filter(JobRole.role_code == "R001").first()
    if not role:
        role = JobRole(
            role_code="R001",
            title="Customer Support Executive",
            department="Customer Support",
            description="Handles customer queries",
            required_experience_level=DifficultyLevelEnum.BEGINNER
        )
        db.add(role)
        db.commit()
        db.refresh(role)

    # 2. Setup Document SOP-07
    doc_content = "# Section 4.2: Escalation Procedure\nCustomer complaints must be handled within 24h.".encode("utf-8")
    files = {"file": ("sop_07.md", doc_content, "text/markdown")}
    data = {
        "document_id": "SOP-07",
        "title": "Customer Escalation SOP",
        "category": "department_sop",
        "effective_date": "2026-01-01",
        "version": 1
    }
    client.post("/api/documents/upload", files=files, data=data)

    # 3. Setup Role Matrix Requirement REQ-CS-001 if not present
    existing_req = db.query(RoleRequirementMatrix).filter(RoleRequirementMatrix.requirement_id == "REQ-CS-001").first()
    if not existing_req:
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
            "required_task_description": "Handle simulated complaint escalation.",
            "required_assessment_topic": "Escalation Timelines"
        }
        client.post("/api/matrix/requirements", json=req_payload)

    # 4. Setup Employee EMP-1001
    emp = db.query(EmployeeProfile).filter(EmployeeProfile.employee_code == "EMP-1001").first()
    if not emp:
        user = User(
            email="emp2@example.com",
            password_hash="hashed_pw",
            full_name="Bob Jones",
            role=UserRoleEnum.EMPLOYEE
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        emp = EmployeeProfile(
            employee_id="EMP-1001",
            user_id=user.user_id,
            employee_code="EMP-1001",
            job_role_id=role.role_id,
            department="Customer Support",
            experience_level=DifficultyLevelEnum.BEGINNER,
            joining_date=date(2026, 1, 1)
        )
        db.add(emp)
        db.commit()
        db.refresh(emp)

    # 5. Generate Pipeline 1 Plan
    gen_res = client.post("/api/pipeline1/generate", json={"employee_id": "EMP-1001", "role_identifier": "R001"})
    assert gen_res.status_code == 201, gen_res.text
    plan_id = gen_res.json()["plan_id"]

    # 6. Execute Pipeline 2 Verification
    verify_res = client.post(f"/api/pipeline2/verify/{plan_id}")
    assert verify_res.status_code == 200, verify_res.text
    report = verify_res.json()

    assert report["plan_id"] == plan_id
    assert "verification_status" in report
    assert "mandatory_coverage_score" in report
    assert report["mandatory_coverage_score"] >= 0
    assert report["source_traceability_score"] >= 0
    assert report["total_mandatory_requirements"] >= 1
    assert len(report["comparison_details"]) >= 1

    # 7. Get Report Endpoint
    get_report_res = client.get(f"/api/pipeline2/reports/{plan_id}")
    assert get_report_res.status_code == 200
    assert get_report_res.json()["report_id"] == report["report_id"]

    # 8. Check Review Queue Endpoint
    queue_res = client.get("/api/pipeline2/review-queue")
    assert queue_res.status_code == 200
    assert isinstance(queue_res.json(), list)

def test_pipeline2_invalid_plan():
    response = client.post("/api/pipeline2/verify/invalid-uuid-12345")
    assert response.status_code == 404
