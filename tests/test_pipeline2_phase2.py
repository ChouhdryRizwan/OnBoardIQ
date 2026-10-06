import pytest
import sys
from datetime import date
from fastapi.testclient import TestClient
from src.main import app
from database.session import init_db, get_db
from database.models import (
    JobRole, EmployeeProfile, RoleRequirementMatrix, CompanyDocument, DocumentChunk,
    OnboardingPlan, OnboardingStage, LearningModule, PracticalTask, ModuleQuiz,
    OnboardingChecklist, VerificationStatusEnum, RequirementTypeEnum, PriorityLevelEnum, OnboardingStageEnum, DocumentStatusEnum
)
from python_validation.validator import pipeline2_validator
from python_validation.coverage import coverage_validator
from python_validation.traceability import traceability_validator

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    init_db()

def test_pipeline2_no_genai_dependency_critical_rule():
    """Requirement 26: Pipeline 2 MUST NOT import or call GenAI provider/service."""
    import python_validation.validator as pv_mod
    import python_validation.coverage as cov_mod
    import python_validation.traceability as tr_mod

    # Check imported modules in python_validation namespace
    modules_imported = set(sys.modules.keys())
    assert "genai_pipeline.llm_client" not in pv_mod.__dict__, "Pipeline 2 validator must NOT import llm_client!"
    assert "google.generativeai" not in pv_mod.__dict__, "Pipeline 2 validator must NOT import Gemini API!"

def test_mandatory_coverage_calculation():
    """Requirement 20 & 4: Test exact mandatory coverage score formula (covered / total * 100)."""
    db = next(get_db())
    
    role = JobRole(role_code="R_COV_TEST", title="Coverage Analyst", department="Finance")
    db.add(role)
    db.flush()

    req1 = RoleRequirementMatrix(
        requirement_id="REQ-COV-01", job_role_id=role.role_id, policy_requirement="Pol 1",
        required_competency="Comp 1", is_mandatory=True, source_document_id="DOC-1", source_section_id="Sec-1"
    )
    req2 = RoleRequirementMatrix(
        requirement_id="REQ-COV-02", job_role_id=role.role_id, policy_requirement="Pol 2",
        required_competency="Comp 2", is_mandatory=True, source_document_id="DOC-1", source_section_id="Sec-2"
    )
    req3 = RoleRequirementMatrix(
        requirement_id="REQ-COV-03", job_role_id=role.role_id, policy_requirement="Pol 3",
        required_competency="Comp 3", is_mandatory=True, source_document_id="DOC-1", source_section_id="Sec-3"
    )
    db.add_all([req1, req2, req3])
    db.commit()

    # Create dummy modules covering REQ-COV-01 and REQ-COV-02 (2 out of 3)
    mod1 = LearningModule(stage_id="s1", module_code="M01", title="M1", purpose="P1", requirement_id="REQ-COV-01", is_mandatory=True, source_document_id="DOC-1", source_section_id="Sec-1", completion_criteria="Pass")
    mod2 = LearningModule(stage_id="s1", module_code="M02", title="M2", purpose="P2", requirement_id="REQ-COV-02", is_mandatory=True, source_document_id="DOC-1", source_section_id="Sec-2", completion_criteria="Pass")

    score, total, covered, missing, issues = coverage_validator.evaluate_mandatory_coverage([req1, req2, req3], [mod1, mod2])
    assert total == 3
    assert covered == 2
    assert len(missing) == 1
    assert missing[0].requirement_id == "REQ-COV-03"
    assert score == 66.67, f"Expected 66.67, got {score}"

def test_source_traceability_score_calculation():
    """Requirement 19 & 5: Test exact source traceability score formula and detection of missing/invalid citations."""
    db = next(get_db())

    # Active Document
    doc = CompanyDocument(
        document_id="DOC-TRACE-01", title="Trace Doc", category="hr_policy",
        version=1, effective_date=date(2026, 1, 1), status=DocumentStatusEnum.ACTIVE,
        file_format="pdf", file_path="p.pdf", file_size_bytes=100, content_hash="hash"
    )
    db.add(doc)

    chunk = DocumentChunk(
        document_id="DOC-TRACE-01", document_version=1, section_id="Sec-1",
        chunk_text="Chunk text", chunk_index=1
    )
    db.add(chunk)
    db.commit()

    cited_items = [
        {"source_document_id": "DOC-TRACE-01", "source_section_id": "Sec-1", "source_document_version": 1, "requirement_id": "REQ-1", "item_type": "module", "title": "Valid Mod"},
        {"source_document_id": "DOC-INVALID", "source_section_id": "Sec-1", "source_document_version": 1, "requirement_id": "REQ-2", "item_type": "module", "title": "Invalid Doc Mod"}
    ]

    score, valid_cnt, invalid_cnt, issues = traceability_validator.evaluate_source_traceability(db, cited_items, {})
    assert len(cited_items) == 2
    assert valid_cnt == 1
    assert invalid_cnt == 1
    assert score == 50.0

