import logging

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.dependencies import get_db, require_admin
from app.crud.user import create_user, get_all_users
from app.schemas.user import NewUser

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/admin/users", tags=["users"], dependencies=[Depends(require_admin)]
)


@router.get("/")
async def list_users(db: Session = Depends(get_db)):
    """List all users."""
    result = get_all_users(db)
    return {"users": result}


@router.post("/")
async def create_new_user(new_user: NewUser, db: Session = Depends(get_db)):
    """Create a new user."""
    user = create_user(
        new_user.username, new_user.first_name, new_user.last_name, new_user.role, db
    )
    return {"user": user}
