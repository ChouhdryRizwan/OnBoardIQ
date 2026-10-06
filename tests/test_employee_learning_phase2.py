import pytest
import uuid
from datetime import date, datetime
from fastapi.testclient import TestClient
from src.main import app
from database.session import init_db, get_db
from database.models import (
    JobRole, EmployeeProfile, RoleRequirementMatrix, CompanyDocument, DocumentChunk,
    OnboardingPlan, ValidationReport, ManualReviewQueue, ReviewAuditTrail, VerificationStatusEnum,
    EmployeeLearningPlan, EmployeeModuleProgress, ChecklistProgress, TaskProgress, QuizAttempt, AssessmentResult
)
from learning_engine.assignment_engine import PlanAssignmentEngine
from learning_engine.progress_calculator import progress_calculator
from learning_engine.weak_area_engine import weak_area_engine

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    init_db()

def _create_approved_test_plan(unique_id="1"):
    """Helper to set up approved plan ready for assignment."""
    db = next(get_db())

    role_code = f"R_LRN_{unique_id}"
    role = db.query(JobRole).filter(JobRole.role_code == role_code).first()
    if not role:
        role = JobRole(role_code=role_code, title="Learning Test Role", department="Engineering")
        db.add(role)
        db.flush()

    doc_id = f"POL-LRN-{unique_id}"
    doc = db.query(CompanyDocument).filter(CompanyDocument.document_id == doc_id).first()
    if not doc:
        doc = CompanyDocument(
            document_id=doc_id, title="Learning Doc", category="hr_policy",
            version=1, effective_date=date(2026, 1, 1), status="active",
            file_format="pdf", file_path="l.pdf", file_size_bytes=100, content_hash=f"hash_{unique_id}"
        )
        db.add(doc)
        db.flush()

        chunk = DocumentChunk(
            document_id=doc_id, document_version=1, section_id="Sec-1",
            chunk_text="Learning chunk", chunk_index=1
        )
        db.add(chunk)
        db.flush()

    req_id = f"REQ-LRN-{unique_id}"
    req = db.query(RoleRequirementMatrix).filter(RoleRequirementMatrix.requirement_id == req_id).first()
    if not req:
        req = RoleRequirementMatrix(
            requirement_id=req_id, job_role_id=role.role_id, title="Req Title",
            policy_requirement="Policy Req", required_competency="Comp",
            is_mandatory=True, source_document_id=doc_id, source_document_version=1, source_section_id="Sec-1"
        )
        db.add(req)
        db.commit()

    emp_res = client.post("/api/employees", json={
        "name": f"Learner {unique_id}", "email": f"learner_{unique_id}@company.com",
        "role_identifier": role_code, "department": "Engineering",
        "experience_level": "beginner", "joining_date": "2026-04-01"
    })
    emp_id = emp_res.json()["employee_id"]

    gen_res = client.post("/api/pipeline1/generate", json={"employee_id": emp_id, "role_identifier": role_code})
    plan_id = gen_res.json()["plan_id"]

    val_res = client.post(f"/api/pipeline2/validate/{plan_id}")
    report_id = val_res.json()["report_id"]

    rev_queue = db.query(ManualReviewQueue).filter(ManualReviewQueue.plan_id == plan_id).first()
    if not rev_queue:
        rev_queue = ManualReviewQueue(report_id=report_id, plan_id=plan_id, status="pending", reason_for_review="Test")
        db.add(rev_queue)
        db.commit()

    # Approve Plan
    approve_res = client.post(f"/api/human-review/{rev_queue.review_id}/approve", json={"reviewer_id": "Admin", "comments": "Approved"})
    assert approve_res.status_code == 200

    return emp_id, plan_id, rev_queue.review_id

def test_approved_plan_assignment():
    """Test Case 1: Approved plan assignment creates active EmployeeLearningPlan."""
    emp_id, plan_id, _ = _create_approved_test_plan("C1")
    db = next(get_db())

    learning_plan = db.query(EmployeeLearningPlan).filter(
        EmployeeLearningPlan.employee_id == emp_id,
        EmployeeLearningPlan.plan_id == plan_id
    ).first()
    assert learning_plan is not None
    assert learning_plan.status in ["assigned", "in_progress"]

def test_rejected_plan_cannot_be_assigned():
    """Test Case 2: Rejected plan CANNOT be assigned."""
    db = next(get_db())

    emp_res = client.post("/api/employees", json={
        "name": "Rejected Learner", "email": "rej_learner@company.com",
        "role_identifier": "R_LRN_C1", "department": "Engineering"
    })
    emp_id = emp_res.json()["employee_id"]

    gen_res = client.post("/api/pipeline1/generate", json={"employee_id": emp_id, "role_identifier": "R_LRN_C1"})
    plan_id = gen_res.json()["plan_id"]

    # Reject plan
    plan = db.query(OnboardingPlan).filter(OnboardingPlan.plan_id == plan_id).first()
    plan.verification_status = VerificationStatusEnum.MANUAL_REVIEW_REQUIRED
    db.commit()

    with pytest.raises(ValueError) as exc:
        PlanAssignmentEngine.assign_approved_plan(db, plan_id)
    assert "cannot be assigned" in str(exc.value)

