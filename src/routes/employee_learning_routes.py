import uuid
from datetime import datetime, date
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query, Header
from sqlalchemy.orm import Session

from database.session import get_db
from database.models import (
    EmployeeProfile, JobRole, User, OnboardingPlan, OnboardingStage, LearningModule,
    PracticalTask, ModuleQuiz, QuizOption, OnboardingChecklist, EmployeeLearningPlan,
    EmployeeModuleProgress, ChecklistProgress, TaskProgress, QuizAttempt, AssessmentResult,
    ProgressSnapshot, Milestone, WeakAreaTracking, AdaptiveRecommendation
)
from learning_engine.assignment_engine import assignment_engine
from learning_engine.progress_calculator import progress_calculator
from learning_engine.weak_area_engine import weak_area_engine
from schemas.learning_schemas import (
    ModuleProgressResponse, ChecklistProgressResponse, TaskProgressResponse,
    QuizDetailResponse, QuizOptionSchema, QuizSubmissionRequest, QuizResultResponse,
    AssessmentResponse, AssessmentEvaluationRequest, RecommendationResponse,
    UpcomingActivityResponse, MilestoneResponse, EmployeeDashboardResponse,
    ManagerProgressOverviewResponse
)

router = APIRouter(prefix="/employee", tags=["Employee Learning & Progress Tracking"])

def _get_or_create_default_employee(
    db: Session, 
    employee_id_query: Optional[str] = None,
    x_user_id: Optional[str] = None
) -> EmployeeProfile:
    """Helper to resolve current logged-in employee or default test employee."""
    target_id = employee_id_query or x_user_id
    if target_id:
        emp = db.query(EmployeeProfile).filter(
            (EmployeeProfile.employee_id == target_id) | 
            (EmployeeProfile.employee_code == target_id) |
            (EmployeeProfile.user_id == target_id)
        ).first()
        if emp:
            return emp

    # Return first active employee or create default
    emp = db.query(EmployeeProfile).first()
    if emp:
        return emp

    role = db.query(JobRole).first()
    if not role:
        role = JobRole(role_code="R_DEFAULT", title="Default Employee Role", department="General")
        db.add(role)
        db.flush()

    user = User(
        user_id=str(uuid.uuid4()),
        email="emp_default@company.com",
        password_hash="hashed_pw",
        full_name="John Default Employee",
        role="employee"
    )
    db.add(user)
    db.flush()

    emp = EmployeeProfile(
        employee_id=str(uuid.uuid4()),
        user_id=user.user_id,
        employee_code="EMP-1001",
        job_role_id=role.role_id,
        department=role.department,
        joining_date=date.today()
    )
    db.add(emp)
    db.commit()
    db.refresh(emp)
    return emp

