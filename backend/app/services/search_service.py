import logging

from app.core.config import settings
from app.schemas.file_schemas import FileSummary
from app.services.qdrant_service import (
    hybrid_search,
    make_filter_by_chunk_types,
    make_filter_by_parent_file,
    make_filter_by_parent_file_and_chunk_types,
    drop_points_by_filter,
)

logger = logging.getLogger(__name__)


COLLECTION_NAME = settings.collection_name
LIMIT = settings.limit


def search_sources(query, collection_name: str = COLLECTION_NAME, limit: int = LIMIT):
    """Search relevant sources for a query using hybrid search"""
    search_filter = make_filter_by_chunk_types(["summary"])
    result = hybrid_search(
        query,
        search_filter,
        collection_name,
        limit=limit,
    )
    sources = []
    files = []
    for point in result:
        source = point.payload["parent_file"]
        summary = point.payload["text"]
        if source is not None and source not in sources:
            sources.append(source)
            files.append(FileSummary(title=source, summary=summary))
    return files


def search_in_sources(query, sources, collection_name: str = COLLECTION_NAME):
    """Search in specific sources for a query using hybrid search"""
    search_filter = make_filter_by_parent_file(sources)
    result = hybrid_search(query, search_filter, collection_name)
    return result


def search_images(query, sources, collection_name: str = COLLECTION_NAME):
    """Search images in specific sources for a query using hybrid search"""
    search_filter = make_filter_by_parent_file_and_chunk_types(sources, ["image"])
    result = hybrid_search(query, search_filter, collection_name)
    return result


def remove_pbi(collection_name: str = COLLECTION_NAME):
    point_filter = make_filter_by_chunk_types(["pbi"])
    result = drop_points_by_filter(collection_name, point_filter)
    return result


def find_pbi(query, limit, collection_name: str = COLLECTION_NAME):
    point_filter = make_filter_by_chunk_types(["pbi"])
    result = hybrid_search(query, point_filter, collection_name, limit=limit)
    return result
