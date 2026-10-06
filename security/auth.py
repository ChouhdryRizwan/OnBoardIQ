from fastapi import Header, HTTPException, status
from typing import Optional

def require_document_manager_role(x_user_role: Optional[str] = Header(None)) -> str:
    """
    Enforces Document Management Authorization (Security Specification Step 44).
    Roles 'admin', 'training_manager', 'reviewer', 'manager' are authorized.
    Role 'employee' is denied document modification access.
    """
    role = (x_user_role or "admin").lower().strip()
    if role == "employee":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access Denied: Only authorized training managers and admins can upload or modify documents."
        )
    return role
