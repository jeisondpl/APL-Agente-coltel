import numpy as np
import logging

from app.core.config import settings
from app.services.openai_embeddings import embed_texts
from app.services.recursive_splitter import split_text_recursive

logger = logging.getLogger(__name__)

DEFAULT_CHUNK_SIZE = settings.default_chunk_size
MAX_CHUNK_LENGTH = settings.max_chunk_size
SIMILARITY_THRESHOLD = settings.similarity_threshold


def get_similarity(a, b):
    """Calculate similarity between two vectors."""
    a = np.array(a, dtype=float)
    b = np.array(b, dtype=float)
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))


def split_text_semantic(
    text,
    split_size=DEFAULT_CHUNK_SIZE,
    threshold=SIMILARITY_THRESHOLD,
    max_length=MAX_CHUNK_LENGTH,
) -> list[str]:
    """Join documents based on similarity"""
    split_overlap = 0
    fragments = split_text_recursive(text, split_size, split_overlap)
    vectors = embed_texts(fragments)

    splits = []
    current_split = fragments[0]
    current_length = len(current_split)

    for i in range(1, len(fragments)):
        similarity = get_similarity(vectors[i - 1], vectors[i])
        doc_length = len(fragments[i])

        # Separar si la similitud es baja o si excede límite de longitud
        if similarity < threshold or current_length + doc_length > max_length:
            splits.append(current_split)
            current_split = fragments[i]
            current_length = doc_length
        else:
            current_split += fragments[i]
            current_length += doc_length

    splits.append(current_split)
    logger.warning(f"Splits after semantic grouping: {len(splits)}")
    for i, split in enumerate(splits):
        logger.warning(f"Split {i} - Length: {len(split)}")
    return splits
