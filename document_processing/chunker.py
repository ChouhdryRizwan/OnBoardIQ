import uuid
from typing import List, Dict, Any
from security.prompt_injection import detector

class ContentChunker:
    """
    Divides parsed document sections into manageable, traceable chunks (Specification Step 7).
    Each chunk retains full source traceability (Doc ID, Section ID, Page/Paragraph).
    """

    def __init__(self, chunk_size_words: int = 250, chunk_overlap_words: int = 40):
        self.chunk_size_words = chunk_size_words
        self.chunk_overlap_words = chunk_overlap_words

    def estimate_tokens(self, text: str) -> int:
        """Estimates token count for text."""
        words = text.split()
        return int(len(words) * 1.3)

    def chunk_section(
        self,
        document_id: str,
        section_data: Dict[str, Any],
        start_chunk_index: int
    ) -> List[Dict[str, Any]]:
        """Splits a single document section into one or more chunks."""
        text = section_data.get("text", "")
        if not text.strip():
            return []

        words = text.split()
        chunks = []
        chunk_idx = start_chunk_index

        if len(words) <= self.chunk_size_words:
            # Section fits in a single chunk
            chunk_text = text
            scan_res = detector.scan_text(chunk_text)
            chunks.append({
                "chunk_id": str(uuid.uuid4()),
                "document_id": document_id,
                "section_id": section_data.get("section_id", "Sec-1"),
                "section_title": section_data.get("heading", "General"),
                "heading": section_data.get("heading", "General"),
                "page_number": section_data.get("page_number"),
                "paragraph_reference": section_data.get("paragraph_reference"),
                "chunk_text": chunk_text,
                "chunk_index": chunk_idx,
                "token_count": self.estimate_tokens(chunk_text),
                "contains_adversarial_flag": scan_res["contains_adversarial_flag"],
                "detected_patterns": scan_res["detected_patterns"]
            })
        else:
            # Split with overlap
            step = self.chunk_size_words - self.chunk_overlap_words
            for i in range(0, len(words), step):
                chunk_words = words[i : i + self.chunk_size_words]
                chunk_text = " ".join(chunk_words)
                scan_res = detector.scan_text(chunk_text)
                
                chunks.append({
                    "chunk_id": str(uuid.uuid4()),
                    "document_id": document_id,
                    "section_id": section_data.get("section_id", "Sec-1"),
                    "section_title": section_data.get("heading", "General"),
                    "heading": section_data.get("heading", "General"),
                    "page_number": section_data.get("page_number"),
                    "paragraph_reference": section_data.get("paragraph_reference"),
                    "chunk_text": chunk_text,
                    "chunk_index": chunk_idx,
                    "token_count": self.estimate_tokens(chunk_text),
                    "contains_adversarial_flag": scan_res["contains_adversarial_flag"],
                    "detected_patterns": scan_res["detected_patterns"]
                })
                chunk_idx += 1

        return chunks

    def chunk_document(
        self,
        document_id: str,
        parsed_sections: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Chunks all sections of a document while preserving order and metadata."""
        all_chunks = []
        global_index = 1
        for section in parsed_sections:
            sec_chunks = self.chunk_section(document_id, section, global_index)
            all_chunks.extend(sec_chunks)
            global_index += len(sec_chunks)
        return all_chunks

chunker = ContentChunker()
