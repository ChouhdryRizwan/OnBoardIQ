import uuid
from datetime import datetime
from typing import Any, Optional
from sqlalchemy.orm import Session
from database.models import PolicyAuditEvent

class AuditLogger:
    """Structured audit trail recorder for Policy Update lifecycle events."""

    @staticmethod
    def log_event(
        db: Session,
        event_type: str,
        username: str = "System Admin",
        user_id: Optional[str] = None,
        entity_type: str = "Document",
        entity_id: str = "DOC-01",
        old_value: Optional[Any] = None,
        new_value: Optional[Any] = None,
        reason: Optional[str] = None
    ) -> PolicyAuditEvent:
        """Records a policy audit trail event."""
        event = PolicyAuditEvent(
            event_id=str(uuid.uuid4()),
            event_type=event_type,
            user_id=user_id,
            username=username,
            entity_type=entity_type,
            entity_id=entity_id,
            old_value=old_value,
            new_value=new_value,
            reason=reason,
            performed_at=datetime.utcnow()
        )
        db.add(event)
        db.commit()
        db.refresh(event)
        return event

audit_logger = AuditLogger()
