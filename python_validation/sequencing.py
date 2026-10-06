from typing import List, Dict, Any, Tuple
from database.models import RoleRequirementMatrix, LearningModule, OnboardingStage
from python_validation.schemas import ValidationIssueSchema

STAGE_ORDER_MAP = {
    "day_1": 1,
    "week_1": 2,
    "week_2": 3,
    "first_30_days": 4,
    "first_60_days": 5,
    "first_90_days": 6
}

class SequencingValidator:
    """Validates onboarding stage sequence and requirement prerequisite ordering deterministically."""

    @staticmethod
    def evaluate_stage_sequencing(
        ground_truth_map: Dict[str, RoleRequirementMatrix],
        stages: List[OnboardingStage],
        modules: List[LearningModule]
    ) -> Tuple[int, List[ValidationIssueSchema]]:
        """
        Validates stage order and prerequisite ordering.
        Returns (sequence_issue_count, list_of_issues).
        """
        sequence_issue_count = 0
        issues = []

        # Map requirement_id -> scheduled stage order
        req_stage_order_map = {}
        for stg in stages:
            stg_name = stg.stage_name.value if hasattr(stg.stage_name, "value") else str(stg.stage_name)
            stg_order = STAGE_ORDER_MAP.get(stg_name.lower(), stg.stage_order)

            for m in stg.modules:
                if m.requirement_id:
                    req_stage_order_map[m.requirement_id] = stg_order

        # Check prerequisite violations
        for req_id, rrm_item in ground_truth_map.items():
            prereqs = rrm_item.prerequisite_requirement_ids or []
            if isinstance(prereqs, str):
                import json
                try:
                    prereqs = json.loads(prereqs)
                except Exception:
                    prereqs = []

            req_order = req_stage_order_map.get(req_id)
            if req_order is None:
                continue

            for prereq_id in prereqs:
                prereq_order = req_stage_order_map.get(prereq_id)
                if prereq_order is None:
                    sequence_issue_count += 1
                    issues.append(ValidationIssueSchema(
                        requirement_id=req_id,
                        issue_type="prerequisite_violation",
                        severity="high",
                        explanation=f"Requirement '{req_id}' depends on prerequisite '{prereq_id}', but prerequisite '{prereq_id}' is not included in generated plan.",
                        expected_value=f"Prerequisite '{prereq_id}' included prior to '{req_id}'",
                        generated_value=f"Prerequisite '{prereq_id}' missing"
                    ))
                elif prereq_order > req_order:
                    sequence_issue_count += 1
                    issues.append(ValidationIssueSchema(
                        requirement_id=req_id,
                        issue_type="sequence_error",
                        severity="high",
                        explanation=f"Requirement '{req_id}' is scheduled at stage order {req_order}, which is BEFORE its prerequisite '{prereq_id}' (scheduled at stage order {prereq_order}).",
                        expected_value=f"Prerequisite '{prereq_id}' scheduled before stage order {req_order}",
                        generated_value=f"Prerequisite scheduled after (order {prereq_order})"
                    ))

        return sequence_issue_count, issues

sequencing_validator = SequencingValidator()