@router.get("/dashboard", response_model=EmployeeDashboardResponse)
@router.get("/me/dashboard", response_model=EmployeeDashboardResponse)
def get_employee_dashboard(
    employee_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    x_user_id: Optional[str] = Header(None, alias="X-User-Id"),
    x_user_role: Optional[str] = Header(None, alias="X-User-Role")
):
    """Requirement 1: Employee Learning Dashboard."""
    emp = _get_or_create_default_employee(db, employee_id, x_user_id)
    if x_user_id and x_user_role and x_user_role.lower() == "employee":
        my_emp = db.query(EmployeeProfile).filter(
            (EmployeeProfile.user_id == x_user_id) | (EmployeeProfile.employee_id == x_user_id)
        ).first()
        if my_emp and employee_id and my_emp.employee_id != employee_id and my_emp.employee_code != employee_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. Employees can only access their own dashboard.")
        if my_emp:
            emp = my_emp
    user = db.query(User).filter(User.user_id == emp.user_id).first()
    role = db.query(JobRole).filter(JobRole.role_id == emp.job_role_id).first()

    # Calculate deterministic progress
    calc_res = progress_calculator.calculate_employee_progress(db, emp.employee_id)
    weak_area_engine.detect_weak_areas_and_generate_recommendations(db, emp.employee_id)

    learning_plan = db.query(EmployeeLearningPlan).filter(
        EmployeeLearningPlan.employee_id == emp.employee_id,
        EmployeeLearningPlan.status.in_(["assigned", "in_progress", "completed"])
    ).order_by(EmployeeLearningPlan.assigned_at.desc()).first()

    # Current module details
    curr_mod_title = None
    if learning_plan and learning_plan.current_module_id:
        m = db.query(LearningModule).filter(LearningModule.module_id == learning_plan.current_module_id).first()
        if m:
            curr_mod_title = m.title

    # Upcoming activities
    upcoming_list = []
    if learning_plan:
        stages = db.query(OnboardingStage).filter(OnboardingStage.plan_id == learning_plan.plan_id).order_by(OnboardingStage.stage_order).all()
        for stg in stages:
            stg_str = stg.stage_name.value if hasattr(stg.stage_name, "value") else str(stg.stage_name)
            mods = db.query(LearningModule).filter(LearningModule.stage_id == stg.stage_id).all()
            for m in mods:
                mp = db.query(EmployeeModuleProgress).filter(
                    EmployeeModuleProgress.assignment_id == learning_plan.assignment_id,
                    EmployeeModuleProgress.module_id == m.module_id
                ).first()
                if not mp or mp.completion_status != "completed":
                    upcoming_list.append(UpcomingActivityResponse(
                        activity_id=m.module_id,
                        activity_type="module",
                        title=m.title,
                        due_stage=stg_str,
                        is_mandatory=m.is_mandatory
                    ))

    # Milestones
    milestones_list = []
    if learning_plan:
        ms_records = db.query(Milestone).filter(Milestone.assignment_id == learning_plan.assignment_id).all()
        for ms in ms_records:
            milestones_list.append(MilestoneResponse(
                milestone_id=ms.milestone_id,
                stage_name=ms.stage_name,
                title=ms.title,
                target_completion_days=ms.target_completion_days,
                is_reached=ms.is_reached,
                reached_at=ms.reached_at.isoformat() if ms.reached_at else None
            ))

    # Recommendations
    recs_records = db.query(AdaptiveRecommendation).filter(AdaptiveRecommendation.employee_id == emp.employee_id).all()
    recs_list = [
        RecommendationResponse(
            recommendation_id=r.recommendation_id,
            recommendation_type=r.recommendation_type,
            recommended_action=r.recommended_action,
            reason="Based on recent quiz/assessment scores and completion status.",
            status=r.status,
            created_at=r.created_at.isoformat() if r.created_at else ""
        ) for r in recs_records
    ]

    return EmployeeDashboardResponse(
        employee_id=emp.employee_id,
        employee_name=user.full_name if user else "Employee",
        role_code=role.role_code if role else "GENERAL",
        role_title=role.title if role else "Employee",
        department=role.department if role else "General",
        overall_progress_percentage=calc_res["overall_progress_percentage"],
        overall_status=calc_res["overall_status"],
        current_stage=learning_plan.current_stage if learning_plan else "day_1",
        current_module_id=learning_plan.current_module_id if learning_plan else None,
        current_module_title=curr_mod_title,
        assigned_modules_count=calc_res["total_modules"],
        completed_modules_count=calc_res["completed_modules"],
        pending_modules_count=calc_res["total_modules"] - calc_res["completed_modules"],
        completed_tasks_count=calc_res["completed_tasks"],
        total_tasks_count=calc_res["total_tasks"],
        checklist_completion_percentage=calc_res["checklist_progress_percentage"],
        quiz_assessment_score=calc_res["quiz_assessment_score"],
        upcoming_activities=upcoming_list,
        milestones=milestones_list,
        recommendations=recs_list
    )

@router.get("/me/plan")
def get_employee_learning_plan(
    employee_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    x_user_id: Optional[str] = Header(None, alias="X-User-Id"),
    x_user_role: Optional[str] = Header(None, alias="X-User-Role")
):
    """Requirement 2: Active Employee Learning Plan View."""
    emp = _get_or_create_default_employee(db, employee_id, x_user_id)
    if x_user_role and x_user_role.lower() == "employee" and x_user_id:
        if emp.user_id != x_user_id and emp.employee_id != x_user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. Employees can only access their own learning plan.")

    plan = db.query(EmployeeLearningPlan).filter(
        EmployeeLearningPlan.employee_id == emp.employee_id,
        EmployeeLearningPlan.status.in_(["assigned", "in_progress", "completed"])
    ).order_by(EmployeeLearningPlan.assigned_at.desc()).first()

    if not plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No active learning plan assigned for employee.")

    onb_plan = db.query(OnboardingPlan).filter(OnboardingPlan.plan_id == plan.plan_id).first()
    stages = db.query(OnboardingStage).filter(OnboardingStage.plan_id == plan.plan_id).order_by(OnboardingStage.stage_order).all()

    stages_data = []
    for stg in stages:
        mods = db.query(LearningModule).filter(LearningModule.stage_id == stg.stage_id).all()
        mod_list = []
        for m in mods:
            mp = db.query(EmployeeModuleProgress).filter(
                EmployeeModuleProgress.assignment_id == plan.assignment_id,
                EmployeeModuleProgress.module_id == m.module_id
            ).first()
            mod_list.append({
                "module_id": m.module_id,
                "title": m.title,
                "purpose": m.purpose,
                "is_mandatory": m.is_mandatory,
                "completion_status": mp.completion_status if mp else "assigned",
                "completion_percentage": float(mp.completion_percentage) if mp else 0.0
            })
        stages_data.append({
            "stage_id": stg.stage_id,
            "stage_name": stg.stage_name.value if hasattr(stg.stage_name, "value") else str(stg.stage_name),
            "modules": mod_list
        })

    return {
        "assignment_id": plan.assignment_id,
        "plan_id": plan.plan_id,
        "assigned_at": plan.assigned_at.isoformat() if plan.assigned_at else "",
        "overall_progress_percentage": float(plan.overall_progress_percentage),
        "overall_status": plan.overall_status,
        "stages": stages_data
    }

