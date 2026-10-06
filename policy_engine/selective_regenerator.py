import uuid
from datetime import datetime
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from database.models import (
    PolicyUpdateRecord, AffectedModuleImpact, OnboardingPlan, LearningModule,
    EmployeeProfile, JobRole, ValidationReport, ManualReviewQueue, VerificationStatusEnum
)
from genai_pipeline.pipeline1_engine import Pipeline1Engine
from python_validation.validator import pipeline2_validator
from policy_engine.audit_logger import audit_logger

class SelectiveRegenerator:
    """100% Selective Module Regeneration Pipeline."""

    @staticmethod
    def regenerate_affected_content(db: Session, update_id: str) -> Dict[str, Any]:
        """
        Regenerates ONLY affected modules using Pipeline 1, validates via Pipeline 2,
        routes to Human Review if needed, and preserves historical employee progress.
        """
        update_rec = db.query(PolicyUpdateRecord).filter(PolicyUpdateRecord.update_id == update_id).first()
        if not update_rec:
            raise ValueError(f"Policy update record '{update_id}' not found.")

        impacts = db.query(AffectedModuleImpact).filter(AffectedModuleImpact.update_id == update_id).all()
        if not impacts:
            return {"message": "No affected modules found for regeneration.", "regenerated_count": 0}

        audit_logger.log_event(
            db=db,
            event_type="REGENERATION_REQUESTED",
            entity_type="PolicyUpdateRecord",
            entity_id=update_id,
            reason=f"Selective regeneration started for {len(impacts)} affected module(s)."
        )

        regenerated_count = 0
        validated_count = 0
        review_required_count = 0

        for imp in impacts:
            plan = db.query(OnboardingPlan).filter(OnboardingPlan.plan_id == imp.plan_id).first()
            if not plan:
                continue

            emp = db.query(EmployeeProfile).filter(EmployeeProfile.employee_id == plan.employee_id).first()
            role = db.query(JobRole).filter(JobRole.role_id == plan.job_role_id).first() if plan else None

            # Regenerate plan/module via Pipeline 1
            new_plan, _ = Pipeline1Engine.generate_plan_for_employee(
                db=db,
                employee_id=emp.employee_id,
                role_identifier=role.role_code if role else None
            )
            regenerated_count += 1
            imp.status = "regenerated"

            audit_logger.log_event(
                db=db,
                event_type="MODULE_REGENERATED",
                entity_type="LearningModule",
                entity_id=imp.module_id,
                new_value={"old_version": imp.old_module_version, "new_version": imp.new_module_version},
                reason=f"Module '{imp.module_id}' selectively regenerated via Pipeline 1."
            )

            # Re-validate via Pipeline 2 Ground-Truth Engine
            report = pipeline2_validator.validate_plan(db, new_plan.plan_id)
            imp.validation_report_id = report.report_id
            status_str = report.verification_status.value if hasattr(report.verification_status, "value") else str(report.verification_status)

            audit_logger.log_event(
                db=db,
                event_type="REVALIDATION_COMPLETED",
                entity_type="ValidationReport",
                entity_id=report.report_id,
                new_value={"verification_status": status_str, "coverage_score": float(report.mandatory_coverage_score)},
                reason=f"Pipeline 2 revalidation completed with status '{status_str}'."
            )

            if status_str != "verified":
                review_required_count += 1
                imp.status = "review_required"

                rev_queue = db.query(ManualReviewQueue).filter(ManualReviewQueue.plan_id == new_plan.plan_id).first()
                if not rev_queue:
                    rev_queue = ManualReviewQueue(
                        report_id=report.report_id,
                        plan_id=new_plan.plan_id,
                        status="pending",
                        reason_for_review=f"Policy update v{update_rec.new_version} selective regeneration review required."
                    )
                    db.add(rev_queue)
                    db.flush()

                imp.review_queue_id = rev_queue.review_id

                audit_logger.log_event(
                    db=db,
                    event_type="REVIEW_REQUIRED",
                    entity_type="ManualReviewQueue",
                    entity_id=rev_queue.review_id,
                    reason=f"Module '{imp.module_id}' routed to Human Review due to status '{status_str}'."
                )
            else:
                validated_count += 1
                imp.status = "published"

                audit_logger.log_event(
                    db=db,
                    event_type="MODULE_PUBLISHED",
                    entity_type="LearningModule",
                    entity_id=imp.module_id,
                    reason=f"Selective regenerated module published after 100% Pipeline 2 verification."
                )

        update_rec.status = "completed" if review_required_count == 0 else "review_required"
        db.commit()

        return {
            "update_id": update_id,
            "status": update_rec.status,
            "total_affected_modules": len(impacts),
            "regenerated_count": regenerated_count,
            "validated_count": validated_count,
            "review_required_count": review_required_count
        }

selective_regenerator = SelectiveRegenerator()
