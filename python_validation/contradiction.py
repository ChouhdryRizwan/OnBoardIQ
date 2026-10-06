from typing import List, Dict, Any, Tuple
from database.models import RoleRequirementMatrix, LearningModule
from python_validation.schemas import ValidationIssueSchema

class ContradictionValidator:
    """Detects contradictions, status mismatches, classification, and priority errors deterministically."""

    @staticmethod
    def evaluate_contradictions_and_mismatches(
        ground_truth_map: Dict[str, RoleRequirementMatrix],
        generated_modules: List[LearningModule]
    ) -> Tuple[int, List[ValidationIssueSchema]]:
        """
        Compares generated mandatory status, classification, and priority against ground truth RRM.
        Returns (contradiction_count, list_of_issues).
        """
        contradiction_count = 0
        issues = []

        for mod in generated_modules:
            req_id = getattr(mod, "requirement_id", None)
            if not req_id or req_id not in ground_truth_map:
                continue

            rrm_item = ground_truth_map[req_id]
            mod_title = getattr(mod, "title", "Module")

            # Check 1: Mandatory Status Mismatch (Requirement 7)
            gen_mandatory = getattr(mod, "is_mandatory", True)
            if rrm_item.is_mandatory != gen_mandatory:
                contradiction_count += 1
                issues.append(ValidationIssueSchema(
                    requirement_id=req_id,
                    issue_type="mandatory_status_mismatch",
                    severity="high",
                    explanation=f"Mandatory status mismatch for requirement '{req_id}' in module '{mod_title}'. RRM Ground Truth specifies mandatory={rrm_item.is_mandatory}, but GenAI generated mandatory={gen_mandatory}.",
                    expected_value=f"is_mandatory={rrm_item.is_mandatory}",
                    generated_value=f"is_mandatory={gen_mandatory}"
                ))

            # Check 2: Classification Mismatch (Requirement 8)
            rrm_type_str = rrm_item.requirement_type.value if hasattr(rrm_item.requirement_type, "value") else str(rrm_item.requirement_type)
            gen_type_str = getattr(mod, "requirement_type", rrm_type_str)
            if hasattr(gen_type_str, "value"):
                gen_type_str = gen_type_str.value
            if gen_type_str and rrm_type_str.lower() != str(gen_type_str).lower():
                issues.append(ValidationIssueSchema(
                    requirement_id=req_id,
                    issue_type="classification_mismatch",
                    severity="medium",
                    explanation=f"Classification mismatch for requirement '{req_id}'. RRM specifies '{rrm_type_str}', but generated content specified '{gen_type_str}'.",
                    expected_value=rrm_type_str,
                    generated_value=str(gen_type_str)
                ))

            # Check 3: Priority / Due Stage Mismatch (Requirement 9)
            rrm_priority_str = rrm_item.priority.value if hasattr(rrm_item.priority, "value") else str(rrm_item.priority)
            rrm_stage_str = rrm_item.due_stage.value if hasattr(rrm_item.due_stage, "value") else str(rrm_item.due_stage)

            gen_priority = getattr(mod, "priority", rrm_priority_str)
            if hasattr(gen_priority, "value"):
                gen_priority = gen_priority.value
            if gen_priority and rrm_priority_str.lower() != str(gen_priority).lower():
                issues.append(ValidationIssueSchema(
                    requirement_id=req_id,
                    issue_type="priority_mismatch",
                    severity="low",
                    explanation=f"Priority mismatch for requirement '{req_id}'. RRM specifies '{rrm_priority_str}', generated specifies '{gen_priority}'.",
                    expected_value=rrm_priority_str,
                    generated_value=str(gen_priority)
                ))

        return contradiction_count, issues

contradiction_validator = ContradictionValidator()
