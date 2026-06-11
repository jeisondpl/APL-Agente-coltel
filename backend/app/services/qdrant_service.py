import logging
from typing import List

from qdrant_client import QdrantClient, models

from app.core.config import settings
from app.schemas.file_schemas import PointData
from app.services.openai_embeddings import embed_texts

URL_QDRANT = settings.url_qdrant
COLLECTION_NAME = settings.collection_name
VECTOR_DIMENSION = settings.vector_dimension
DENSE_MODEL = settings.dense_model
SPARSE_MODEL = settings.sparse_model
DENSE_PREFETCH_LIMIT = settings.dense_prefetch_limit
SPARSE_PREFETCH_LIMIT = settings.sparse_prefetch_limit
LIMIT = settings.limit

CLIENT = QdrantClient(url=URL_QDRANT)

logger = logging.getLogger(__name__)


async def upsert_points(
    point_list: List[PointData], collection_name: str = COLLECTION_NAME
):
    """Upsert points into Qdrant"""
    created = await create_collection_if_not_exists(
        collection_name, size=VECTOR_DIMENSION
    )
    vectors = [p.vector for p in point_list]
    CLIENT.upsert(
        collection_name=collection_name,
        points=[
            models.PointStruct(
                id=p.id,
                vector={
                    "text": v,
                    "text_sparse": models.Document(
                        text=p.payload["text"],
                        model=SPARSE_MODEL,
                    ),
                },
                payload=p.payload,
            )
            for p, v in zip(point_list, vectors)
        ],
    )
    return len(point_list)


def make_filter_by_chunk_types(chunk_types):
    """Build filter by chunk types"""
    return models.Filter(
        must=[
            models.FieldCondition(key="chunk_type", match=models.MatchAny(any=chunk_types))            
        ]
    )


def make_filter_by_parent_file(sources):
    """Build filter by parent file"""
    return models.Filter(
        must=[
            models.FieldCondition(key="parent_file", match=models.MatchAny(any=sources))
        ]
    )


def make_filter_by_parent_file_and_chunk_types(sources, chunk_types):
    """Build filter by parent file and chunk type"""
    return models.Filter(
        must=[
            models.FieldCondition(
                key="parent_file", match=models.MatchAny(any=sources)
            ),
            models.FieldCondition(key="chunk_type", match=models.MatchAny(any=chunk_types)),
        ]
    )


def drop_points_by_filter(
    collection_name: str = COLLECTION_NAME, query_filter: models.Filter = None
):
    """Drop points by filter"""
    result = CLIENT.delete(
        collection_name=collection_name,
        points_selector=models.FilterSelector(filter=query_filter),
    )
    return result


def hybrid_search(
    query,
    query_filter=None,
    collection_name: str = COLLECTION_NAME,
    limit: int = LIMIT,
):
    """Hybrid search, including dense and sparse vectors"""
    if not exists_collection(collection_name):
        raise ValueError(f"Collection '{collection_name}' does not exist.")
    query_vector = embed_texts([query])[0]
    result = CLIENT.query_points(
        collection_name=collection_name,
        prefetch=[
            models.Prefetch(
                query=query_vector,
                using="text",
                limit=DENSE_PREFETCH_LIMIT,
            ),
            models.Prefetch(
                query=models.Document(
                    text=query,
                    model=SPARSE_MODEL,
                ),
                using="text_sparse",
                limit=SPARSE_PREFETCH_LIMIT,
            ),
        ],
        query=models.FusionQuery(fusion=models.Fusion.RRF),
        query_filter=query_filter,
        limit=limit,
        with_vectors=False,
    )
    points = result.points
    return points


async def list_collections():
    """List collections"""
    return CLIENT.get_collections()


async def create_new_collection(collection_name: str, size: int):
    """Create new collection"""
    return CLIENT.create_collection(
        collection_name=collection_name,
        vectors_config={
            "text": models.VectorParams(size=size, distance=models.Distance.COSINE)
        },
        sparse_vectors_config={
            "text_sparse": models.SparseVectorParams(modifier=models.Modifier.IDF),
        },
    )


async def create_collection_if_not_exists(collection_name: str, size: int):
    """Create collection if not exists"""
    if not await exists_collection(collection_name):
        return await create_new_collection(collection_name, size)
    return None


async def exists_collection(collection_name: str) -> bool:
    """Check if collection exists"""
    collections = await list_collections()
    return collection_name in [c.name for c in collections.collections]


async def drop_collection(collection_name: str) -> bool:
    """Drop collection"""
    try:
        CLIENT.delete_collection(collection_name=collection_name)
        return True
    except Exception:
        return False
