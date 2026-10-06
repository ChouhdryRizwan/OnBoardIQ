from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from database.models import RoleRequirementMatrix, LearningModule, PracticalTask, ModuleQuiz, OnboardingChecklist
from python_validation.schemas import ValidationIssueSchema

class AssessmentValidator:
    """Validates practical tasks, checklists, quizzes, and assessment mapping deterministically."""

    @staticmethod
    def evaluate_assessments_and_activities(
        mandatory_matrix_items: List[RoleRequirementMatrix],
        modules: List[LearningModule],
        tasks: List[PracticalTask],
        quizzes: List[ModuleQuiz],
        checklists: List[OnboardingChecklist]
    ) -> Tuple[int, List[ValidationIssueSchema]]:
        """
        Validates presence of tasks and quizzes for mandatory requirements.
        Returns (missing_assessment_count, list_of_issues).
        """
        missing_assessment_count = 0
        issues = []

        # Map requirement_id -> module
        req_module_map = {m.requirement_id: m for m in modules if m.requirement_id}
        mod_task_count = {}
        for t in tasks:
            mod_task_count[t.module_id] = mod_task_count.get(t.module_id, 0) + 1

        mod_quiz_count = {}
        for q in quizzes:
            mod_quiz_count[q.module_id] = mod_quiz_count.get(q.module_id, 0) + 1

        for req in mandatory_matrix_items:
            req_id = req.requirement_id
            mod = req_module_map.get(req_id)
            if not mod:
                continue

            # Check 1: Mandatory task requirement missing practical task
            if req.required_task_description:
                task_cnt = mod_task_count.get(mod.module_id, 0)
                if task_cnt == 0:
                    missing_assessment_count += 1
                    issues.append(ValidationIssueSchema(
                        requirement_id=req_id,
                        issue_type="missing_task",
                        severity="medium",
                        explanation=f"Mandatory requirement '{req_id}' requires practical task ('{req.required_task_description}'), but module '{mod.title}' contains no practical tasks.",
                        expected_value=f"Practical task for '{req.required_task_description}'",
                        generated_value="0 practical tasks in module"
                    ))

            # Check 2: Mandatory assessment topic missing quiz
            if req.required_assessment_topic:
                quiz_cnt = mod_quiz_count.get(mod.module_id, 0)
                if quiz_cnt == 0:
                    missing_assessment_count += 1
                    issues.append(ValidationIssueSchema(
                        requirement_id=req_id,
                        issue_type="missing_quiz",
                        severity="medium",
                        explanation=f"Mandatory requirement '{req_id}' specifies assessment topic '{req.required_assessment_topic}', but module '{mod.title}' has no quiz questions.",
                        expected_value=f"Quiz for assessment topic '{req.required_assessment_topic}'",
                        generated_value="0 quiz questions in module"
                    ))

        return missing_assessment_count, issues

assessment_validator = AssessmentValidator()
