"""
Role Requirement Matrix Manager
Handles Job Roles and Ground-Truth Requirement Matrix Management (Specification Steps 2 & 10 & Phase 2 RRM)
"""

from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from database.models import (
    JobRole, RoleRequirementMatrix, CompanyDocument, DocumentChunk,
    RequirementTypeEnum, PriorityLevelEnum, OnboardingStageEnum, DifficultyLevelEnum, DocumentStatusEnum
)
from role_matrix.matrix_validator import matrix_validator

# Seed data for default job roles
DEFAULT_JOB_ROLES = [
    {"role_code": "R001", "title": "Customer Support Executive", "department": "Customer Service", "description": "Handles customer complaints, inquiries, and escalation procedures."},
    {"role_code": "R002", "title": "Sales Executive", "department": "Sales", "description": "Manages client acquisition, product demonstrations, and sales compliance."},
    {"role_code": "R003", "title": "HR Executive", "department": "Human Resources", "description": "Oversees employee onboarding, leave policies, and conduct guidelines."},
    {"role_code": "R004", "title": "Finance Associate", "department": "Finance", "description": "Processes expense approvals, financial reporting, and compliance audits."},
    {"role_code": "R005", "title": "Operations Coordinator", "department": "Operations", "description": "Coordinates logistics, vendor workflows, and standard operating procedures."},
    {"role_code": "R006", "title": "Marketing Executive", "department": "Marketing", "description": "Executes campaign strategies, social media policies, and brand guidelines."},
    {"role_code": "R007", "title": "Software Support Engineer", "department": "IT & Engineering", "description": "Provides technical support, bug troubleshooting, and data security compliance."},
    {"role_code": "R008", "title": "Branch Manager", "department": "Management", "description": "Manages branch operations, escalation rules, and employee oversight."},
    {"role_code": "R009", "title": "Data Analyst", "department": "Analytics", "description": "Performs data analysis, data privacy compliance, and reporting."},
    {"role_code": "R010", "title": "Team Leader", "department": "Operations", "description": "Leads daily operational performance, team escalation, and performance review."}
]


