from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from database.models import CompanyDocument, DocumentStatusEnum, LearningModule
from python_validation.schemas import ValidationIssueSchema

class VersionCheckValidator:
    """Verifies that generated content cites currently active document versions (Specification Step 33 & Requirement 13)."""

    @staticmethod
    def evaluate_document_versions(
        db: Session,
        generated_modules: List[LearningModule]
    ) -> Tuple[int, List[ValidationIssueSchema]]:
        """
        Checks if generated modules cite obsolete or outdated policy versions.
        Returns (outdated_count, list_of_issues).
        """
        outdated_count = 0
        issues = []

        # Fetch latest active version for each document_id
        active_docs = db.query(CompanyDocument).filter(
            CompanyDocument.status == DocumentStatusEnum.ACTIVE
        ).all()
        active_doc_map = {doc.document_id: doc for doc in active_docs}

        # Fetch obsolete documents for lookup
        obsolete_docs = db.query(CompanyDocument).filter(
            CompanyDocument.status == DocumentStatusEnum.OBSOLETE
        ).all()
        obsolete_doc_map = {f"{doc.document_id}_v{doc.version}": doc for doc in obsolete_docs}

        # Pre-fetch requirement versions from RoleRequirementMatrix for accurate citation resolution
        from database.models import RoleRequirementMatrix
        req_ids = [m.requirement_id for m in generated_modules if m.requirement_id]
        req_ver_map = {}
        if req_ids:
            req_rows = db.query(
                RoleRequirementMatrix.requirement_id,
                RoleRequirementMatrix.source_document_version
            ).filter(RoleRequirementMatrix.requirement_id.in_(req_ids)).all()
            req_ver_map = {r[0]: r[1] for r in req_rows}

        for m in generated_modules:
            doc_id = m.source_document_id
            cited_ver = getattr(m, "source_document_version", None)
            if cited_ver is None and m.requirement_id:
                cited_ver = req_ver_map.get(m.requirement_id)
            if cited_ver is None:
                cited_ver = 1
            mod_title = m.title

            active_doc = active_doc_map.get(doc_id)
            if active_doc:
                if cited_ver != active_doc.version:
                    outdated_count += 1
                    issues.append(ValidationIssueSchema(
                        requirement_id=m.requirement_id,
                        issue_type="outdated_source",
                        severity="high",
                        explanation=f"Module '{mod_title}' cites version {cited_ver} of document '{doc_id}', but currently active policy version is {active_doc.version}.",
                        expected_value=f"Document version {active_doc.version}",
                        generated_value=f"Document version {cited_ver}"
                    ))
            else:
                # Check if cited document is marked obsolete
                obs_key = f"{doc_id}_v{cited_ver}"
                obs_doc = obsolete_doc_map.get(obs_key) or db.query(CompanyDocument).filter(
                    CompanyDocument.document_id == doc_id,
                    CompanyDocument.status == DocumentStatusEnum.OBSOLETE
                ).first()

                if obs_doc:
                    outdated_count += 1
                    issues.append(ValidationIssueSchema(
                        requirement_id=m.requirement_id,
                        issue_type="outdated_source",
                        severity="high",
                        explanation=f"Module '{mod_title}' cites obsolete document '{doc_id}' (v{obs_doc.version}).",
                        expected_value="Active non-obsolete document version",
                        generated_value=f"Obsolete doc '{doc_id}' v{obs_doc.version}"
                    ))

        return outdated_count, issues

version_check_validator = VersionCheckValidator()