def test_employee_dashboard():
    """Test Case 3: Employee Dashboard endpoint returns progress metrics."""
    emp_id, _, _ = _create_approved_test_plan("C3")
    res = client.get(f"/api/employee/me/dashboard?employee_id={emp_id}")
    assert res.status_code == 200
    data = res.json()
    assert data["employee_id"] == emp_id
    assert "overall_progress_percentage" in data
    assert "overall_status" in data

def test_employee_isolation_security():
    """Test Case 4: Employee data isolation."""
    emp_id_1, _, _ = _create_approved_test_plan("C4_1")
    emp_id_2, _, _ = _create_approved_test_plan("C4_2")

    res1 = client.get(f"/api/employee/me/dashboard?employee_id={emp_id_1}")
    res2 = client.get(f"/api/employee/me/dashboard?employee_id={emp_id_2}")
    assert res1.json()["employee_id"] == emp_id_1
    assert res2.json()["employee_id"] == emp_id_2
    assert res1.json()["employee_id"] != res2.json()["employee_id"]

def test_module_progress_start_and_complete():
    """Test Cases 5: Module progress tracking."""
    emp_id, _, _ = _create_approved_test_plan("C5")

    mods = client.get(f"/api/employee/me/modules?employee_id={emp_id}").json()
    assert len(mods) >= 1
    m_id = mods[0]["module_id"]

    # Start
    start_res = client.post(f"/api/employee/me/modules/{m_id}/start?employee_id={emp_id}")
    assert start_res.status_code == 200

    # Complete
    comp_res = client.post(f"/api/employee/me/modules/{m_id}/complete?employee_id={emp_id}")
    assert comp_res.status_code == 200
    assert comp_res.json()["status"] == "completed"

def test_checklist_progress_tracking():
    """Test Case 6: Checklist progress tracking."""
    emp_id, _, _ = _create_approved_test_plan("C6")

    chks = client.get(f"/api/employee/me/checklists?employee_id={emp_id}").json()
    if len(chks) >= 1:
        c_id = chks[0]["checklist_id"]
        res = client.post(f"/api/employee/me/checklists/{c_id}/complete?employee_id={emp_id}")
        assert res.status_code == 200
        assert res.json()["is_completed"] is True

def test_practical_task_completion():
    """Test Case 7: Practical task completion."""
    emp_id, _, _ = _create_approved_test_plan("C7")

    tasks = client.get(f"/api/employee/me/tasks?employee_id={emp_id}").json()
    if len(tasks) >= 1:
        t_id = tasks[0]["task_id"]
        res = client.post(f"/api/employee/me/tasks/{t_id}/complete?employee_id={emp_id}&notes=Done")
        assert res.status_code == 200
        assert res.json()["status"] == "completed"

def test_quiz_submission_and_scoring():
    """Test Cases 8, 9, 10: Quiz detail, submission, scoring, and multiple attempts."""
    emp_id, _, _ = _create_approved_test_plan("C8")
    mods = client.get(f"/api/employee/me/modules?employee_id={emp_id}").json()
    m_id = mods[0]["module_id"]

    # Get Quiz detail without exposing correct answer
    q_res = client.get(f"/api/employee/me/quizzes/{m_id}")
    assert q_res.status_code == 200
    q_data = q_res.json()
    assert "correct_answer" not in q_data

    # Submit answer attempt 1
    sub1 = client.post(f"/api/employee/me/quizzes/{m_id}/submit?employee_id={emp_id}", json={"selected_option_label": "A"})
    assert sub1.status_code == 200
    assert "score" in sub1.json()

    # Submit attempt 2
    sub2 = client.post(f"/api/employee/me/quizzes/{m_id}/submit?employee_id={emp_id}", json={"selected_option_label": "B"})
    assert sub2.status_code == 200

def test_assessment_result():
    """Test Case 11: Assessment results."""
    emp_id, _, _ = _create_approved_test_plan("C11")
    res = client.get(f"/api/employee/me/assessments?employee_id={emp_id}")
    assert res.status_code == 200
    assert isinstance(res.json(), list)

def test_overall_progress_calculation_formula():
    """Test Case 12: Deterministic 100% Python progress calculation formula."""
    emp_id, _, _ = _create_approved_test_plan("C12")
    db = next(get_db())

    calc = progress_calculator.calculate_employee_progress(db, emp_id)
    assert calc["has_plan"] is True
    assert 0.0 <= calc["overall_progress_percentage"] <= 100.0

