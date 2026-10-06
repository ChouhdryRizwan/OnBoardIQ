from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from database.models import LearningModule, PracticalTask, ModuleQuiz, OnboardingChecklist
from python_validation.schemas import ValidationIssueSchema

class DuplicateValidator:
    """Detects duplicate requirement IDs, modules, tasks, quizzes, and checklists deterministically."""

    @staticmethod
    def evaluate_duplicates(
        modules: List[LearningModule],
        tasks: List[PracticalTask],
        quizzes: List[ModuleQuiz],
        checklists: List[OnboardingChecklist]
    ) -> Tuple[int, List[ValidationIssueSchema]]:
        """
        Detects structural and ID duplicates.
        Returns (duplicate_count, list_of_issues).
        """
        duplicate_count = 0
        issues = []

        # 1. Duplicate Requirement IDs across modules
        seen_req_ids = set()
        for m in modules:
            if m.requirement_id:
                if m.requirement_id in seen_req_ids:
                    duplicate_count += 1
                    issues.append(ValidationIssueSchema(
                        requirement_id=m.requirement_id,
                        issue_type="duplicate_requirement_id",
                        severity="medium",
                        explanation=f"Duplicate coverage detected for requirement ID '{m.requirement_id}' across multiple modules.",
                        expected_value="Single unique module coverage per requirement ID",
                        generated_value=f"Repeated in module '{m.module_code}'"
                    ))
                seen_req_ids.add(m.requirement_id)

        # 2. Duplicate Module Codes
        seen_module_codes = set()
        for m in modules:
            if m.module_code in seen_module_codes:
                duplicate_count += 1
                issues.append(ValidationIssueSchema(
                    requirement_id=m.requirement_id,
                    issue_type="duplicate_module",
                    severity="high",
                    explanation=f"Duplicate module code '{m.module_code}' detected in generated plan.",
                    expected_value="Unique module code per module",
                    generated_value=f"Duplicate code '{m.module_code}'"
                ))
            seen_module_codes.add(m.module_code)

        # 3. Duplicate Task Codes
        seen_task_codes = set()
        for t in tasks:
            if t.task_code in seen_task_codes:
                duplicate_count += 1
                issues.append(ValidationIssueSchema(
                    issue_type="duplicate_task",
                    severity="medium",
                    explanation=f"Duplicate task code '{t.task_code}' detected.",
                    expected_value="Unique task code",
                    generated_value=f"Duplicate task code '{t.task_code}'"
                ))
            seen_task_codes.add(t.task_code)

        # 4. Duplicate Checklist Activities
        seen_activities = set()
        for c in checklists:
            act_key = c.activity_name.lower().strip()
            if act_key in seen_activities:
                duplicate_count += 1
                issues.append(ValidationIssueSchema(
                    issue_type="duplicate_checklist",
                    severity="low",
                    explanation=f"Duplicate checklist activity '{c.activity_name}' detected.",
                    expected_value="Unique checklist activity",
                    generated_value=f"Duplicate activity '{c.activity_name}'"
                ))
            seen_activities.add(act_key)

        return duplicate_count, issues

duplicate_validator = DuplicateValidator()
