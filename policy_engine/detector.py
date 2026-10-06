from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from database.models import CompanyDocument, DocumentChunk, DocumentStatusEnum
from policy_engine.audit_logger import audit_logger

class PolicyDetector:
    """100% Deterministic Policy Update & Version Change Detector."""

    @staticmethod
    def detect_version_changes(db: Session, document_id: str, new_version: Optional[int] = None) -> Dict[str, Any]:
        """
        Detects version changes, section differences, and obsolete versions between document versions.
        Requirement 1: 100% Deterministic metadata comparison (No GenAI).
        """
        docs = db.query(CompanyDocument).filter(
            CompanyDocument.document_id == document_id
        ).order_by(CompanyDocument.version.desc()).all()

        if not docs:
            raise ValueError(f"Document '{document_id}' not found.")

        target_doc = docs[0]
        if new_version:
            target_doc = next((d for d in docs if d.version == new_version), docs[0])

        prev_doc = next((d for d in docs if d.version < target_doc.version), None)

        old_ver = prev_doc.version if prev_doc else 0
        new_ver = target_doc.version

        # Fetch Chunks for both versions
        new_chunks = db.query(DocumentChunk).filter(
            DocumentChunk.document_id == document_id,
            DocumentChunk.document_version == new_ver
        ).all()

        old_chunks = db.query(DocumentChunk).filter(
            DocumentChunk.document_id == document_id,
            DocumentChunk.document_version == old_ver
        ).all() if prev_doc else []

        new_sections = {c.section_id for c in new_chunks}
        old_sections = {c.section_id for c in old_chunks}

        added_sections = list(new_sections - old_sections)
        removed_sections = list(old_sections - new_sections)

        # Compare modified section content
        common_sections = new_sections.intersection(old_sections)
        modified_sections = []
        for sec in common_sections:
            c_new = next((c for c in new_chunks if c.section_id == sec), None)
            c_old = next((c for c in old_chunks if c.section_id == sec), None)
            if c_new and c_old and c_new.chunk_text.strip() != c_old.chunk_text.strip():
                modified_sections.append(sec)

        change_type = "added" if old_ver == 0 else ("modified" if (modified_sections or added_sections or removed_sections) else "source_version_changed")

        # Mark previous version as OBSOLETE if new version is ACTIVE
        if target_doc.status == DocumentStatusEnum.ACTIVE and prev_doc:
            prev_doc.status = DocumentStatusEnum.OBSOLETE
            audit_logger.log_event(
                db=db,
                event_type="POLICY_VERSION_ACTIVATED",
                entity_type="CompanyDocument",
                entity_id=document_id,
                old_value={"version": old_ver, "status": "active"},
                new_value={"version": new_ver, "status": "active"},
                reason=f"Version {new_ver} activated; version {old_ver} marked OBSOLETE."
            )

        audit_logger.log_event(
            db=db,
            event_type="POLICY_CHANGE_DETECTED",
            entity_type="CompanyDocument",
            entity_id=document_id,
            old_value={"version": old_ver, "sections": list(old_sections)},
            new_value={"version": new_ver, "sections": list(new_sections)},
            reason=f"Policy change detected for document '{document_id}' v{old_ver} -> v{new_ver}."
        )

        return {
            "document_id": document_id,
            "document_title": target_doc.title,
            "old_version": old_ver,
            "new_version": new_ver,
            "effective_date": target_doc.effective_date.isoformat() if target_doc.effective_date else "",
            "change_type": change_type,
            "added_sections": added_sections,
            "modified_sections": modified_sections,
            "removed_sections": removed_sections,
            "total_new_sections": len(new_sections)
        }

policy_detector = PolicyDetector()
