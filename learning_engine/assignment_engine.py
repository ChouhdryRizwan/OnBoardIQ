import uuid
from datetime import datetime
from sqlalchemy.orm import Session
from database.models import (
    OnboardingPlan, EmployeeProfile, JobRole, OnboardingStage, LearningModule,
    OnboardingChecklist, PracticalTask, VerificationStatusEnum,
    EmployeeLearningPlan, EmployeeModuleProgress, ChecklistProgress, TaskProgress, Milestone
)

class PlanAssignmentEngine:
    """Manages the formal assignment of approved onboarding plans to employee learning dashboards."""

    @staticmethod
    def assign_approved_plan(db: Session, plan_id: str) -> EmployeeLearningPlan:
        """
        Assigns an approved onboarding plan to an employee's learning workflow.
        Requirement 2: Do NOT assign rejected or unapproved plans.
        """
        plan = db.query(OnboardingPlan).filter(OnboardingPlan.plan_id == plan_id).first()
        if not plan:
            raise ValueError(f"Onboarding plan '{plan_id}' not found.")

        status_str = plan.verification_status.value if hasattr(plan.verification_status, "value") else str(plan.verification_status)
        approved_statuses = ["verified", "verified_with_warning", "approved", "finalized"]

        if status_str not in approved_statuses:
            raise ValueError(f"Plan '{plan_id}' cannot be assigned. Verification status is '{status_str}'. Only approved/released plans can be assigned.")

        # Deactivate previous active learning plan for employee
        existing_plans = db.query(EmployeeLearningPlan).filter(
            EmployeeLearningPlan.employee_id == plan.employee_id,
            EmployeeLearningPlan.status.in_(["assigned", "in_progress"])
        ).all()
        for ep in existing_plans:
            ep.status = "superseded"

        # Create new EmployeeLearningPlan
        first_stage = db.query(OnboardingStage).filter(OnboardingStage.plan_id == plan_id).order_by(OnboardingStage.stage_order).first()
        stage_name_str = first_stage.stage_name.value if (first_stage and hasattr(first_stage.stage_name, "value")) else (str(first_stage.stage_name) if first_stage else "day_1")

        learning_plan = EmployeeLearningPlan(
            assignment_id=str(uuid.uuid4()),
            employee_id=plan.employee_id,
            plan_id=plan.plan_id,
            status="assigned",
            overall_progress_percentage=0.00,
            overall_status="on_track",
            current_stage=stage_name_str,
            assigned_at=datetime.utcnow()
        )
        db.add(learning_plan)
        db.flush()

        # Assign Modules
        stages = db.query(OnboardingStage).filter(OnboardingStage.plan_id == plan_id).all()
        for stg in stages:
            modules = db.query(LearningModule).filter(LearningModule.stage_id == stg.stage_id).all()
            for m in modules:
                mod_progress = EmployeeModuleProgress(
                    module_progress_id=str(uuid.uuid4()),
                    assignment_id=learning_plan.assignment_id,
                    employee_id=plan.employee_id,
                    module_id=m.module_id,
                    requirement_id=m.requirement_id,
                    completion_status="assigned",
                    completion_percentage=0.00,
                    assigned_at=datetime.utcnow()
                )
                db.add(mod_progress)

                # Assign Tasks
                tasks = db.query(PracticalTask).filter(PracticalTask.module_id == m.module_id).all()
                for t in tasks:
                    task_prog = TaskProgress(
                        task_progress_id=str(uuid.uuid4()),
                        assignment_id=learning_plan.assignment_id,
                        employee_id=plan.employee_id,
                        task_id=t.task_id,
                        status="pending"
                    )
                    db.add(task_prog)

        # Assign Checklists
        checklists = db.query(OnboardingChecklist).filter(OnboardingChecklist.plan_id == plan_id).all()
        for c in checklists:
            chk_prog = ChecklistProgress(
                checklist_progress_id=str(uuid.uuid4()),
                assignment_id=learning_plan.assignment_id,
                employee_id=plan.employee_id,
                checklist_id=c.checklist_id,
                is_completed=False
            )
            db.add(chk_prog)

        # Create Stage Milestones
        target_days_map = {
            "day_1": 1, "week_1": 7, "week_2": 14,
            "first_30_days": 30, "first_60_days": 60, "first_90_days": 90
        }
        for stg in stages:
            stg_str = stg.stage_name.value if hasattr(stg.stage_name, "value") else str(stg.stage_name)
            ms = Milestone(
                milestone_id=str(uuid.uuid4()),
                assignment_id=learning_plan.assignment_id,
                employee_id=plan.employee_id,
                stage_name=stg_str,
                title=f"{stg_str.replace('_', ' ').title()} Milestone",
                target_completion_days=target_days_map.get(stg_str, 7),
                is_reached=False
            )
            db.add(ms)

        db.commit()
        db.refresh(learning_plan)
        return learning_plan

assignment_engine = PlanAssignmentEngine()