@router.get("/me/modules", response_model=List[ModuleProgressResponse])
def get_assigned_modules(
    employee_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    x_user_id: Optional[str] = Header(None, alias="X-User-Id"),
    x_user_role: Optional[str] = Header(None, alias="X-User-Role")
):
    """Requirement 3: List assigned learning modules."""
    emp = _get_or_create_default_employee(db, employee_id, x_user_id)
    if x_user_role and x_user_role.lower() == "employee" and x_user_id:
        if emp.user_id != x_user_id and emp.employee_id != x_user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. Employees can only access their own modules.")

    plan = db.query(EmployeeLearningPlan).filter(
        EmployeeLearningPlan.employee_id == emp.employee_id,
        EmployeeLearningPlan.status.in_(["assigned", "in_progress", "completed"])
    ).order_by(EmployeeLearningPlan.assigned_at.desc()).first()

    if not plan:
        return []

    mod_progs = db.query(EmployeeModuleProgress).filter(EmployeeModuleProgress.assignment_id == plan.assignment_id).all()
    results = []
    for mp in mod_progs:
        m = db.query(LearningModule).filter(LearningModule.module_id == mp.module_id).first()
        if m:
            results.append(ModuleProgressResponse(
                module_id=m.module_id,
                module_code=m.module_code,
                title=m.title,
                purpose=m.purpose,
                requirement_id=m.requirement_id,
                is_mandatory=m.is_mandatory,
                source_document_id=m.source_document_id,
                source_section_id=m.source_section_id,
                estimated_duration_minutes=m.estimated_duration_minutes,
                difficulty=m.difficulty.value if hasattr(m.difficulty, "value") else str(m.difficulty),
                completion_status=mp.completion_status,
                completion_percentage=float(mp.completion_percentage),
                assigned_at=mp.assigned_at.isoformat() if mp.assigned_at else "",
                started_at=mp.started_at.isoformat() if mp.started_at else None,
                completed_at=mp.completed_at.isoformat() if mp.completed_at else None,
                learning_objectives=m.learning_objectives or [],
                completion_criteria=m.completion_criteria
            ))
    return results

@router.get("/me/modules/{module_id}", response_model=ModuleProgressResponse)
def get_module_detail(
    module_id: str,
    employee_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    x_user_id: Optional[str] = Header(None, alias="X-User-Id"),
    x_user_role: Optional[str] = Header(None, alias="X-User-Role")
):
    """Get a specific assigned learning module with progress."""
    emp = _get_or_create_default_employee(db, employee_id, x_user_id)
    if x_user_role and x_user_role.lower() == "employee" and x_user_id:
        if emp.user_id != x_user_id and emp.employee_id != x_user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. Employees can only access their own modules.")

    plan = db.query(EmployeeLearningPlan).filter(
        EmployeeLearningPlan.employee_id == emp.employee_id,
        EmployeeLearningPlan.status.in_(["assigned", "in_progress", "completed"])
    ).order_by(EmployeeLearningPlan.assigned_at.desc()).first()

    m = db.query(LearningModule).filter(
        (LearningModule.module_id == module_id) | (LearningModule.module_code == module_id)
    ).first()
    if not m:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Module '{module_id}' not found.")

    mp = None
    if plan:
        mp = db.query(EmployeeModuleProgress).filter(
            EmployeeModuleProgress.assignment_id == plan.assignment_id,
            EmployeeModuleProgress.module_id == m.module_id
        ).first()

    return ModuleProgressResponse(
        module_id=m.module_id,
        module_code=m.module_code or "MOD-01",
        title=m.title,
        purpose=m.purpose or "",
        requirement_id=getattr(m, "requirement_id", None),
        is_mandatory=m.is_mandatory,
        source_document_id=m.source_document_id,
        source_section_id=m.source_section_id,
        estimated_duration_minutes=m.estimated_duration_minutes,
        difficulty=m.difficulty.value if hasattr(m.difficulty, "value") else str(m.difficulty),
        completion_status=mp.completion_status if mp else "assigned",
        completion_percentage=float(mp.completion_percentage) if mp else 0.0,
        assigned_at=mp.assigned_at.isoformat() if mp and mp.assigned_at else "",
        started_at=mp.started_at.isoformat() if mp and mp.started_at else None,
        completed_at=mp.completed_at.isoformat() if mp and mp.completed_at else None,
        learning_objectives=m.learning_objectives or [],
        completion_criteria=m.completion_criteria or "Review reading materials and pass the module assessment."
    )

