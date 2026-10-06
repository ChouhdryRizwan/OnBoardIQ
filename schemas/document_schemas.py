from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date, datetime

class DocumentChunkSchema(BaseModel):
    chunk_id: str
    document_id: str
    document_version: int = 1
    section_id: str
    section_title: Optional[str] = None
    heading: Optional[str] = None
    page_number: Optional[int] = None
    paragraph_reference: Optional[str] = None
    chunk_text: str
    chunk_index: int
    token_count: Optional[int] = None
    contains_adversarial_flag: bool = False

    class Config:
        from_attributes = True

class DocumentMetadataResponse(BaseModel):
    document_id: str
    title: str
    description: Optional[str] = None
    category: str
    department: Optional[str] = None
    version: int
    effective_date: date
    expiry_date: Optional[date] = None
    status: str
    file_format: str
    file_size_bytes: int
    content_hash: str
    precedence_rank: int
    supersedes_document_id: Optional[str] = None
    created_at: datetime
    total_chunks: int = 0
    adversarial_flags_count: int = 0
    processing_status: str = "completed"

    class Config:
        from_attributes = True

class DocumentUploadResponse(BaseModel):
    message: str
    document: DocumentMetadataResponse
    chunks_count: int
    superseded_previous_version: bool = False

class DocumentVersionSummaryResponse(BaseModel):
    document_id: str
    version: int
    title: str
    status: str
    file_format: str
    effective_date: date
    created_at: datetime
    is_active: bool

class DocumentProcessingJobSchema(BaseModel):
    job_id: str
    document_id: str
    document_version: int
    status: str
    error_message: Optional[str] = None
    total_chunks: int
    adversarial_flags_count: int
    processed_at: datetime

    class Config:
        from_attributes = True

class DocumentActivateResponse(BaseModel):
    message: str
    document_id: str
    activated_version: int
    previous_active_version: Optional[int] = None
