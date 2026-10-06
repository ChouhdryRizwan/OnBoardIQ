import os
import hashlib
from typing import Dict, Any, Tuple
from fastapi import UploadFile, HTTPException, status
from config.settings import settings

class DocumentValidator:
    """
    Validates uploaded documents against file type, file size, empty content, and duplicate hashes (Specification Step 5).
    """

    @staticmethod
    def calculate_hash(content: bytes) -> str:
        """Calculates SHA-256 hash of file bytes for duplicate detection."""
        return hashlib.sha256(content).hexdigest()

    @staticmethod
    def validate_file(file: UploadFile, content: bytes) -> Tuple[bool, str]:
        """
        Validates basic file parameters.
        Returns (is_valid, error_message).
        """
        filename = file.filename or ""
        ext = os.path.splitext(filename)[1].lower()

        # 1. File extension validation
        if ext not in settings.ALLOWED_EXTENSIONS:
            return False, f"Unsupported file extension '{ext}'. Allowed: {', '.join(settings.ALLOWED_EXTENSIONS)}"

        # MIME type validation
        MIME_MAP = {
            ".pdf": ["application/pdf", "application/x-pdf", "application/octet-stream", "binary/octet-stream"],
            ".docx": ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/msword", "application/octet-stream", "binary/octet-stream"],
            ".txt": ["text/plain"],
            ".md": ["text/plain", "text/markdown", "text/x-markdown"],
            ".csv": ["text/csv", "application/csv", "text/plain"]
        }
        if file.content_type and ext in MIME_MAP:
            allowed_mimes = MIME_MAP[ext]
            if file.content_type.lower() not in allowed_mimes:
                return False, f"MIME type '{file.content_type}' does not match extension '{ext}'."

        # 2. File size validation
        if len(content) > settings.MAX_FILE_SIZE_BYTES:
            max_mb = settings.MAX_FILE_SIZE_BYTES / (1024 * 1024)
            return False, f"File size exceeds maximum threshold of {max_mb} MB."

        # 3. Empty document validation
        if len(content) == 0:
            return False, "Uploaded file is empty (0 bytes)."

        return True, ""

    @staticmethod
    def validate_metadata(
        document_id: str,
        title: str,
        category: str,
        effective_date: str,
        version: int
    ) -> Tuple[bool, str]:
        """Validates mandatory document metadata attributes."""
        if not document_id or not document_id.strip():
            return False, "Document ID is required."
        if not title or not title.strip():
            return False, "Document Title is required."
        if not category or not category.strip():
            return False, "Document Category is required."
        if version < 1:
            return False, "Document Version must be a positive integer."
        return True, ""

validator = DocumentValidator()