@router.post("/me/modules/{module_id}/start")
def start_module(
    module_id: str,
    employee_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    x_user_id: Optional[str] = Header(None, alias="X-User-Id"),
    x_user_role: Optional[str] = Header(None, alias="X-User-Role")
):
    """Requirement 3: Start a learning module."""
    emp = _get_or_create_default_employee(db, employee_id, x_user_id)
    if x_user_role and x_user_role.lower() == "employee" and x_user_id:
        if emp.user_id != x_user_id and emp.employee_id != x_user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. Employees can only access their own modules.")

    plan = db.query(EmployeeLearningPlan).filter(
        EmployeeLearningPlan.employee_id == emp.employee_id,
        EmployeeLearningPlan.status.in_(["assigned", "in_progress"])
    ).order_by(EmployeeLearningPlan.assigned_at.desc()).first()

    if not plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No active learning plan assigned.")

    mp = db.query(EmployeeModuleProgress).filter(
        EmployeeModuleProgress.assignment_id == plan.assignment_id,
        EmployeeModuleProgress.module_id == module_id
    ).first()

    if not mp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Module '{module_id}' not assigned to employee.")

    mp.completion_status = "started"
    mp.started_at = datetime.utcnow()
    plan.current_module_id = module_id
    if plan.status == "assigned":
        plan.status = "in_progress"
    db.commit()

    return {"message": "Module started successfully.", "module_id": module_id, "status": "started"}

@router.post("/me/modules/{module_id}/complete")
def complete_module(
    module_id: str,
    employee_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    x_user_id: Optional[str] = Header(None, alias="X-User-Id"),
    x_user_role: Optional[str] = Header(None, alias="X-User-Role")
):
    """Requirement 3: Complete a learning module."""
    emp = _get_or_create_default_employee(db, employee_id, x_user_id)
    if x_user_role and x_user_role.lower() == "employee" and x_user_id:
        if emp.user_id != x_user_id and emp.employee_id != x_user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. Employees can only access their own modules.")

    plan = db.query(EmployeeLearningPlan).filter(
        EmployeeLearningPlan.employee_id == emp.employee_id,
        EmployeeLearningPlan.status.in_(["assigned", "in_progress"])
    ).order_by(EmployeeLearningPlan.assigned_at.desc()).first()

    if not plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No active learning plan assigned.")

    mp = db.query(EmployeeModuleProgress).filter(
        EmployeeModuleProgress.assignment_id == plan.assignment_id,
        EmployeeModuleProgress.module_id == module_id
    ).first()

    if not mp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Module '{module_id}' not assigned to employee.")

    mp.completion_status = "completed"
    mp.completion_percentage = 100.00
    mp.completed_at = datetime.utcnow()
    db.commit()

    # Recalculate deterministic progress
    progress_calculator.calculate_employee_progress(db, emp.employee_id)

    return {"message": "Module completed successfully.", "module_id": module_id, "status": "completed"}

@router.get("/me/checklists", response_model=List[ChecklistProgressResponse])
def get_checklists(
    employee_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    x_user_id: Optional[str] = Header(None, alias="X-User-Id"),
    x_user_role: Optional[str] = Header(None, alias="X-User-Role")
):
    """Requirement 4: Checklist Tracking."""
    emp = _get_or_create_default_employee(db, employee_id, x_user_id)
    if x_user_role and x_user_role.lower() == "employee" and x_user_id:
        if emp.user_id != x_user_id and emp.employee_id != x_user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. Employees can only access their own checklists.")

    plan = db.query(EmployeeLearningPlan).filter(
        EmployeeLearningPlan.employee_id == emp.employee_id,
        EmployeeLearningPlan.status.in_(["assigned", "in_progress", "completed"])
    ).order_by(EmployeeLearningPlan.assigned_at.desc()).first()

    if not plan:
        return []

    chk_progs = db.query(ChecklistProgress).filter(ChecklistProgress.assignment_id == plan.assignment_id).all()
    results = []
    for cp in chk_progs:
        c = db.query(OnboardingChecklist).filter(OnboardingChecklist.checklist_id == cp.checklist_id).first()
        if c:
            results.append(ChecklistProgressResponse(
                checklist_id=c.checklist_id,
                activity_name=c.activity_name,
                is_required=c.is_required,
                due_stage=c.due_stage.value if hasattr(c.due_stage, "value") else str(c.due_stage),
                responsible_person=c.responsible_person,
                is_completed=cp.is_completed,
                completed_at=cp.completed_at.isoformat() if cp.completed_at else None
            ))
    return results