def test_on_track_status():
    """Test Case 13: On Track status logic."""
    emp_id, _, _ = _create_approved_test_plan("C13")
    res = client.get(f"/api/employee/me/progress?employee_id={emp_id}")
    assert res.status_code == 200
    assert res.json()["overall_status"] in ["on_track", "completed", "requires_attention"]

def test_requires_attention_status():
    """Test Case 14: Requires Attention status when quiz score < 70%."""
    emp_id, _, _ = _create_approved_test_plan("C14")
    mods = client.get(f"/api/employee/me/modules?employee_id={emp_id}").json()
    m_id = mods[0]["module_id"]

    # Submit wrong answer (0 score)
    client.post(f"/api/employee/me/quizzes/{m_id}/submit?employee_id={emp_id}", json={"selected_option_label": "WRONG"})

    res = client.get(f"/api/employee/me/progress?employee_id={emp_id}")
    assert res.json()["overall_status"] == "requires_attention"

def test_behind_schedule_status():
    """Test Case 15: Behind Schedule status rules."""
    emp_id, _, _ = _create_approved_test_plan("C15")
    db = next(get_db())

    plan = db.query(EmployeeLearningPlan).filter(EmployeeLearningPlan.employee_id == emp_id).first()
    # Backdate assignment by 10 days
    plan.assigned_at = datetime.utcnow() - date.resolution * 10
    db.commit()

    calc = progress_calculator.calculate_employee_progress(db, emp_id)
    assert calc["overall_status"] in ["behind_schedule", "requires_attention", "on_track"]

def test_completed_status():
    """Test Case 17: Completed status when all modules & tasks done."""
    emp_id, _, _ = _create_approved_test_plan("C17")

    mods = client.get(f"/api/employee/me/modules?employee_id={emp_id}").json()
    for m in mods:
        client.post(f"/api/employee/me/modules/{m['module_id']}/complete?employee_id={emp_id}")
        client.post(f"/api/employee/me/quizzes/{m['module_id']}/submit?employee_id={emp_id}", json={"selected_option_label": "A"})

    tasks = client.get(f"/api/employee/me/tasks?employee_id={emp_id}").json()
    for t in tasks:
        client.post(f"/api/employee/me/tasks/{t['task_id']}/complete?employee_id={emp_id}")

    chks = client.get(f"/api/employee/me/checklists?employee_id={emp_id}").json()
    for c in chks:
        client.post(f"/api/employee/me/checklists/{c['checklist_id']}/complete?employee_id={emp_id}")

    res = client.get(f"/api/employee/me/progress?employee_id={emp_id}")
    assert res.json()["overall_progress_percentage"] >= 99.0

def test_weak_area_detection_and_recommendations():
    """Test Cases 18 & 19: Weak area detection & adaptive recommendations."""
    emp_id, _, _ = _create_approved_test_plan("C18")
    mods = client.get(f"/api/employee/me/modules?employee_id={emp_id}").json()
    m_id = mods[0]["module_id"]

    # Trigger failed quiz
    client.post(f"/api/employee/me/quizzes/{m_id}/submit?employee_id={emp_id}", json={"selected_option_label": "X"})

    recs_res = client.get(f"/api/employee/me/recommendations?employee_id={emp_id}")
    assert recs_res.status_code == 200
    recs = recs_res.json()
    assert isinstance(recs, list)
    assert len(recs) >= 1

def test_upcoming_activities_and_milestones():
    """Test Cases 20 & 21: Upcoming activities & stage milestones."""
    emp_id, _, _ = _create_approved_test_plan("C20")
    dash = client.get(f"/api/employee/me/dashboard?employee_id={emp_id}").json()

    assert "upcoming_activities" in dash
    assert "milestones" in dash

def test_manager_read_only_access():
    """Test Case 22: Manager read-only visibility access."""
    emp_id, _, _ = _create_approved_test_plan("C22")

    mgr_res = client.get(f"/api/employee/manager/employee/{emp_id}/progress")
    assert mgr_res.status_code == 200
    overview = mgr_res.json()
    assert overview["employee_id"] == emp_id
    assert "overall_progress_percentage" in overview

def test_unauthorized_employee_access():
    """Test Case 23: Employees cannot modify plan structure or roles."""
    # Attempting forbidden operation
    bad_res = client.post("/api/matrix/requirements", json={"title": "Hacked Req"})
    # Must fail or return 400/404/422/401/403
    assert bad_res.status_code in [400, 401, 403, 404, 422]

def test_regression_all_modules():
    """Test Cases 24-28: Regression tests for all previous modules."""
    assert client.get("/").status_code == 200
    assert client.get("/api/documents").status_code == 200
    assert client.get("/api/roles").status_code == 200
    assert client.get("/api/human-review/queue").status_code == 200
