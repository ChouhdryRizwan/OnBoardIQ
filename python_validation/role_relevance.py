from typing import List, Dict, Any, Tuple
from database.models import JobRole, RoleRequirementMatrix
from python_validation.schemas import ValidationIssueSchema

class RoleRelevanceValidator:
    """Validates role relevance, requirement ownership, and department consistency deterministically."""

    @staticmethod
    def evaluate_role_relevance(
        role: JobRole,
        ground_truth_map: Dict[str, RoleRequirementMatrix],
        generated_modules: List[Any]
    ) -> Tuple[float, List[ValidationIssueSchema]]:
        """
        Validates whether generated requirements belong to the target role and department.
        Returns (relevance_score, list_of_issues).
        """
        valid_role_items = 0
        total_items = len(generated_modules)
        issues = []

        for mod in generated_modules:
            req_id = getattr(mod, "requirement_id", None)
            mod_title = getattr(mod, "title", "Module")

            # Check 1: Requirement ID exists in RRM ground truth
            if req_id and req_id not in ground_truth_map:
                issues.append(ValidationIssueSchema(
                    requirement_id=req_id,
                    issue_type="unsupported_requirement",
                    severity="high",
                    explanation=f"Generated requirement ID '{req_id}' in module '{mod_title}' does not exist in the Ground-Truth Role Requirement Matrix for role '{role.role_code}'.",
                    expected_value=f"Valid RRM requirement for role '{role.role_code}'",
                    generated_value=f"Requirement ID '{req_id}'"
                ))
                continue

            rrm_item = ground_truth_map.get(req_id) if req_id else None
            if rrm_item:
                # Check 2: Department Mismatch
                if rrm_item.department and role.department and rrm_item.department.lower() != role.department.lower():
                    issues.append(ValidationIssueSchema(
                        requirement_id=req_id,
                        issue_type="role_mismatch",
                        severity="medium",
                        explanation=f"Requirement '{req_id}' belongs to department '{rrm_item.department}', which differs from target employee role department '{role.department}'.",
                        expected_value=role.department,
                        generated_value=rrm_item.department
                    ))
                else:
                    valid_role_items += 1
            else:
                valid_role_items += 1

        relevance_score = (
            round((valid_role_items / total_items * 100.0), 2)
            if total_items > 0 else 100.0
        )

        return relevance_score, issues

role_relevance_validator = RoleRelevanceValidator()
