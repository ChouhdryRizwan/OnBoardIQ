import os
import uuid
from datetime import datetime, date
from typing import List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from sqlalchemy.orm import Session

from config.settings import settings
from database.session import get_db
from database.models import (
    CompanyDocument, DocumentChunk, DocumentProcessingJob,
    DocumentCategoryEnum, DocumentStatusEnum, DocumentFormatEnum
)
from document_validation.validator import validator
from document_processing.parser import parser
from document_processing.chunker import chunker
from security.auth import require_document_manager_role
from schemas.document_schemas import (
    DocumentUploadResponse, DocumentMetadataResponse, DocumentChunkSchema,
    DocumentVersionSummaryResponse, DocumentProcessingJobSchema, DocumentActivateResponse
)

router = APIRouter(prefix="/documents", tags=["Company Documents & Processing"])

EXT_MAP = {
    "pdf": DocumentFormatEnum.PDF,
    "docx": DocumentFormatEnum.DOCX,
    "txt": DocumentFormatEnum.TXT,
    "md": DocumentFormatEnum.MARKDOWN,
    "markdown": DocumentFormatEnum.MARKDOWN,
    "csv": DocumentFormatEnum.CSV
}

@router.post("/upload", response_model=DocumentUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    document_id: str = Form(...),
    title: str = Form(...),
    category: DocumentCategoryEnum = Form(...),
    effective_date: str = Form(...),
    version: int = Form(1),
    department: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    expiry_date: Optional[str] = Form(None),
    precedence_rank: int = Form(3),
    supersedes_document_id: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    user_role: str = Depends(require_document_manager_role)
):
    """
    Ingests, validates, parses, chunks, and indexes an organizational document (PDF / DOCX / TXT / MD / CSV).
    Supports version control, prompt injection security scanning, and page/paragraph traceability.
    """
    # 1. Read file bytes
    content = await file.read()
    
    # 2. File & Metadata Validation (Specification Step 5)
    is_valid_file, file_err = validator.validate_file(file, content)
    if not is_valid_file:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=file_err)

    is_valid_meta, meta_err = validator.validate_metadata(
        document_id, title, category.value, effective_date, version
    )
    if not is_valid_meta:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=meta_err)

    # Check version duplicate for same document_id
    existing_version_doc = db.query(CompanyDocument).filter(
        CompanyDocument.document_id == document_id,
        CompanyDocument.version == version
    ).first()
    if existing_version_doc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Version {version} for Document ID '{document_id}' already exists."
        )

    # 3. Hash computation & Duplicate check across active documents
    content_hash = validator.calculate_hash(content)
    existing_hash_doc = db.query(CompanyDocument).filter(
        CompanyDocument.content_hash == content_hash,
        CompanyDocument.status == DocumentStatusEnum.ACTIVE
    ).first()
    if existing_hash_doc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Duplicate document content detected! Already uploaded as Document ID '{existing_hash_doc.document_id}'."
        )

    # Parse Dates
    try:
        eff_date_obj = datetime.strptime(effective_date, "%Y-%m-%d").date()
        exp_date_obj = datetime.strptime(expiry_date, "%Y-%m-%d").date() if expiry_date else None
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid date format. Dates must be YYYY-MM-DD."
        )

    # Determine Format
    ext = os.path.splitext(file.filename or "")[1].lower().lstrip(".")
    if ext not in EXT_MAP:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported format '{ext}'."
        )
    file_fmt_enum = EXT_MAP[ext]

    # 4. Handle Document Version Control (Specification Step 8)
    superseded = False
    existing_active_doc = db.query(CompanyDocument).filter(
        CompanyDocument.document_id == document_id,
        CompanyDocument.status == DocumentStatusEnum.ACTIVE
    ).first()

    if existing_active_doc:
        if version <= existing_active_doc.version:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Uploaded version ({version}) must be higher than current active version ({existing_active_doc.version})."
            )
        # Mark existing document version as obsolete
        existing_active_doc.status = DocumentStatusEnum.OBSOLETE
        superseded = True

    # Save physical file to UPLOAD_DIR without overwriting previous versions
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    file_path = os.path.join(settings.UPLOAD_DIR, f"{document_id}_v{version}.{ext}")
    with open(file_path, "wb") as f:
        f.write(content)

    # 5. Parse Document Content (Specification Step 6)
    try:
        parsed_sections = parser.parse_document(content, ext)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Error parsing document content: {str(e)}"
        )

    # 6. Chunk Document Content & Scan Security (Specification Step 7 & 42)
    chunks = chunker.chunk_document(document_id, parsed_sections)
    adversarial_count = sum(1 for c in chunks if c["contains_adversarial_flag"])

    # 7. Database Persistence
    doc_record = CompanyDocument(
        document_id=document_id,
        title=title,
        description=description,
        category=category,
        department=department,
        version=version,
        effective_date=eff_date_obj,
        expiry_date=exp_date_obj,
        status=DocumentStatusEnum.ACTIVE,
        file_format=file_fmt_enum,
        file_path=file_path,
        file_size_bytes=len(content),
        content_hash=content_hash,
        precedence_rank=precedence_rank,
        supersedes_document_id=supersedes_document_id or (existing_active_doc.document_id if superseded else None)
    )
    db.add(doc_record)

    # Save Chunks with document_version
    for c in chunks:
        chunk_rec = DocumentChunk(
            chunk_id=c["chunk_id"],
            document_id=document_id,
            document_version=version,
            section_id=c["section_id"],
            section_title=c["section_title"],
            heading=c["heading"],
            page_number=c["page_number"],
            paragraph_reference=c["paragraph_reference"],
            chunk_text=c["chunk_text"],
            chunk_index=c["chunk_index"],
            token_count=c["token_count"],
            contains_adversarial_flag=c["contains_adversarial_flag"]
        )
        db.add(chunk_rec)

    # Save Processing Job record
    job_record = DocumentProcessingJob(
        document_id=document_id,
        document_version=version,
        status="completed",
        total_chunks=len(chunks),
        adversarial_flags_count=adversarial_count
    )
    db.add(job_record)

    db.commit()
    db.refresh(doc_record)

    meta_resp = DocumentMetadataResponse(
        document_id=doc_record.document_id,
        title=doc_record.title,
        description=doc_record.description,
        category=doc_record.category.value if hasattr(doc_record.category, "value") else str(doc_record.category),
        department=doc_record.department,
        version=doc_record.version,
        effective_date=doc_record.effective_date,
        expiry_date=doc_record.expiry_date,
        status=doc_record.status.value if hasattr(doc_record.status, "value") else str(doc_record.status),
        file_format=doc_record.file_format.value if hasattr(doc_record.file_format, "value") else str(doc_record.file_format),
        file_size_bytes=doc_record.file_size_bytes,
        content_hash=doc_record.content_hash,
        precedence_rank=doc_record.precedence_rank,
        supersedes_document_id=doc_record.supersedes_document_id,
        created_at=doc_record.created_at,
        total_chunks=len(chunks),
        adversarial_flags_count=adversarial_count,
        processing_status="completed"
    )

    return DocumentUploadResponse(
        message="Document uploaded, parsed, chunked, and indexed successfully.",
        document=meta_resp,
        chunks_count=len(chunks),
        superseded_previous_version=superseded
    )