class RoleMatrixManager:
    """Manager for Job Roles and the Ground-Truth Role Requirement Matrix."""

    @staticmethod
    def seed_default_roles(db: Session) -> List[JobRole]:
        """Seeds default job roles if they do not exist."""
        created_roles = []
        for role_data in DEFAULT_JOB_ROLES:
            existing = db.query(JobRole).filter(JobRole.role_code == role_data["role_code"]).first()
            if not existing:
                role = JobRole(
                    role_code=role_data["role_code"],
                    title=role_data["title"],
                    department=role_data["department"],
                    description=role_data["description"]
                )
                db.add(role)
                created_roles.append(role)
        if created_roles:
            db.commit()
        return db.query(JobRole).filter(JobRole.is_active == True).all()

    @staticmethod
    def get_role_by_id_or_code(db: Session, role_identifier: str) -> Optional[JobRole]:
        """Finds a job role by UUID role_id or role_code."""
        return db.query(JobRole).filter(
            (JobRole.role_id == role_identifier) | (JobRole.role_code == role_identifier)
        ).first()

    @staticmethod
    def create_role(db: Session, role_code: str, title: str, department: str, description: str, experience_level: str = "beginner") -> JobRole:
        """Creates a new job role."""
        existing = db.query(JobRole).filter(JobRole.role_code == role_code).first()
        if existing:
            raise ValueError(f"Job role code '{role_code}' already exists.")

        try:
            exp_enum = DifficultyLevelEnum(experience_level.lower())
        except ValueError:
            exp_enum = DifficultyLevelEnum.BEGINNER

        role = JobRole(
            role_code=role_code,
            title=title,
            department=department,
            description=description,
            required_experience_level=exp_enum,
            is_active=True
        )
        db.add(role)
        db.commit()
        db.refresh(role)
        return role

    @staticmethod
    def update_role(db: Session, role_identifier: str, update_data: Dict[str, Any]) -> JobRole:
        """Updates an existing job role."""
        role = RoleMatrixManager.get_role_by_id_or_code(db, role_identifier)
        if not role:
            raise ValueError(f"Job role '{role_identifier}' not found.")

        for key, val in update_data.items():
            if val is not None and hasattr(role, key):
                if key == "required_experience_level" and isinstance(val, str):
                    try:
                        setattr(role, key, DifficultyLevelEnum(val.lower()))
                    except ValueError:
                        pass
                else:
                    setattr(role, key, val)

        db.commit()
        db.refresh(role)
        return role

    @staticmethod
    def delete_role(db: Session, role_identifier: str) -> bool:
        """Deactivates a job role."""
        role = RoleMatrixManager.get_role_by_id_or_code(db, role_identifier)
        if not role:
            raise ValueError(f"Job role '{role_identifier}' not found.")

        role.is_active = False
        db.commit()
        return True

    @staticmethod
    def add_matrix_requirement(db: Session, payload: Dict[str, Any]) -> RoleRequirementMatrix:
        """Adds a ground-truth requirement to the Role Requirement Matrix with full validation."""
        # 1. Deterministic Validation Check
        issues = matrix_validator.validate_requirement_payload(db, payload, is_update=False)
        if issues:
            err_msgs = [i["description"] for i in issues]
            raise ValueError(f"Requirement Validation Failed: {'; '.join(err_msgs)}")

        role_identifier = payload.get("role_identifier") or payload.get("job_role_id")
        role = RoleMatrixManager.get_role_by_id_or_code(db, role_identifier)

        req_type = payload.get("requirement_type", "must_know")
        priority = payload.get("priority", "high")
        due_stage = payload.get("due_stage", "week_1")

        try:
            req_enum = RequirementTypeEnum(req_type.lower())
        except ValueError:
            req_enum = RequirementTypeEnum.MUST_KNOW

        try:
            prio_enum = PriorityLevelEnum(priority.lower())
        except ValueError:
            prio_enum = PriorityLevelEnum.HIGH

        try:
            stage_enum = OnboardingStageEnum(due_stage.lower())
        except ValueError:
            stage_enum = OnboardingStageEnum.WEEK_1

        matrix_item = RoleRequirementMatrix(
            requirement_id=payload["requirement_id"],
            job_role_id=role.role_id,
            title=payload.get("title") or payload.get("policy_requirement")[:50],
            description=payload.get("description"),
            department=payload.get("department") or role.department,
            policy_requirement=payload["policy_requirement"],
            process_requirement=payload.get("process_requirement"),
            required_competency=payload["required_competency"],
            is_mandatory=payload.get("is_mandatory", True),
            requirement_type=req_enum,
            priority=prio_enum,
            due_stage=stage_enum,
            source_document_id=payload["source_document_id"],
            source_document_version=payload.get("source_document_version", 1),
            source_section_id=payload["source_section_id"],
            source_location=payload.get("source_location"),
            prerequisite_requirement_ids=payload.get("prerequisite_requirement_ids", []),
            required_task_description=payload.get("required_task_description"),
            required_assessment_topic=payload.get("required_assessment_topic"),
            is_active=True
        )
        db.add(matrix_item)
        db.commit()
        db.refresh(matrix_item)
        return matrix_item

    @staticmethod
    def update_matrix_requirement(db: Session, requirement_id: str, payload: Dict[str, Any]) -> RoleRequirementMatrix:
        """Updates an existing matrix requirement with full validation."""
        req = db.query(RoleRequirementMatrix).filter(RoleRequirementMatrix.requirement_id == requirement_id).first()
        if not req:
            raise ValueError(f"Requirement '{requirement_id}' not found.")

        # Validate update payload
        merged_payload = {
            "requirement_id": req.requirement_id,
            "role_identifier": req.job_role_id,
            "policy_requirement": payload.get("policy_requirement", req.policy_requirement),
            "required_competency": payload.get("required_competency", req.required_competency),
            "source_document_id": payload.get("source_document_id", req.source_document_id),
            "source_document_version": payload.get("source_document_version", req.source_document_version),
            "source_section_id": payload.get("source_section_id", req.source_section_id),
            "prerequisite_requirement_ids": payload.get("prerequisite_requirement_ids", req.prerequisite_requirement_ids)
        }

        issues = matrix_validator.validate_requirement_payload(db, merged_payload, is_update=True, existing_req_id=requirement_id)
        if issues:
            err_msgs = [i["description"] for i in issues]
            raise ValueError(f"Requirement Update Validation Failed: {'; '.join(err_msgs)}")

        for k, v in payload.items():
            if v is not None and hasattr(req, k):
                if k == "requirement_type" and isinstance(v, str):
                    try:
                        setattr(req, k, RequirementTypeEnum(v.lower()))
                    except ValueError:
                        pass
                elif k == "priority" and isinstance(v, str):
                    try:
                        setattr(req, k, PriorityLevelEnum(v.lower()))
                    except ValueError:
                        pass
                elif k == "due_stage" and isinstance(v, str):
                    try:
                        setattr(req, k, OnboardingStageEnum(v.lower()))
                    except ValueError:
                        pass
                else:
                    setattr(req, k, v)

        db.commit()
        db.refresh(req)
        return req

    @staticmethod
    def delete_matrix_requirement(db: Session, requirement_id: str) -> bool:
        """Deactivates a matrix requirement."""
        req = db.query(RoleRequirementMatrix).filter(RoleRequirementMatrix.requirement_id == requirement_id).first()
        if not req:
            raise ValueError(f"Requirement '{requirement_id}' not found.")

        req.is_active = False
        db.commit()
        return True

    @staticmethod
    def get_ground_truth_matrix_for_role(db: Session, role_identifier: str) -> List[RoleRequirementMatrix]:
        """
        Retrieves the complete active Ground-Truth Role Requirement Matrix for a given role.
        Serves as the authoritative baseline for Pipeline 2 Python Ground-Truth Validation Engine.
        """
        role = RoleMatrixManager.get_role_by_id_or_code(db, role_identifier)
        if not role:
            return []
        
        return db.query(RoleRequirementMatrix).filter(
            RoleRequirementMatrix.job_role_id == role.role_id,
            RoleRequirementMatrix.is_active == True
        ).all()

    @staticmethod
    def get_rrm_summary_statistics(db: Session) -> Dict[str, Any]:
        """Computes summary statistics for RRM Dashboard."""
        total_roles = db.query(JobRole).filter(JobRole.is_active == True).count()
        total_reqs = db.query(RoleRequirementMatrix).filter(RoleRequirementMatrix.is_active == True).count()
        mandatory_reqs = db.query(RoleRequirementMatrix).filter(
            RoleRequirementMatrix.is_active == True,
            RoleRequirementMatrix.is_mandatory == True
        ).count()
        optional_reqs = total_reqs - mandatory_reqs

        # Priority breakdown
        by_priority = {}
        for prio in PriorityLevelEnum:
            cnt = db.query(RoleRequirementMatrix).filter(
                RoleRequirementMatrix.is_active == True,
                RoleRequirementMatrix.priority == prio
            ).count()
            by_priority[prio.value] = cnt

        # Classification breakdown
        by_class = {}
        for req_t in RequirementTypeEnum:
            cnt = db.query(RoleRequirementMatrix).filter(
                RoleRequirementMatrix.is_active == True,
                RoleRequirementMatrix.requirement_type == req_t
            ).count()
            by_class[req_t.value] = cnt

        # Department breakdown
        by_dept = {}
        roles = db.query(JobRole).filter(JobRole.is_active == True).all()
        for r in roles:
            cnt = db.query(RoleRequirementMatrix).filter(
                RoleRequirementMatrix.job_role_id == r.role_id,
                RoleRequirementMatrix.is_active == True
            ).count()
            by_dept[r.department] = by_dept.get(r.department, 0) + cnt

        return {
            "total_roles": total_roles,
            "total_requirements": total_reqs,
            "mandatory_requirements": mandatory_reqs,
            "optional_requirements": optional_reqs,
            "requirements_by_priority": by_priority,
            "requirements_by_classification": by_class,
            "requirements_by_department": by_dept
        }


matrix_manager = RoleMatrixManager()
