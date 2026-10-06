import uuid
from datetime import datetime
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from database.models import (
    CompanyDocument, RoleRequirementMatrix, JobRole, OnboardingPlan, OnboardingStage,
    LearningModule, PracticalTask, ModuleQuiz, OnboardingChecklist, EmployeeProfile,
    EmployeeLearningPlan, EmployeeModuleProgress, PolicyUpdateRecord,
    AffectedRequirementImpact, AffectedModuleImpact
)
from policy_engine.detector import policy_detector
from policy_engine.audit_logger import audit_logger

class ImpactAnalyzer:
    """Requirement, Plan, Module, and Employee Impact Analyzer."""

    @staticmethod
    def analyze_policy_impact(db: Session, document_id: str, target_version: int) -> PolicyUpdateRecord:
        """
        Executes requirement and plan impact analysis for a policy document update.
        Requirements 2, 3, 4, 5.
        """
        det_res = policy_detector.detect_version_changes(db, document_id, target_version)
        old_ver = det_res["old_version"]
        new_ver = det_res["new_version"]

        # Check if PolicyUpdateRecord already exists
        update_rec = db.query(PolicyUpdateRecord).filter(
            PolicyUpdateRecord.document_id == document_id,
            PolicyUpdateRecord.new_version == new_ver
        ).first()

        if not update_rec:
            update_rec = PolicyUpdateRecord(
                update_id=str(uuid.uuid4()),
                document_id=document_id,
                old_version=old_ver,
                new_version=new_ver,
                change_type=det_res["change_type"],
                status="impact_analyzed",
                detected_at=datetime.utcnow()
            )
            db.add(update_rec)
            db.flush()

        # 1. Affected RRM Requirements
        rrm_reqs = db.query(RoleRequirementMatrix).filter(
            RoleRequirementMatrix.source_document_id == document_id
        ).all()

        affected_req_ids = set()
        affected_roles = set()

        for req in rrm_reqs:
            affected_req_ids.add(req.requirement_id)
            role = db.query(JobRole).filter(JobRole.role_id == req.job_role_id).first()
            if role:
                affected_roles.add(role.role_code)

            # Update requirement source_document_version to new version
            req.source_document_version = new_ver

            # Save AffectedRequirementImpact
            req_imp = db.query(AffectedRequirementImpact).filter(
                AffectedRequirementImpact.update_id == update_rec.update_id,
                AffectedRequirementImpact.requirement_id == req.requirement_id
            ).first()

            if not req_imp:
                req_imp = AffectedRequirementImpact(
                    impact_item_id=str(uuid.uuid4()),
                    update_id=update_rec.update_id,
                    requirement_id=req.requirement_id,
                    old_source_version=old_ver,
                    new_source_version=new_ver,
                    change_type=det_res["change_type"],
                    affected_roles=[role.role_code] if role else []
                )
                db.add(req_imp)

        # 2. Affected Modules & Onboarding Plans
        affected_plans = set()
        affected_modules = []

        modules = db.query(LearningModule).filter(
            (LearningModule.source_document_id == document_id) | (LearningModule.requirement_id.in_(list(affected_req_ids)))
        ).all()

        for m in modules:
            stg = db.query(OnboardingStage).filter(OnboardingStage.stage_id == m.stage_id).first()
            if stg:
                affected_plans.add(stg.plan_id)

                mod_imp = db.query(AffectedModuleImpact).filter(
                    AffectedModuleImpact.update_id == update_rec.update_id,
                    AffectedModuleImpact.module_id == m.module_id
                ).first()

                if not mod_imp:
                    mod_imp = AffectedModuleImpact(
                        module_impact_id=str(uuid.uuid4()),
                        update_id=update_rec.update_id,
                        plan_id=stg.plan_id,
                        module_id=m.module_id,
                        requirement_id=m.requirement_id,
                        old_module_version=1,
                        new_module_version=2,
                        status="outdated"
                    )
                    db.add(mod_imp)
                    affected_modules.append(mod_imp)

        # 3. Affected Employees
        affected_employees = db.query(EmployeeLearningPlan).filter(
            EmployeeLearningPlan.plan_id.in_(list(affected_plans))
        ).all()

        # Update record summary counts
        update_rec.affected_roles_count = len(affected_roles)
        update_rec.affected_plans_count = len(affected_plans)
        update_rec.affected_modules_count = len(modules)
        update_rec.affected_employees_count = len(affected_employees)
        update_rec.status = "outdated_marked"

        audit_logger.log_event(
            db=db,
            event_type="IMPACT_ANALYSIS_COMPLETED",
            entity_type="PolicyUpdateRecord",
            entity_id=update_rec.update_id,
            new_value={
                "affected_roles": len(affected_roles),
                "affected_plans": len(affected_plans),
                "affected_modules": len(modules),
                "affected_employees": len(affected_employees)
            },
            reason=f"Impact analysis completed for '{document_id}' v{new_ver}."
        )

        db.commit()
        db.refresh(update_rec)
        return update_rec

impact_analyzer = ImpactAnalyzer()
