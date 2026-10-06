import json
import os
from typing import Dict, Any, Tuple
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from database.models import (
    EmployeeLearningPlan, EmployeeModuleProgress, ChecklistProgress, TaskProgress,
    QuizAttempt, AssessmentResult, Milestone
)

class ProgressCalculator:
    """100% Deterministic Python Progress & Status Rules Engine."""

    def __init__(self):
        config_path = os.path.join(os.path.dirname(__file__), "..", "config", "progress_rules.json")
        if os.path.exists(config_path):
            with open(config_path, "r", encoding="utf-8") as f:
                self.config = json.load(f)
        else:
            self.config = {
                "weights": {
                    "module_completion": 0.40,
                    "task_completion": 0.30,
                    "checklist_completion": 0.15,
                    "quiz_assessment_performance": 0.15
                },
                "thresholds": {
                    "quiz_pass_percentage": 80.0,
                    "requires_attention_quiz_threshold": 70.0,
                    "requires_attention_progress_threshold": 50.0,
                    "behind_schedule_days_grace": 7
                }
            }

    def calculate_employee_progress(self, db: Session, employee_id: str) -> Dict[str, Any]:
        """Calculates deterministic progress scores and status for an employee."""
        learning_plan = db.query(EmployeeLearningPlan).filter(
            EmployeeLearningPlan.employee_id == employee_id,
            EmployeeLearningPlan.status.in_(["assigned", "in_progress", "completed"])
        ).order_by(EmployeeLearningPlan.assigned_at.desc()).first()

        if not learning_plan:
            return {
                "has_plan": False,
                "overall_progress_percentage": 0.0,
                "overall_status": "on_track",
                "module_progress_percentage": 0.0,
                "task_progress_percentage": 0.0,
                "checklist_progress_percentage": 0.0,
                "quiz_assessment_score": 0.0,
                "completed_modules": 0, "total_modules": 0,
                "completed_tasks": 0, "total_tasks": 0,
                "completed_checklists": 0, "total_checklists": 0
            }

        assignment_id = learning_plan.assignment_id

        # 1. Module Progress
        mod_progs = db.query(EmployeeModuleProgress).filter(EmployeeModuleProgress.assignment_id == assignment_id).all()
        total_mods = len(mod_progs)
        completed_mods = sum(1 for m in mod_progs if m.completion_status == "completed")
        mod_pct = (completed_mods / total_mods * 100.0) if total_mods > 0 else 100.0

        # 2. Checklist Progress
        chk_progs = db.query(ChecklistProgress).filter(ChecklistProgress.assignment_id == assignment_id).all()
        total_chks = len(chk_progs)
        completed_chks = sum(1 for c in chk_progs if c.is_completed)
        chk_pct = (completed_chks / total_chks * 100.0) if total_chks > 0 else 100.0

        # 3. Task Progress
        task_progs = db.query(TaskProgress).filter(TaskProgress.assignment_id == assignment_id).all()
        total_tasks = len(task_progs)
        completed_tasks = sum(1 for t in task_progs if t.status == "completed")
        task_pct = (completed_tasks / total_tasks * 100.0) if total_tasks > 0 else 100.0

        # 4. Quiz & Assessment Performance
        quizzes = db.query(QuizAttempt).filter(QuizAttempt.employee_id == employee_id).all()
        assessments = db.query(AssessmentResult).filter(AssessmentResult.employee_id == employee_id).all()

        scores = [float(q.score) for q in quizzes] + [float(a.score) for a in assessments if a.score is not None]
        avg_score = (sum(scores) / len(scores)) if len(scores) > 0 else 0.0

        # 5. Overall Weighted Progress Calculation
        weights = self.config["weights"]
        overall_progress = round(
            (mod_pct * weights["module_completion"]) +
            (task_pct * weights["task_completion"]) +
            (chk_pct * weights["checklist_completion"]) +
            (avg_score * weights["quiz_assessment_performance"]),
            2
        )

        # 6. Status Determination
        status = self._determine_status(
            overall_progress=overall_progress,
            mod_pct=mod_pct,
            task_pct=task_pct,
            completed_mods=completed_mods,
            total_mods=total_mods,
            completed_tasks=completed_tasks,
            total_tasks=total_tasks,
            avg_score=avg_score,
            assessments=assessments,
            learning_plan=learning_plan,
            has_scores=len(scores) > 0
        )

        # Update DB learning plan record
        learning_plan.overall_progress_percentage = overall_progress
        learning_plan.overall_status = status
        if overall_progress >= 100.0 and status == "completed":
            learning_plan.status = "completed"
            learning_plan.completed_at = datetime.utcnow()
        elif learning_plan.status == "assigned":
            learning_plan.status = "in_progress"

        db.commit()

        return {
            "has_plan": True,
            "assignment_id": assignment_id,
            "plan_id": learning_plan.plan_id,
            "overall_progress_percentage": float(overall_progress),
            "overall_status": status,
            "module_progress_percentage": round(mod_pct, 2),
            "task_progress_percentage": round(task_pct, 2),
            "checklist_progress_percentage": round(chk_pct, 2),
            "quiz_assessment_score": round(avg_score, 2),
            "completed_modules": completed_mods,
            "total_modules": total_mods,
            "completed_tasks": completed_tasks,
            "total_tasks": total_tasks,
            "completed_checklists": completed_chks,
            "total_checklists": total_chks
        }

    def _determine_status(
        self,
        overall_progress: float,
        mod_pct: float,
        task_pct: float,
        completed_mods: int,
        total_mods: int,
        completed_tasks: int,
        total_tasks: int,
        avg_score: float,
        assessments: list,
        learning_plan: EmployeeLearningPlan,
        has_scores: bool = False
    ) -> str:
        """Determines progress status (completed, assessment_required, behind_schedule, requires_attention, on_track)."""
        # Rule 1: Completed
        if (completed_mods == total_mods) and (completed_tasks == total_tasks) and overall_progress >= 99.0:
            return "completed"

        # Rule 2: Assessment Required
        pending_eval = any(a.result == "requires_review" for a in assessments)
        if pending_eval:
            return "assessment_required"

        # Rule 3: Requires Attention (Low score on taken quizzes)
        thresh = self.config["thresholds"]
        if has_scores and avg_score < thresh["requires_attention_quiz_threshold"]:
            return "requires_attention"

        # Rule 4: Behind Schedule (Overdue by grace period)
        if learning_plan.assigned_at:
            days_since_assignment = (datetime.utcnow() - learning_plan.assigned_at.replace(tzinfo=None)).days
            if days_since_assignment > thresh["behind_schedule_days_grace"] and mod_pct < 30.0:
                return "behind_schedule"

        # Rule 5: Default On Track
        return "on_track"

progress_calculator = ProgressCalculator()
