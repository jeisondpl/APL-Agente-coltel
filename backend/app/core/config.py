from pydantic_settings import BaseSettings


class Settings(BaseSettings):

    # General
    app_origin: str
    secret_key: str

    # OpenAI
    openai_api_key: str
    openai_llm_name: str

    # Inference Config
    temperature: float
    tokens: int

    # Postgres
    postgres_user: str
    postgres_password: str
    postgres_host: str
    postgres_port: str
    postgres_db: str

    # Embeddings
    vector_dimension: int

    # Qdrant
    url_qdrant: str
    collection_name: str
    dense_model: str
    sparse_model: str
    dense_prefetch_limit: int
    sparse_prefetch_limit: int
    limit: int

    # MinIO
    minio_endpoint: str
    minio_external_endpoint: str
    minio_access_key: str
    minio_secret_key: str
    bucket_name: str

    # RAG
    chunk_strategy: str
    default_chunk_size: int
    max_chunk_size: int
    default_chunk_overlap: int
    similarity_threshold: float

    # Redis
    redis_host: str
    redis_port: int
    redis_db: int
    redis_broker_db: int


settings = Settings()
