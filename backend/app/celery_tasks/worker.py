from celery import Celery
from core.config import settings

# Redis
REDIS_HOST = settings.redis_host
REDIS_PORT = settings.redis_port
REDIS_DB = settings.redis_db
REDIS_BROKER_DB = settings.redis_broker_db

CELERY_BACKEND = f"redis://{REDIS_HOST}:{REDIS_PORT}/{REDIS_DB}"

BROKER_URL = f"redis://{REDIS_HOST}:{REDIS_PORT}/{REDIS_BROKER_DB}"

app = Celery(
    "app",
    broker=BROKER_URL,
    backend=CELERY_BACKEND,
    include=["app.celery_tasks.tasks"],
)

app.conf.update(
    task_track_started=True,
    result_expires=3600,
    worker_prefetch_multiplier=1,
    task_soft_time_limit=1200,
    task_time_limit=1260,
    broker_transport_options={
        "visibility_timeout": 3600,
    },
)