@router.get("", response_model=List[DocumentMetadataResponse])
def list_documents(
    category: Optional[DocumentCategoryEnum] = None,
    department: Optional[str] = None,
    status_filter: Optional[DocumentStatusEnum] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Retrieves company documents with optional filtering and search."""
    query = db.query(CompanyDocument)
    if category:
        query = query.filter(CompanyDocument.category == category)
    if department:
        query = query.filter(CompanyDocument.department == department)
    if status_filter:
        query = query.filter(CompanyDocument.status == status_filter)
    if search:
        search_pattern = f"%{search.strip()}%"
        query = query.filter(
            (CompanyDocument.document_id.ilike(search_pattern)) |
            (CompanyDocument.title.ilike(search_pattern)) |
            (CompanyDocument.department.ilike(search_pattern))
        )

    docs = query.order_by(CompanyDocument.created_at.desc()).all()
    results = []
    for d in docs:
        c_count = db.query(DocumentChunk).filter(
            DocumentChunk.document_id == d.document_id,
            DocumentChunk.document_version == d.version
        ).count()
        adv_count = db.query(DocumentChunk).filter(
            DocumentChunk.document_id == d.document_id,
            DocumentChunk.document_version == d.version,
            DocumentChunk.contains_adversarial_flag == True
        ).count()

        job = db.query(DocumentProcessingJob).filter(
            DocumentProcessingJob.document_id == d.document_id,
            DocumentProcessingJob.document_version == d.version
        ).first()

        results.append(
            DocumentMetadataResponse(
                document_id=d.document_id,
                title=d.title,
                description=d.description,
                category=d.category.value if hasattr(d.category, "value") else str(d.category),
                department=d.department,
                version=d.version,
                effective_date=d.effective_date,
                expiry_date=d.expiry_date,
                status=d.status.value if hasattr(d.status, "value") else str(d.status),
                file_format=d.file_format.value if hasattr(d.file_format, "value") else str(d.file_format),
                file_size_bytes=d.file_size_bytes,
                content_hash=d.content_hash,
                precedence_rank=d.precedence_rank,
                supersedes_document_id=d.supersedes_document_id,
                created_at=d.created_at,
                total_chunks=c_count,
                adversarial_flags_count=adv_count,
                processing_status=job.status if job else "completed"
            )
        )
    return results


@router.get("/{document_id}", response_model=DocumentMetadataResponse)
def get_document(document_id: str, db: Session = Depends(get_db)):
    """Retrieves metadata for the active or latest version of a document ID."""
    doc = db.query(CompanyDocument).filter(
        CompanyDocument.document_id == document_id,
        CompanyDocument.status == DocumentStatusEnum.ACTIVE
    ).first()

    if not doc:
        doc = db.query(CompanyDocument).filter(
            CompanyDocument.document_id == document_id
        ).order_by(CompanyDocument.version.desc()).first()

    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Document '{document_id}' not found.")

    c_count = db.query(DocumentChunk).filter(
        DocumentChunk.document_id == doc.document_id,
        DocumentChunk.document_version == doc.version
    ).count()

    adv_count = db.query(DocumentChunk).filter(
        DocumentChunk.document_id == doc.document_id,
        DocumentChunk.document_version == doc.version,
        DocumentChunk.contains_adversarial_flag == True
    ).count()

    job = db.query(DocumentProcessingJob).filter(
        DocumentProcessingJob.document_id == doc.document_id,
        DocumentProcessingJob.document_version == doc.version
    ).first()

    return DocumentMetadataResponse(
        document_id=doc.document_id,
        title=doc.title,
        description=doc.description,
        category=doc.category.value if hasattr(doc.category, "value") else str(doc.category),
        department=doc.department,
        version=doc.version,
        effective_date=doc.effective_date,
        expiry_date=doc.expiry_date,
        status=doc.status.value if hasattr(doc.status, "value") else str(doc.status),
        file_format=doc.file_format.value if hasattr(doc.file_format, "value") else str(doc.file_format),
        file_size_bytes=doc.file_size_bytes,
        content_hash=doc.content_hash,
        precedence_rank=doc.precedence_rank,
        supersedes_document_id=doc.supersedes_document_id,
        created_at=doc.created_at,
        total_chunks=c_count,
        adversarial_flags_count=adv_count,
        processing_status=job.status if job else "completed"
    )


@router.get("/{document_id}/versions", response_model=List[DocumentVersionSummaryResponse])
def list_document_versions(document_id: str, db: Session = Depends(get_db)):
    """Retrieves all version history for a given Document ID."""
    versions = db.query(CompanyDocument).filter(
        CompanyDocument.document_id == document_id
    ).order_by(CompanyDocument.version.desc()).all()

    if not versions:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Document '{document_id}' not found.")

    results = [
        DocumentVersionSummaryResponse(
            document_id=v.document_id,
            version=v.version,
            title=v.title,
            status=v.status.value if hasattr(v.status, "value") else str(v.status),
            file_format=v.file_format.value if hasattr(v.file_format, "value") else str(v.file_format),
            effective_date=v.effective_date,
            created_at=v.created_at,
            is_active=(v.status == DocumentStatusEnum.ACTIVE)
        )
        for v in versions
    ]
    return results


@router.get("/{document_id}/chunks", response_model=List[DocumentChunkSchema])
def get_document_chunks(document_id: str, db: Session = Depends(get_db)):
    """Retrieves all traceable chunks for the active version of a Document ID."""
    doc = db.query(CompanyDocument).filter(
        CompanyDocument.document_id == document_id,
        CompanyDocument.status == DocumentStatusEnum.ACTIVE
    ).first()

    if not doc:
        doc = db.query(CompanyDocument).filter(
            CompanyDocument.document_id == document_id
        ).order_by(CompanyDocument.version.desc()).first()

    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Document '{document_id}' not found.")

    chunks = db.query(DocumentChunk).filter(
        DocumentChunk.document_id == document_id,
        DocumentChunk.document_version == doc.version
    ).order_by(DocumentChunk.chunk_index.asc()).all()

    return chunks


@router.get("/{document_id}/versions/{version}/chunks", response_model=List[DocumentChunkSchema])
def get_specific_version_chunks(document_id: str, version: int, db: Session = Depends(get_db)):
    """Retrieves traceable chunks for a specific historical or active version of a Document ID."""
    doc = db.query(CompanyDocument).filter(
        CompanyDocument.document_id == document_id,
        CompanyDocument.version == version
    ).first()

    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Version {version} for Document '{document_id}' not found.")

    chunks = db.query(DocumentChunk).filter(
        DocumentChunk.document_id == document_id,
        DocumentChunk.document_version == version
    ).order_by(DocumentChunk.chunk_index.asc()).all()

    return chunks


@router.post("/{document_id}/versions/{version}/process", response_model=DocumentProcessingJobSchema)
def reprocess_document_version(
    document_id: str,
    version: int,
    db: Session = Depends(get_db),
    user_role: str = Depends(require_document_manager_role)
):
    """
    Reprocesses an existing document version (re-parses, re-chunks, re-scans security).
    """
    doc = db.query(CompanyDocument).filter(
        CompanyDocument.document_id == document_id,
        CompanyDocument.version == version
    ).first()

    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Version {version} of document '{document_id}' not found.")

    if not os.path.exists(doc.file_path):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Physical file for document '{document_id}' v{version} not found on disk.")

    with open(doc.file_path, "rb") as f:
        file_bytes = f.read()

    # Ext
    ext = os.path.splitext(doc.file_path)[1].lower().lstrip(".")

    try:
        parsed_sections = parser.parse_document(file_bytes, ext)
        chunks = chunker.chunk_document(document_id, parsed_sections)
        adv_count = sum(1 for c in chunks if c["contains_adversarial_flag"])

        # Delete existing chunks for this version
        db.query(DocumentChunk).filter(
            DocumentChunk.document_id == document_id,
            DocumentChunk.document_version == version
        ).delete()

        # Re-insert chunks
        for c in chunks:
            chunk_rec = DocumentChunk(
                chunk_id=c["chunk_id"],
                document_id=document_id,
                document_version=version,
                section_id=c["section_id"],
                section_title=c["section_title"],
                heading=c["heading"],
                page_number=c["page_number"],
                paragraph_reference=c["paragraph_reference"],
                chunk_text=c["chunk_text"],
                chunk_index=c["chunk_index"],
                token_count=c["token_count"],
                contains_adversarial_flag=c["contains_adversarial_flag"]
            )
            db.add(chunk_rec)

        # Update or create processing job
        job = db.query(DocumentProcessingJob).filter(
            DocumentProcessingJob.document_id == document_id,
            DocumentProcessingJob.document_version == version
        ).first()

        if not job:
            job = DocumentProcessingJob(document_id=document_id, document_version=version)
            db.add(job)

        job.status = "completed"
        job.error_message = None
        job.total_chunks = len(chunks)
        job.adversarial_flags_count = adv_count
        job.processed_at = datetime.utcnow()

        db.commit()
        db.refresh(job)
        return job

    except Exception as e:
        job = db.query(DocumentProcessingJob).filter(
            DocumentProcessingJob.document_id == document_id,
            DocumentProcessingJob.document_version == version
        ).first()
        if job:
            job.status = "failed"
            job.error_message = str(e)
            db.commit()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to reprocess document: {str(e)}")


@router.post("/{document_id}/versions/{version}/activate", response_model=DocumentActivateResponse)
def activate_document_version(
    document_id: str,
    version: int,
    db: Session = Depends(get_db),
    user_role: str = Depends(require_document_manager_role)
):
    """
    Activates a specific document version, marking all other versions of the document ID as OBSOLETE.
    """
    target_doc = db.query(CompanyDocument).filter(
        CompanyDocument.document_id == document_id,
        CompanyDocument.version == version
    ).first()

    if not target_doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Version {version} of document '{document_id}' not found.")

    # Find current active version
    current_active = db.query(CompanyDocument).filter(
        CompanyDocument.document_id == document_id,
        CompanyDocument.status == DocumentStatusEnum.ACTIVE
    ).first()

    previous_active_ver = current_active.version if current_active else None

    # Set all versions of document_id to OBSOLETE
    db.query(CompanyDocument).filter(
        CompanyDocument.document_id == document_id
    ).update({"status": DocumentStatusEnum.OBSOLETE})

    # Set target_doc to ACTIVE
    target_doc.status = DocumentStatusEnum.ACTIVE
    db.commit()

    return DocumentActivateResponse(
        message=f"Document '{document_id}' version {version} is now active.",
        document_id=document_id,
        activated_version=version,
        previous_active_version=previous_active_ver
    )
