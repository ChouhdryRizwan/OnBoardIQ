import os
import json
from typing import Dict, Any, List
from python_validation.schemas import ValidationIssueSchema

DEFAULT_BUSINESS_RULES = {
    "min_mandatory_coverage_percent": 100.0,
    "min_traceability_score_percent": 100.0,
    "allow_obsolete_document_sources": False,
    "strict_role_relevance": True,
    "max_allowed_duplicates": 0,
    "require_quiz_for_assessment_topics": True,
    "require_task_for_practical_requirements": True
}

class BusinessRulesEngine:
    """Configurable deterministic business rule engine (Requirement 17)."""

    def __init__(self, config_file: str = "config/business_rules.json"):
        self.config_file = os.path.abspath(config_file)
        self.rules = self.load_rules()

    def load_rules(self) -> Dict[str, Any]:
        """Loads configurable business rules from JSON file if present."""
        if os.path.exists(self.config_file):
            try:
                with open(self.config_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    merged = DEFAULT_BUSINESS_RULES.copy()
                    merged.update(data)
                    return merged
            except Exception:
                pass
        return DEFAULT_BUSINESS_RULES.copy()

    def evaluate_business_rules(
        self,
        coverage_score: float,
        traceability_score: float,
        duplicate_count: int,
        outdated_count: int
    ) -> List[ValidationIssueSchema]:
        """Evaluates configurable threshold business rules."""
        issues = []

        if coverage_score < self.rules.get("min_mandatory_coverage_percent", 100.0):
            issues.append(ValidationIssueSchema(
                issue_type="business_rule_coverage_violation",
                severity="critical",
                explanation=f"Business Rule Violation: Mandatory coverage score ({coverage_score}%) is below configured threshold ({self.rules['min_mandatory_coverage_percent']}%).",
                expected_value=f"{self.rules['min_mandatory_coverage_percent']}% coverage",
                generated_value=f"{coverage_score}%"
            ))

        if traceability_score < self.rules.get("min_traceability_score_percent", 100.0):
            issues.append(ValidationIssueSchema(
                issue_type="business_rule_traceability_violation",
                severity="high",
                explanation=f"Business Rule Violation: Source traceability score ({traceability_score}%) is below configured threshold ({self.rules['min_traceability_score_percent']}%).",
                expected_value=f"{self.rules['min_traceability_score_percent']}% traceability",
                generated_value=f"{traceability_score}%"
            ))

        if not self.rules.get("allow_obsolete_document_sources", False) and outdated_count > 0:
            issues.append(ValidationIssueSchema(
                issue_type="business_rule_obsolete_source_prohibited",
                severity="high",
                explanation=f"Business Rule Violation: Plan contains {outdated_count} obsolete document citations, which are strictly prohibited by active organization policy.",
                expected_value="0 obsolete document citations",
                generated_value=f"{outdated_count} obsolete citations"
            ))

        max_dups = self.rules.get("max_allowed_duplicates", 0)
        if duplicate_count > max_dups:
            issues.append(ValidationIssueSchema(
                issue_type="business_rule_duplicate_violation",
                severity="medium",
                explanation=f"Business Rule Violation: Plan contains {duplicate_count} duplicate items, exceeding allowed maximum of {max_dups}.",
                expected_value=f"<= {max_dups} duplicates",
                generated_value=f"{duplicate_count} duplicates"
            ))

        return issues

business_rules_engine = BusinessRulesEngine()
