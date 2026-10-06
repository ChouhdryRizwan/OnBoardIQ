from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from database.models import RoleRequirementMatrix, LearningModule
from python_validation.schemas import ValidationIssueSchema

class CoverageValidator:
    """Calculates mandatory requirement coverage deterministically (Specification Step 28-30)."""

    @staticmethod
    def evaluate_mandatory_coverage(
        mandatory_matrix_items: List[RoleRequirementMatrix],
        generated_modules: List[LearningModule]
    ) -> Tuple[float, int, int, List[RoleRequirementMatrix], List[ValidationIssueSchema]]:
        """
        Computes coverage score and missing mandatory requirement issues.
        Returns (coverage_score, total_mandatory, covered_mandatory, missing_list, issues_list).
        """
        total_mandatory = len(mandatory_matrix_items)
        generated_req_ids = {m.requirement_id for m in generated_modules if m.requirement_id}

        covered_mandatory = 0
        missing_list = []
        issues = []

        for req in mandatory_matrix_items:
            if req.requirement_id in generated_req_ids:
                covered_mandatory += 1
            else:
                missing_list.append(req)
                issues.append(ValidationIssueSchema(
                    requirement_id=req.requirement_id,
                    issue_type="missing_mandatory",
                    severity="critical",
                    explanation=f"Mandatory requirement '{req.requirement_id}' ('{req.policy_requirement}') is missing from generated plan.",
                    expected_value=f"Included in onboarding plan as mandatory requirement.",
                    generated_value="Not present in generated modules."
                ))

        coverage_score = (
            round((covered_mandatory / total_mandatory * 100.0), 2)
            if total_mandatory > 0 else 100.0
        )

        return coverage_score, total_mandatory, covered_mandatory, missing_list, issues

coverage_validator = CoverageValidator()