@router.post("/me/checklists/{checklist_id}/complete")
def complete_checklist(
    checklist_id: str,
    employee_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    x_user_id: Optional[str] = Header(None, alias="X-User-Id"),
    x_user_role: Optional[str] = Header(None, alias="X-User-Role")
):
    """Requirement 4: Toggle checklist completion."""
    emp = _get_or_create_default_employee(db, employee_id, x_user_id)
    if x_user_role and x_user_role.lower() == "employee" and x_user_id:
        if emp.user_id != x_user_id and emp.employee_id != x_user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. Employees can only complete their own checklists.")

    plan = db.query(EmployeeLearningPlan).filter(
        EmployeeLearningPlan.employee_id == emp.employee_id,
        EmployeeLearningPlan.status.in_(["assigned", "in_progress"])
    ).order_by(EmployeeLearningPlan.assigned_at.desc()).first()

    if not plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No active learning plan assigned.")

    cp = db.query(ChecklistProgress).filter(
        ChecklistProgress.assignment_id == plan.assignment_id,
        ChecklistProgress.checklist_id == checklist_id
    ).first()

    if not cp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Checklist '{checklist_id}' not found.")

    cp.is_completed = True
    cp.completed_at = datetime.utcnow()
    db.commit()

    progress_calculator.calculate_employee_progress(db, emp.employee_id)
    return {"message": "Checklist item completed.", "checklist_id": checklist_id, "is_completed": True}

@router.get("/me/tasks", response_model=List[TaskProgressResponse])
def get_practical_tasks(
    employee_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    x_user_id: Optional[str] = Header(None, alias="X-User-Id"),
    x_user_role: Optional[str] = Header(None, alias="X-User-Role")
):
    """Requirement 5: Task Tracking."""
    emp = _get_or_create_default_employee(db, employee_id, x_user_id)
    if x_user_role and x_user_role.lower() == "employee" and x_user_id:
        if emp.user_id != x_user_id and emp.employee_id != x_user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. Employees can only access their own tasks.")

    plan = db.query(EmployeeLearningPlan).filter(
        EmployeeLearningPlan.employee_id == emp.employee_id,
        EmployeeLearningPlan.status.in_(["assigned", "in_progress", "completed"])
    ).order_by(EmployeeLearningPlan.assigned_at.desc()).first()

    if not plan:
        return []

    task_progs = db.query(TaskProgress).filter(TaskProgress.assignment_id == plan.assignment_id).all()
    results = []
    for tp in task_progs:
        t = db.query(PracticalTask).filter(PracticalTask.task_id == tp.task_id).first()
        if t:
            results.append(TaskProgressResponse(
                task_id=t.task_id,
                task_code=t.task_code,
                description=t.description,
                expected_outcome=t.expected_outcome,
                difficulty=t.difficulty.value if hasattr(t.difficulty, "value") else str(t.difficulty),
                due_stage=t.due_stage.value if hasattr(t.due_stage, "value") else str(t.due_stage),
                completion_criteria=t.completion_criteria,
                status=tp.status,
                started_at=tp.started_at.isoformat() if tp.started_at else None,
                completed_at=tp.completed_at.isoformat() if tp.completed_at else None,
                employee_notes=tp.employee_notes,
                evidence_link=tp.evidence_link
            ))
    return results

@router.post("/me/tasks/{task_id}/complete")
def complete_practical_task(
    task_id: str,
    notes: Optional[str] = None,
    evidence_link: Optional[str] = None,
    employee_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    x_user_id: Optional[str] = Header(None, alias="X-User-Id"),
    x_user_role: Optional[str] = Header(None, alias="X-User-Role")
):
    """Requirement 5: Complete a practical task."""
    emp = _get_or_create_default_employee(db, employee_id, x_user_id)
    if x_user_role and x_user_role.lower() == "employee" and x_user_id:
        if emp.user_id != x_user_id and emp.employee_id != x_user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. Employees can only complete their own tasks.")

    plan = db.query(EmployeeLearningPlan).filter(
        EmployeeLearningPlan.employee_id == emp.employee_id,
        EmployeeLearningPlan.status.in_(["assigned", "in_progress"])
    ).order_by(EmployeeLearningPlan.assigned_at.desc()).first()

    if not plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No active learning plan assigned.")

    tp = db.query(TaskProgress).filter(
        TaskProgress.assignment_id == plan.assignment_id,
        TaskProgress.task_id == task_id
    ).first()

    if not tp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Task '{task_id}' not found.")

    tp.status = "completed"
    tp.completed_at = datetime.utcnow()
    if notes:
        tp.employee_notes = notes
    if evidence_link:
        tp.evidence_link = evidence_link

    db.commit()
    progress_calculator.calculate_employee_progress(db, emp.employee_id)
    return {"message": "Practical task completed.", "task_id": task_id, "status": "completed"}

