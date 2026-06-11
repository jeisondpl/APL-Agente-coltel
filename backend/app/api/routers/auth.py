from datetime import timedelta

from fastapi import APIRouter

from app.schemas.user import Token
from app.schemas.user import UserInput
from app.services.auth_service import create_access_token

ACCESS_TOKEN_EXPIRE_MINUTES = 360

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/token")
async def login_for_access_token(data: UserInput):
    """Login for access token."""
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data=data, expires_delta=access_token_expires)
    return Token(access_token=access_token, token_type="bearer")
