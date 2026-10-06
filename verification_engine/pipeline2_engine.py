"""
Pipeline 2 — Deterministic Python Verification & Audit Engine (Specification Steps 28-36, 46)
Performs strict 100% deterministic Python validation of Pipeline 1 GenAI Onboarding Plans
against Ground-Truth Role Requirement Matrix entries and Company Document chunks.
No GenAI or LLM calls are used.
"""

from sqlalchemy.orm import Session
from database.models import ValidationReport
from python_validation.validator import pipeline2_validator


class Pipeline2Engine:
    """Independent Deterministic Python Verification Engine (Pipeline 2)."""

    @staticmethod
    def verify_onboarding_plan(db: Session, plan_id: str) -> ValidationReport:
        """
        Main entry point for Pipeline 2 Verification.
        Delegates execution to Pipeline2Validator in python_validation service layer.
        """
        return pipeline2_validator.validate_plan(db, plan_id)


pipeline2_engine = Pipeline2Engine()
