import re
from typing import Dict, List, Any

# Pattern definitions for adversarial instructions embedded in documents
ADVERSARIAL_PATTERNS = [
    r"ignore\s+(all\s+)?(previous|prior)\s+instructions",
    r"disregard\s+(all\s+)?(previous|prior)\s+instructions",
    r"system\s*:\s*you\s+are\s+now",
    r"approve\s+this\s+employee",
    r"override\s+all\s+validation",
    r"set\s+coverage\s+score\s+to\s+100",
    r"bypass\s+compliance",
    r"give\s+full\s+marks",
    r"admin\s+override\s*:",
    r"do\s+not\s+check\s+requirements"
]

class PromptInjectionDetector:
    """
    Security Engine: Detects adversarial prompt injection instructions embedded inside uploaded documents (Specification Step 42, 43).
    """

    def __init__(self):
        self.compiled_patterns = [re.compile(p, re.IGNORECASE) for p in ADVERSARIAL_PATTERNS]

    def scan_text(self, text: str) -> Dict[str, Any]:
        """Scans a block of text for prompt injection keywords/phrases."""
        matches = []
        for pattern in self.compiled_patterns:
            found = pattern.findall(text)
            if found:
                matches.append(pattern.pattern)
        
        is_suspicious = len(matches) > 0
        return {
            "contains_adversarial_flag": is_suspicious,
            "detected_patterns": matches,
            "risk_score": len(matches) * 0.5 if is_suspicious else 0.0
        }

    def sanitize_for_prompt(self, text: str) -> str:
        """
        Wraps content safely for LLM input to enforce data isolation (Specification Step 42).
        Escapes XML-like delimiters to prevent document content breaking system context.
        """
        escaped_text = text.replace("<document_content>", "[document_content]")
        escaped_text = escaped_text.replace("</document_content>", "[/document_content]")
        return f"<document_content>\n{escaped_text}\n</document_content>"

detector = PromptInjectionDetector()
