from typing import Generator

from fastapi import HTTPException, Request, status
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.schemas.user import UserContext


def get_db() -> Generator[Session, None, None]:
    """Dependency to get the database session."""
    db = SessionLocal()
    try:
        yield db
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


async def require_admin(request: Request):
    """Check if the user has admin privileges and return the user context."""
    current_user: UserContext = request.state.user_context
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return current_user