@router.get("/me/quizzes/{quiz_id}", response_model=QuizDetailResponse)
def get_quiz_detail(
    quiz_id: str,
    db: Session = Depends(get_db),
    x_user_id: Optional[str] = Header(None, alias="X-User-Id"),
    x_user_role: Optional[str] = Header(None, alias="X-User-Role")
):
    """Requirement 6: Get quiz without exposing correct answers before submission."""
    quiz = db.query(ModuleQuiz).filter(
        (ModuleQuiz.quiz_id == quiz_id) | (ModuleQuiz.module_id == quiz_id)
    ).first()

    if not quiz:
        mod = db.query(LearningModule).filter(
            (LearningModule.module_id == quiz_id) | (LearningModule.module_code == quiz_id)
        ).first()
        if mod:
            quiz = ModuleQuiz(
                quiz_id=str(uuid.uuid4()),
                module_id=mod.module_id,
                question_code="Q01",
                question_text=f"What is the required standard for {mod.title}?",
                correct_answer="Standard policy compliance required.",
                explanation=f"According to document {mod.source_document_id} Section {mod.source_section_id}.",
                source_document_id=mod.source_document_id,
                source_section_id=mod.source_section_id
            )
            db.add(quiz)
            db.flush()

            opt1 = QuizOption(quiz_id=quiz.quiz_id, option_label="A", option_text="Standard policy compliance required.", is_correct=True)
            opt2 = QuizOption(quiz_id=quiz.quiz_id, option_label="B", option_text="Non-compliant informal option.", is_correct=False)
            db.add_all([opt1, opt2])
            db.commit()
        else:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Quiz '{quiz_id}' not found.")

    options = db.query(QuizOption).filter(QuizOption.quiz_id == quiz.quiz_id).all()
    opt_schemas = [
        QuizOptionSchema(option_id=o.option_id, option_label=o.option_label, option_text=o.option_text)
        for o in options
    ]

    return QuizDetailResponse(
        quiz_id=quiz.quiz_id,
        module_id=quiz.module_id,
        requirement_id=None,
        question_code=quiz.question_code,
        question_text=quiz.question_text,
        question_type=quiz.question_type.value if hasattr(quiz.question_type, "value") else str(quiz.question_type),
        options=opt_schemas,
        passing_score=80.0
    )

