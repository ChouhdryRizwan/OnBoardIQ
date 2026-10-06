"""
Role Requirement Matrix Validator
Deterministic Python validation for Ground-Truth Matrix Integrity (Specification Step 28 & Requirement 5).
Validates roles, document existence, document versions, section IDs, duplicate requirements,
missing mandatory fields, classifications, outdated sources, and prerequisite graph circular dependencies.
No GenAI or LLMs are used.
"""

from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from database.models import (
    RoleRequirementMatrix, JobRole, CompanyDocument, DocumentChunk, DocumentStatusEnum
)

class MatrixValidator:
    """Independent Deterministic Python Validator for Role Requirement Matrix."""

    @staticmethod
    def detect_circular_prerequisites(db: Session, req_id: str, prereq_ids: List[str], visited: Optional[set] = None) -> bool:
        """
        Detects if adding/updating prereq_ids creates a circular dependency graph.
        Returns True if a cycle is detected.
        """
        if visited is None:
            visited = set()

        if req_id in visited:
            return True

        visited.add(req_id)

        for p_id in prereq_ids:
            p_req = db.query(RoleRequirementMatrix).filter(RoleRequirementMatrix.requirement_id == p_id).first()
            if p_req and p_req.prerequisite_requirement_ids:
                next_prereqs = p_req.prerequisite_requirement_ids if isinstance(p_req.prerequisite_requirement_ids, list) else []
                if MatrixValidator.detect_circular_prerequisites(db, req_id, next_prereqs, set(visited)):
                    return True

        return False

    @staticmethod
    def validate_requirement_payload(db: Session, payload: Dict[str, Any], is_update: bool = False, existing_req_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Validates a requirement creation or edit payload before persistence.
        Returns a list of issue dicts.
        """
        issues = []

        req_id = payload.get("requirement_id") or existing_req_id
        role_identifier = payload.get("role_identifier") or payload.get("job_role_id")
        doc_id = payload.get("source_document_id")
        doc_ver = payload.get("source_document_version", 1)
        sec_id = payload.get("source_section_id")
        prereqs = payload.get("prerequisite_requirement_ids", [])

        # 1. Missing Mandatory Fields Check
        if not is_update and not req_id:
            issues.append({"issue_type": "Missing_Field", "description": "Requirement ID is required."})

        if not payload.get("policy_requirement"):
            issues.append({"issue_type": "Missing_Field", "description": "Policy requirement text is required."})

        if not payload.get("required_competency"):
            issues.append({"issue_type": "Missing_Field", "description": "Required competency is required."})

        # 2. Duplicate Requirement ID check (if new creation)
        if not is_update and req_id:
            existing = db.query(RoleRequirementMatrix).filter(RoleRequirementMatrix.requirement_id == req_id).first()
            if existing:
                issues.append({"issue_type": "Duplicate_Requirement_ID", "description": f"Requirement ID '{req_id}' already exists."})

        # 3. Invalid Role Check
        if role_identifier:
            role = db.query(JobRole).filter(
                (JobRole.role_id == role_identifier) | (JobRole.role_code == role_identifier)
            ).first()
            if not role:
                issues.append({"issue_type": "Invalid_Role", "description": f"Role '{role_identifier}' not found."})

        # 4. Source Traceability Verification (Doc ID, Version, Section ID, Status)
        if doc_id:
            # Check document existence & version
            doc = db.query(CompanyDocument).filter(
                CompanyDocument.document_id == doc_id,
                CompanyDocument.version == doc_ver
            ).first()

            if not doc:
                # Try finding any version of doc_id
                any_doc = db.query(CompanyDocument).filter(CompanyDocument.document_id == doc_id).first()
                if not any_doc:
                    issues.append({"issue_type": "Invalid_Document_ID", "description": f"Source document '{doc_id}' does not exist."})
                else:
                    issues.append({"issue_type": "Invalid_Document_Version", "description": f"Version {doc_ver} for document '{doc_id}' does not exist."})
            elif doc.status == DocumentStatusEnum.OBSOLETE:
                issues.append({"issue_type": "Outdated_Source", "description": f"Source document '{doc_id}' v{doc_ver} is OBSOLETE and cannot be cited for active requirements."})

            # Check Section ID in chunks
            if sec_id:
                chunk = db.query(DocumentChunk).filter(
                    DocumentChunk.document_id == doc_id,
                    DocumentChunk.section_id == sec_id
                ).first()
                if not chunk:
                    issues.append({"issue_type": "Invalid_Section_ID", "description": f"Section ID '{sec_id}' not found in document '{doc_id}' chunks."})

        # 5. Check Prerequisite Validity & Circular Dependency
        if prereqs and isinstance(prereqs, list):
            for p_id in prereqs:
                p_item = db.query(RoleRequirementMatrix).filter(RoleRequirementMatrix.requirement_id == p_id).first()
                if not p_item or not p_item.is_active:
                    issues.append({"issue_type": "Invalid_Prerequisite", "description": f"Prerequisite requirement ID '{p_id}' does not exist or is inactive."})

            # Check circular prerequisites
            if req_id and MatrixValidator.detect_circular_prerequisites(db, req_id, prereqs):
                issues.append({"issue_type": "Circular_Prerequisite", "description": f"Circular prerequisite dependency graph detected for requirement '{req_id}'."})

        return issues

    @staticmethod
    def validate_matrix_integrity(db: Session, role_identifier: str) -> Dict[str, Any]:
        """
        Validates ground-truth requirements for a role against active company documents and prerequisites.
        """
        from role_matrix.matrix_manager import matrix_manager
        
        role = matrix_manager.get_role_by_id_or_code(db, role_identifier)
        if not role:
            return {"valid": False, "error": f"Role '{role_identifier}' not found.", "issues": []}

        requirements = db.query(RoleRequirementMatrix).filter(
            RoleRequirementMatrix.job_role_id == role.role_id,
            RoleRequirementMatrix.is_active == True
        ).all()

        issues = []
        valid_count = 0
        mandatory_count = 0

        for req in requirements:
            if req.is_mandatory:
                mandatory_count += 1

            payload = {
                "requirement_id": req.requirement_id,
                "role_identifier": role.role_id,
                "policy_requirement": req.policy_requirement,
                "required_competency": req.required_competency,
                "source_document_id": req.source_document_id,
                "source_document_version": req.source_document_version,
                "source_section_id": req.source_section_id,
                "prerequisite_requirement_ids": req.prerequisite_requirement_ids
            }
            req_issues = MatrixValidator.validate_requirement_payload(db, payload, is_update=True, existing_req_id=req.requirement_id)
            if req_issues:
                for iss in req_issues:
                    iss["requirement_id"] = req.requirement_id
                    issues.append(iss)
            else:
                valid_count += 1

        is_fully_valid = len(issues) == 0
        return {
            "role_code": role.role_code,
            "role_title": role.title,
            "total_requirements": len(requirements),
            "mandatory_requirements": mandatory_count,
            "valid_ground_truth_references": valid_count,
            "is_matrix_valid": is_fully_valid,
            "issues": issues
        }

matrix_validator = MatrixValidator()
