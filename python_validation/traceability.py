from typing import List, Dict, Any, Tuple, Set
from sqlalchemy.orm import Session
from database.models import CompanyDocument, DocumentChunk, DocumentStatusEnum
from python_validation.schemas import ValidationIssueSchema

class TraceabilityValidator:
    """Evaluates source document citations & section chunk existence deterministically (Specification Step 31-32)."""

    @staticmethod
    def evaluate_source_traceability(
        db: Session,
        cited_items: List[Dict[str, Any]],
        ground_truth_map: Dict[str, Any]
    ) -> Tuple[float, int, int, List[ValidationIssueSchema]]:
        """
        Evaluates source document citations for modules, tasks, and quizzes.
        Returns (traceability_score, valid_count, unsupported_count, issues).
        """
        active_documents = {
            doc.document_id: doc for doc in db.query(CompanyDocument).filter(
                CompanyDocument.status == DocumentStatusEnum.ACTIVE
            ).all()
        }

        all_chunks = db.query(DocumentChunk.document_id, DocumentChunk.section_id, DocumentChunk.document_version).all()
        valid_chunk_keys = {(c.document_id, c.section_id, c.document_version) for c in all_chunks}
        chunk_section_keys = {(c.document_id, c.section_id) for c in all_chunks}

        valid_count = 0
        unsupported_count = 0
        issues = []

        for item in cited_items:
            doc_id = item.get("source_document_id")
            sec_id = item.get("source_section_id")
            doc_ver = item.get("source_document_version", 1)
            req_id = item.get("requirement_id")
            item_type = item.get("item_type", "module")
            title = item.get("title", "")

            # Check 1: Missing Source ID
            if not doc_id or not sec_id:
                unsupported_count += 1
                issues.append(ValidationIssueSchema(
                    requirement_id=req_id,
                    issue_type="missing_source",
                    severity="high",
                    explanation=f"{item_type.capitalize()} '{title}' is missing mandatory source_document_id or source_section_id.",
                    expected_value="Valid source_document_id and source_section_id",
                    generated_value=f"doc_id='{doc_id}', sec_id='{sec_id}'"
                ))
                continue

            # Check 2: Active Document Existence
            doc_record = active_documents.get(doc_id)
            is_doc_active = doc_record is not None

            # Check 3: Chunk / Section Existence
            is_sec_valid = (doc_id, sec_id) in chunk_section_keys

            # Check 4: Source Mismatch against Ground Truth RRM
            expected_req = ground_truth_map.get(req_id) if req_id else None
            is_mismatch = False
            if expected_req:
                if expected_req.source_document_id != doc_id or expected_req.source_section_id != sec_id:
                    is_mismatch = True

            if is_doc_active and is_sec_valid and not is_mismatch:
                valid_count += 1
            else:
                unsupported_count += 1
                if not is_doc_active:
                    issues.append(ValidationIssueSchema(
                        requirement_id=req_id,
                        issue_type="invalid_document",
                        severity="high",
                        explanation=f"Document ID '{doc_id}' cited in {item_type} '{title}' is not active or does not exist in Company Documents.",
                        expected_value=f"Active document in repository",
                        generated_value=f"Doc ID '{doc_id}'"
                    ))
                elif not is_sec_valid:
                    issues.append(ValidationIssueSchema(
                        requirement_id=req_id,
                        issue_type="invalid_section",
                        severity="high",
                        explanation=f"Section ID '{sec_id}' cited in {item_type} '{title}' does not exist in parsed chunks for document '{doc_id}'.",
                        expected_value=f"Existing section chunk for '{doc_id}'",
                        generated_value=f"Section ID '{sec_id}'"
                    ))
                elif is_mismatch:
                    issues.append(ValidationIssueSchema(
                        requirement_id=req_id,
                        issue_type="source_mismatch",
                        severity="medium",
                        explanation=f"Source citation ({doc_id}, section {sec_id}) in {item_type} '{title}' differs from expected RRM ground truth ({expected_req.source_document_id}, {expected_req.source_section_id}).",
                        expected_value=f"Doc: {expected_req.source_document_id}, Sec: {expected_req.source_section_id}",
                        generated_value=f"Doc: {doc_id}, Sec: {sec_id}"
                    ))

        total_items = len(cited_items)
        traceability_score = (
            round((valid_count / total_items * 100.0), 2)
            if total_items > 0 else 100.0
        )

        return traceability_score, valid_count, unsupported_count, issues

traceability_validator = TraceabilityValidator()