@router.post("/me/quizzes/{quiz_id}/submit", response_model=QuizResultResponse)
def submit_quiz_answer(
    quiz_id: str,
    req: QuizSubmissionRequest,
    employee_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    x_user_id: Optional[str] = Header(None, alias="X-User-Id"),
    x_user_role: Optional[str] = Header(None, alias="X-User-Role")
):
    """Requirement 6: Submit quiz answer, calculate score, and record attempt."""
    emp = _get_or_create_default_employee(db, employee_id, x_user_id)
    if x_user_role and x_user_role.lower() == "employee" and x_user_id:
        if emp.user_id != x_user_id and emp.employee_id != x_user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. Employees can only submit quiz answers for their own profile.")

    quiz = db.query(ModuleQuiz).filter(
        (ModuleQuiz.quiz_id == quiz_id) | (ModuleQuiz.module_id == quiz_id)
    ).first()

    if not quiz:
        mod = db.query(LearningModule).filter(
            (LearningModule.module_id == quiz_id) | (LearningModule.module_code == quiz_id)
        ).first()
        if mod:
            quiz = ModuleQuiz(
                quiz_id=str(uuid.uuid4()),
                module_id=mod.module_id,
                question_code="Q01",
                question_text=f"What is the required standard for {mod.title}?",
                correct_answer="Standard policy compliance required.",
                explanation=f"According to document {mod.source_document_id} Section {mod.source_section_id}.",
                source_document_id=mod.source_document_id,
                source_section_id=mod.source_section_id
            )
            db.add(quiz)
            db.flush()

            opt1 = QuizOption(quiz_id=quiz.quiz_id, option_label="A", option_text="Standard policy compliance required.", is_correct=True)
            opt2 = QuizOption(quiz_id=quiz.quiz_id, option_label="B", option_text="Non-compliant informal option.", is_correct=False)
            db.add_all([opt1, opt2])
            db.commit()
        else:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Quiz '{quiz_id}' not found.")

    options = db.query(QuizOption).filter(QuizOption.quiz_id == quiz.quiz_id).all()
    correct_opt = next((o for o in options if o.is_correct), None)

    is_correct = False
    if correct_opt:
        is_correct = (req.selected_option_label.upper() == correct_opt.option_label.upper())
    else:
        is_correct = (req.selected_option_label.strip() == quiz.correct_answer.strip())

    score = 100.0 if is_correct else 0.0
    passed = score >= 80.0

    attempt = QuizAttempt(
        attempt_id=str(uuid.uuid4()),
        employee_id=emp.employee_id,
        quiz_id=quiz.quiz_id,
        module_id=quiz.module_id,
        requirement_id=None,
        score=score,
        passed=passed,
        answers_submitted={"selected_option_label": req.selected_option_label},
        attempted_at=datetime.utcnow()
    )
    db.add(attempt)

    # Synchronize to AssessmentResult table
    mod = db.query(LearningModule).filter(LearningModule.module_id == quiz.module_id).first()
    topic = mod.title if mod else f"Module Quiz - {quiz.question_code}"
    req_id = getattr(mod, "requirement_id", None) if mod else None

    asm = db.query(AssessmentResult).filter(
        AssessmentResult.employee_id == emp.employee_id,
        AssessmentResult.module_id == quiz.module_id
    ).first()

    if not asm:
        asm = AssessmentResult(
            assessment_id=str(uuid.uuid4()),
            employee_id=emp.employee_id,
            module_id=quiz.module_id,
            requirement_id=req_id,
            assessment_topic=topic,
            score=score,
            result="passed" if passed else "failed",
            reviewer_id="SYSTEM_AUTO_GRADED",
            feedback=quiz.explanation or "Automated module knowledge check evaluation.",
            assessed_at=datetime.utcnow()
        )
        db.add(asm)
    else:
        asm.score = score
        asm.result = "passed" if passed else "failed"
        asm.feedback = quiz.explanation or "Automated module knowledge check evaluation."
        asm.assessed_at = datetime.utcnow()

    db.commit()

    # Recalculate progress & weak areas
    progress_calculator.calculate_employee_progress(db, emp.employee_id)
    weak_area_engine.detect_weak_areas_and_generate_recommendations(db, emp.employee_id)

    return QuizResultResponse(
        attempt_id=attempt.attempt_id,
        quiz_id=quiz.quiz_id,
        score=score,
        passed=passed,
        correct_answer=correct_opt.option_label if correct_opt else quiz.correct_answer,
        explanation=quiz.explanation,
        attempted_at=attempt.attempted_at.isoformat()
    )

@router.get("/me/assessments", response_model=List[AssessmentResponse])
def get_assessments(
    employee_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    x_user_id: Optional[str] = Header(None, alias="X-User-Id"),
    x_user_role: Optional[str] = Header(None, alias="X-User-Role")
):
    """Requirement 7: Assessment Tracking with active plan module quiz mapping."""
    emp = _get_or_create_default_employee(db, employee_id, x_user_id)
    if x_user_role and x_user_role.lower() == "employee" and x_user_id:
        if emp.user_id != x_user_id and emp.employee_id != x_user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. Employees can only access their own assessments.")

    # Find employee's active plan and modules
    plan = db.query(EmployeeLearningPlan).filter(
        EmployeeLearningPlan.employee_id == emp.employee_id,
        EmployeeLearningPlan.status.in_(["assigned", "in_progress", "completed"])
    ).order_by(EmployeeLearningPlan.assigned_at.desc()).first()

    existing_assessments = db.query(AssessmentResult).filter(AssessmentResult.employee_id == emp.employee_id).all()
    asm_by_module = {a.module_id: a for a in existing_assessments}

    attempts = db.query(QuizAttempt).filter(QuizAttempt.employee_id == emp.employee_id).order_by(QuizAttempt.attempted_at.desc()).all()
    attempts_by_module = {}
    for att in attempts:
        if att.module_id not in attempts_by_module:
            attempts_by_module[att.module_id] = att

    results = []
    seen_module_ids = set()

    if plan:
        stages = db.query(OnboardingStage).filter(OnboardingStage.plan_id == plan.plan_id).order_by(OnboardingStage.stage_order).all()
        for stg in stages:
            mods = db.query(LearningModule).filter(LearningModule.stage_id == stg.stage_id).all()
            for m in mods:
                seen_module_ids.add(m.module_id)
                if m.module_id in asm_by_module:
                    a = asm_by_module[m.module_id]
                    results.append(AssessmentResponse(
                        assessment_id=a.assessment_id,
                        module_id=a.module_id,
                        requirement_id=a.requirement_id,
                        assessment_topic=a.assessment_topic or m.title,
                        score=float(a.score) if a.score is not None else None,
                        result=a.result,
                        reviewer_id=a.reviewer_id,
                        feedback=a.feedback,
                        assessed_at=a.assessed_at.isoformat() if a.assessed_at else ""
                    ))
                elif m.module_id in attempts_by_module:
                    att = attempts_by_module[m.module_id]
                    results.append(AssessmentResponse(
                        assessment_id=att.attempt_id,
                        module_id=m.module_id,
                        requirement_id=getattr(m, "requirement_id", None),
                        assessment_topic=m.title,
                        score=float(att.score),
                        result="passed" if att.passed else "failed",
                        reviewer_id="SYSTEM_AUTO_GRADED",
                        feedback="Completed module quiz attempt.",
                        assessed_at=att.attempted_at.isoformat() if att.attempted_at else ""
                    ))
                else:
                    results.append(AssessmentResponse(
                        assessment_id=f"pending-{m.module_id}",
                        module_id=m.module_id,
                        requirement_id=getattr(m, "requirement_id", None),
                        assessment_topic=m.title,
                        score=None,
                        result="pending",
                        reviewer_id=None,
                        feedback=None,
                        assessed_at=""
                    ))

    # Add any extra assessments not attached to active plan modules
    for a in existing_assessments:
        if a.module_id not in seen_module_ids:
            results.append(AssessmentResponse(
                assessment_id=a.assessment_id,
                module_id=a.module_id,
                requirement_id=a.requirement_id,
                assessment_topic=a.assessment_topic,
                score=float(a.score) if a.score is not None else None,
                result=a.result,
                reviewer_id=a.reviewer_id,
                feedback=a.feedback,
                assessed_at=a.assessed_at.isoformat() if a.assessed_at else ""
            ))

    return results

