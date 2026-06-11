from config.logging import setup_logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routers import auth, files, me, queries, storage, threads, users
from app.core.config import settings
from app.db.base import Base
from app.db.session import engine
from app.middleware.auth_middleware import user_context_middleware
from app.models import block, message, thread, user_data  # Required for ORM

setup_logging()

ORIGIN = settings.app_origin
origins = [origin.strip() for origin in ORIGIN.split(",")] if ORIGIN else []

app = FastAPI(title="ColtelSuperAgent", version="0.0.1", prefix="/api")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

app.middleware("http")(user_context_middleware)


@app.get("/health")
async def check_health():
    return {"status": "ok"}


app.include_router(files.router)
app.include_router(queries.router)
app.include_router(storage.router)
app.include_router(users.router)
app.include_router(auth.router)
app.include_router(threads.router)
app.include_router(me.router)

Base.metadata.create_all(bind=engine)
