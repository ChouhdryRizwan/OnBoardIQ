"""
Source Traceability Service — Generates end-to-end audit traceability from Document Chunk to Onboarding Module.
100% Deterministic Python execution.
"""

from typing import List, Optional
from sqlalchemy.orm import Session
from database.models import (
    CompanyDocument, DocumentChunk, RoleRequirementMatrix, JobRole,
    LearningModule, OnboardingPlan, ManualReviewQueue
)
from schemas.report_schemas import TraceabilityReportItem


def get_source_traceability_report(
    db: Session,
    document_id: Optional[str] = None,
    role_code: Optional[str] = None,
    requirement_id: Optional[str] = None
) -> List[TraceabilityReportItem]:
    chunk_query = db.query(DocumentChunk).join(
        CompanyDocument,
        (DocumentChunk.document_id == CompanyDocument.document_id) & (DocumentChunk.document_version == CompanyDocument.version)
    )

    if document_id:
        chunk_query = chunk_query.filter(DocumentChunk.document_id == document_id.strip())

    chunks = chunk_query.all()
    results: List[TraceabilityReportItem] = []

    for chunk in chunks:
        doc = db.query(CompanyDocument).filter(
            CompanyDocument.document_id == chunk.document_id,
            CompanyDocument.version == chunk.document_version
        ).first()

        # Find matching requirement
        rrm_query = db.query(RoleRequirementMatrix).filter(
            RoleRequirementMatrix.source_document_id == chunk.document_id
        )
        if requirement_id:
            rrm_query = rrm_query.filter(RoleRequirementMatrix.requirement_id == requirement_id.strip())

        matched_requirements = rrm_query.all()

        for req in matched_requirements:
            job_role = req.job_role
            if role_code and job_role and job_role.role_code.lower() != role_code.strip().lower():
                continue

            # Find matching learning modules
            modules = db.query(LearningModule).filter(
                LearningModule.requirement_id == req.requirement_id
            ).all()

            for mod in modules:
                # Find plan via stage
                stage = mod.stage
                plan = stage.plan if stage else None
                if not plan:
                    continue

                val_status = plan.verification_status.value if hasattr(plan.verification_status, 'value') else str(plan.verification_status)

                rev_queue = db.query(ManualReviewQueue).filter(
                    ManualReviewQueue.plan_id == plan.plan_id
                ).first()
                human_rev_status = rev_queue.status if rev_queue else "approved"

                item = TraceabilityReportItem(
                    source_document_id=chunk.document_id,
                    source_document_title=doc.title if doc else chunk.document_id,
                    source_document_version=chunk.document_version,
                    page_number=chunk.page_number,
                    section_id=chunk.section_id,
                    paragraph_reference=chunk.paragraph_reference,
                    chunk_id=chunk.chunk_id,
                    requirement_id=req.requirement_id,
                    role_code=job_role.role_code if job_role else "",
                    module_id=mod.module_id,
                    module_title=mod.title,
                    plan_id=plan.plan_id,
                    validation_status=val_status,
                    human_review_status=human_rev_status
                )
                results.append(item)

    return results
