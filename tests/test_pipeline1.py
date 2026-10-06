from fastapi.testclient import TestClient
from datetime import date
from src.main import app
from database.session import get_db, init_db
from database.models import User, JobRole, EmployeeProfile, UserRoleEnum, DifficultyLevelEnum

def test_pipeline1_generation():
    init_db()
    db = next(get_db())
    client = TestClient(app)

    print("DEBUG TEST_PIPELINE1 ROUTES:", [r.path for r in app.routes if hasattr(r, 'path')])

    # 1. Ensure Role R001 exists
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

    # 2. Ensure Employee Profile EMP-1001 exists
    emp = db.query(EmployeeProfile).filter(EmployeeProfile.employee_code == "EMP-1001").first()
    if not emp:
        user = User(
            email="emp1001@example.com",
            password_hash="hashed_pw",
            full_name="Alice Smith",
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

    # 3. Call Pipeline 1 Generation endpoint
    payload = {
        "employee_id": emp.employee_id,
        "role_identifier": role.role_code,
        "model_name": "gemini-2.5-flash",
        "prompt_version": "v1.0.0"
    }

    response = client.post("/api/pipeline1/generate", json=payload)
    print("DEBUG TEST_PIPELINE1 RESPONSE:", response.status_code, response.text, payload)
    assert response.status_code == 201, f"Status: {response.status_code}, Text: {response.text}"
    data = response.json()

    assert "plan_id" in data
    assert data["employee_id"] == emp.employee_id
    assert "structured_json_output" in data
    json_out = data["structured_json_output"]
    assert "stages" in json_out
    assert len(json_out["stages"]) > 0
