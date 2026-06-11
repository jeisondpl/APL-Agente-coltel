import logging

from fastapi import status
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer

from app.crud.user import get_user_by_username
from app.db.session import SessionLocal
from app.schemas.user import UserContext
from app.services.auth_service import decode_access_token

logger = logging.getLogger(__name__)

EXCLUDED_PATHS = [
    "/docs",
    "/openapi.json",
    "/redoc",
    "/health",
    "/auth/token",
]

bearer_scheme = HTTPBearer()


async def user_context_middleware(request, call_next):
    """Auth middleware, injects user context into request state."""
    if request.method == "OPTIONS":
        return JSONResponse(
            content={},
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "*",
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Credentials": "true",
            },
        )
    if request.url.path in EXCLUDED_PATHS:
        return await call_next(request)
    unauthorized_response = JSONResponse(
        status_code=status.HTTP_401_UNAUTHORIZED,
        content={"detail": "Could not validate credentials"},
        headers={"WWW-Authenticate": "Bearer"},
    )
    if "Authorization" not in request.headers:
        logger.error("Authorization header not found")
        return unauthorized_response
    auth_header = request.headers.get("Authorization")
    try:
        scheme, token = auth_header.split()
        if scheme.lower() != "bearer":
            logger.error("Invalid authentication scheme")
            return unauthorized_response
        payload = decode_access_token(token)
        with SessionLocal() as db:
            user_in_db = get_user_by_username(payload["username"], db)
        if not user_in_db:
            logger.error("User not found")
            return unauthorized_response
        user_context = UserContext(
            id=str(user_in_db.id),
            first_name=user_in_db.first_name,
            last_name=user_in_db.last_name,
            username=user_in_db.username,
            role=user_in_db.role,
        )
        request.state.user_context = user_context
    except ValueError:
        return unauthorized_response
    return await call_next(request)
