import os
import io
import re
from typing import List, Dict, Any, Optional

# Attempt importing PDF parsing libraries
try:
    import pdfplumber
    HAS_PDFPLUMBER = True
except ImportError:
    HAS_PDFPLUMBER = False

try:
    import pypdf
    HAS_PYPDF = True
except ImportError:
    HAS_PYPDF = False

# Attempt importing python-docx
try:
    import docx
    HAS_DOCX = True
except ImportError:
    HAS_DOCX = False


class DocumentParser:
    """
    Parser for PDF, DOCX, TXT, Markdown, and CSV files.
    Retains Document ID, Section ID, Headings, Page Numbers (PDF), and Paragraph references (DOCX) (Specification Step 6).
    """

    @staticmethod
    def parse_pdf(file_bytes: bytes) -> List[Dict[str, Any]]:
        """
        Parses PDF document page-by-page.
        Returns a list of page/section metadata dicts.
        """
        parsed_pages = []
        
        # Primary strategy: pdfplumber
        if HAS_PDFPLUMBER:
            try:
                with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
                    for i, page in enumerate(pdf.pages, start=1):
                        text = page.extract_text() or ""
                        parsed_pages.append({
                            "page_number": i,
                            "section_id": f"Page-{i}",
                            "heading": f"Page {i}",
                            "text": text.strip(),
                            "paragraph_reference": None
                        })
                return parsed_pages
            except Exception as e:
                print(f"[Parser Warning] pdfplumber failed: {e}. Falling back to pypdf.")

        # Fallback strategy: pypdf
        if HAS_PYPDF:
            try:
                reader = pypdf.PdfReader(io.BytesIO(file_bytes))
                for i, page in enumerate(reader.pages, start=1):
                    text = page.extract_text() or ""
                    parsed_pages.append({
                        "page_number": i,
                        "section_id": f"Page-{i}",
                        "heading": f"Page {i}",
                        "text": text.strip(),
                        "paragraph_reference": None
                    })
                return parsed_pages
            except Exception as e:
                raise ValueError(f"Failed to parse PDF file with pypdf: {e}")

        # Fallback if libraries missing
        raise ImportError("Neither 'pdfplumber' nor 'pypdf' is installed for PDF parsing.")

    @staticmethod
    def parse_docx(file_bytes: bytes) -> List[Dict[str, Any]]:
        """
        Parses DOCX document section-by-section and paragraph-by-paragraph.
        Detects headings to organize sections.
        """
        if not HAS_DOCX:
            raise ImportError("'python-docx' library is not installed for DOCX parsing.")

        doc = docx.Document(io.BytesIO(file_bytes))
        sections = []
        current_section_title = "General Overview"
        current_section_id = "Sec-1"
        current_text_lines = []
        para_counter = 0

        section_idx = 1
        for para in doc.paragraphs:
            text = para.text.strip()
            if not text:
                continue

            para_counter += 1
            # Check if paragraph is a heading
            is_heading = para.style and "Heading" in para.style.name
            
            if is_heading:
                # Flush previous section content if present
                if current_text_lines:
                    sections.append({
                        "page_number": None,
                        "section_id": current_section_id,
                        "heading": current_section_title,
                        "text": "\n".join(current_text_lines),
                        "paragraph_reference": f"Para {para_counter - len(current_text_lines)}-{para_counter - 1}"
                    })
                    current_text_lines = []
                
                section_idx += 1
                current_section_title = text
                current_section_id = f"Sec-{section_idx}"
            else:
                current_text_lines.append(text)

        # Flush final section
        if current_text_lines:
            sections.append({
                "page_number": None,
                "section_id": current_section_id,
                "heading": current_section_title,
                "text": "\n".join(current_text_lines),
                "paragraph_reference": f"Para {para_counter - len(current_text_lines) + 1}-{para_counter}"
            })

        # Process DOCX tables as well
        for t_idx, table in enumerate(doc.tables, start=1):
            table_text = []
            for row in table.rows:
                row_str = " | ".join([cell.text.strip() for cell in row.cells if cell.text.strip()])
                if row_str:
                    table_text.append(row_str)
            if table_text:
                sections.append({
                    "page_number": None,
                    "section_id": f"Table-{t_idx}",
                    "heading": f"Table {t_idx}",
                    "text": "\n".join(table_text),
                    "paragraph_reference": f"Table-{t_idx}"
                })

        return sections

    @staticmethod
    def parse_plain_text(content_str: str) -> List[Dict[str, Any]]:
        """Parses TXT, Markdown, or CSV text content into logical sections."""
        lines = content_str.splitlines()
        sections = []
        current_heading = "Main Content"
        current_section_id = "Sec-1"
        current_lines = []
        sec_counter = 1

        for line in lines:
            stripped = line.strip()
            # Detect Markdown headings (# Section Title)
            if stripped.startswith("#"):
                if current_lines:
                    sections.append({
                        "page_number": None,
                        "section_id": current_section_id,
                        "heading": current_heading,
                        "text": "\n".join(current_lines),
                        "paragraph_reference": None
                    })
                    current_lines = []
                    sec_counter += 1
                    current_section_id = f"Sec-{sec_counter}"
                current_heading = stripped.lstrip("#").strip()
            else:
                if stripped:
                    current_lines.append(stripped)

        if current_lines:
            sections.append({
                "page_number": None,
                "section_id": current_section_id,
                "heading": current_heading,
                "text": "\n".join(current_lines),
                "paragraph_reference": None
            })

        return sections

    @classmethod
    def parse_document(cls, file_bytes: bytes, file_format: str) -> List[Dict[str, Any]]:
        """Entry point for parsing document based on format."""
        fmt = file_format.lower().lstrip(".")
        if fmt == "pdf":
            return cls.parse_pdf(file_bytes)
        elif fmt == "docx":
            return cls.parse_docx(file_bytes)
        else:
            text_str = file_bytes.decode("utf-8", errors="ignore")
            return cls.parse_plain_text(text_str)

parser = DocumentParser()