def test_pipeline2_full_validation_workflow_and_api_routes():
    """Test full Pipeline 2 validation API endpoints and ground-truth verification report output."""
    db = next(get_db())

    # 1. Setup Role
    role = JobRole(role_code="R_P2_API", title="Validation Engineer", department="QA")
    db.add(role)
    db.flush()

    # 2. Setup Document
    doc = CompanyDocument(
        document_id="POL-P2-001", title="QA Governance Standard", category="department_sop",
        version=1, effective_date=date(2026, 1, 1), status=DocumentStatusEnum.ACTIVE,
        file_format="pdf", file_path="qa.pdf", file_size_bytes=500, content_hash="qahash"
    )
    db.add(doc)
    db.flush()

    chunk = DocumentChunk(
        document_id="POL-P2-001", document_version=1, section_id="Sec-QA-1",
        chunk_text="QA testing procedures standard.", chunk_index=1
    )
    db.add(chunk)
    db.flush()

    # 3. Setup RRM Requirement
    rrm_req = RoleRequirementMatrix(
        requirement_id="REQ-P2-QA-01", job_role_id=role.role_id, title="QA Protocol",
        policy_requirement="Must run automated verification suite.", required_competency="Test Automation",
        is_mandatory=True, requirement_type=RequirementTypeEnum.MUST_KNOW, priority=PriorityLevelEnum.HIGH,
        due_stage=OnboardingStageEnum.DAY_1, source_document_id="POL-P2-001", source_document_version=1,
        source_section_id="Sec-QA-1", required_task_description="Execute test suite", required_assessment_topic="Test Automation"
    )
    db.add(rrm_req)
    db.commit()

    # 4. Create Employee & Generate Pipeline 1 Plan
    emp_res = client.post("/api/employees", json={
        "name": "Alice Tester", "email": "alice.tester@company.com", "role_identifier": "R_P2_API",
        "department": "QA", "experience_level": "intermediate", "joining_date": "2026-03-01"
    })
    assert emp_res.status_code == 201
    emp_id = emp_res.json()["employee_id"]

    gen_res = client.post("/api/pipeline1/generate", json={"employee_id": emp_id, "role_identifier": "R_P2_API"})
    assert gen_res.status_code == 201
    plan_id = gen_res.json()["plan_id"]

    # 5. Trigger Pipeline 2 Validation API
    val_res = client.post(f"/api/pipeline2/validate/{plan_id}")
    assert val_res.status_code == 200, val_res.text
    report_data = val_res.json()

    run_id = report_data["report_id"]
    assert report_data["mandatory_coverage_score"] == 100.0
    assert report_data["source_traceability_score"] == 100.0
    assert report_data["verification_status"] == "verified"

    # 6. Test GET /api/validation/{validation_run_id}
    get_run = client.get(f"/api/validation/{run_id}")
    assert get_run.status_code == 200
    assert get_run.json()["report_id"] == run_id

    # 7. Test GET /api/validation/{validation_run_id}/issues
    get_issues = client.get(f"/api/validation/{run_id}/issues")
    assert get_issues.status_code == 200
    assert isinstance(get_issues.json(), list)

    # 8. Test GET /api/validation/{validation_run_id}/comparison
    get_comp = client.get(f"/api/validation/{run_id}/comparison")
    assert get_comp.status_code == 200
    comp_list = get_comp.json()
    assert len(comp_list) >= 1
    assert comp_list[0]["requirement_id"] == "REQ-P2-QA-01"
    assert comp_list[0]["match"] is True

    # 9. Test GET /api/validation/{validation_run_id}/summary
    get_sum = client.get(f"/api/validation/{run_id}/summary")
    assert get_sum.status_code == 200
    assert get_sum.json()["mandatory_coverage_score"] == 100.0

    # 10. Test GET /api/validation/plan/{plan_id}/latest
    get_latest = client.get(f"/api/validation/plan/{plan_id}/latest")
    assert get_latest.status_code == 200
    assert get_latest.json()["report_id"] == run_id
