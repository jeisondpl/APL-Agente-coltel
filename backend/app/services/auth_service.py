from datetime import datetime, timedelta, timezone

from jose import jwt

from app.core.config import settings
from app.schemas.user import UserInput

SECRET_KEY = settings.secret_key
ALGORITHM = "HS256"


def create_access_token(data: UserInput, expires_delta: timedelta | None = None):
    """Create an access token for a user."""
    to_encode = data.model_dump()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=60)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str):
    """Decode an access token."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.JWTError:
        raise ValueError("Invalid token")
    return payload