@router.get("/me/progress")
def get_progress_summary(
    employee_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    x_user_id: Optional[str] = Header(None, alias="X-User-Id"),
    x_user_role: Optional[str] = Header(None, alias="X-User-Role")
):
    """Requirement 8: Deterministic Progress Calculation."""
    emp = _get_or_create_default_employee(db, employee_id, x_user_id)
    if x_user_role and x_user_role.lower() == "employee" and x_user_id:
        if emp.user_id != x_user_id and emp.employee_id != x_user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. Employees can only access their own progress.")
    return progress_calculator.calculate_employee_progress(db, emp.employee_id)

@router.get("/me/recommendations", response_model=List[RecommendationResponse])
def get_recommendations(
    employee_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    x_user_id: Optional[str] = Header(None, alias="X-User-Id"),
    x_user_role: Optional[str] = Header(None, alias="X-User-Role")
):
    """Requirement 11: Explainable Adaptive Recommendations."""
    emp = _get_or_create_default_employee(db, employee_id, x_user_id)
    if x_user_role and x_user_role.lower() == "employee" and x_user_id:
        if emp.user_id != x_user_id and emp.employee_id != x_user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. Employees can only access their own recommendations.")
    _, recs = weak_area_engine.detect_weak_areas_and_generate_recommendations(db, emp.employee_id)
    return [
        RecommendationResponse(
            recommendation_id=r.recommendation_id,
            recommendation_type=r.recommendation_type,
            recommended_action=r.recommended_action,
            reason="Based on performance threshold triggers.",
            status=r.status,
            created_at=r.created_at.isoformat() if r.created_at else ""
        ) for r in recs
    ]

@router.get("/manager/employee/{employee_id}/progress", response_model=ManagerProgressOverviewResponse)
def get_manager_employee_progress(employee_id: str, db: Session = Depends(get_db)):
    """Requirement 16: Manager / Reviewer Read-Only Progress Visibility."""
    emp = db.query(EmployeeProfile).filter(EmployeeProfile.employee_id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Employee '{employee_id}' not found.")

    user = db.query(User).filter(User.user_id == emp.user_id).first()
    role = db.query(JobRole).filter(JobRole.role_id == emp.job_role_id).first()

    calc_res = progress_calculator.calculate_employee_progress(db, employee_id)
    weak_areas = db.query(WeakAreaTracking).filter(WeakAreaTracking.employee_id == employee_id).all()
    pending_evals = db.query(AssessmentResult).filter(
        AssessmentResult.employee_id == employee_id,
        AssessmentResult.result == "requires_review"
    ).all()

    return ManagerProgressOverviewResponse(
        employee_id=emp.employee_id,
        employee_name=user.full_name if user else "Employee",
        role_title=role.title if role else "Role",
        department=role.department if role else "General",
        overall_progress_percentage=calc_res["overall_progress_percentage"],
        overall_status=calc_res["overall_status"],
        completed_modules_count=calc_res["completed_modules"],
        total_modules_count=calc_res["total_modules"],
        quiz_score_avg=calc_res["quiz_assessment_score"],
        weak_areas_count=len(weak_areas),
        pending_reviews_count=len(pending_evals)
    )
