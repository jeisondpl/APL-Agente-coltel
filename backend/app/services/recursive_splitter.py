import logging

from langchain_text_splitters import RecursiveCharacterTextSplitter

from app.core.config import settings

logger = logging.getLogger(__name__)
DEFAULT_CHUNK_SIZE = settings.default_chunk_size
DEFAULT_OVERLAP = settings.default_chunk_overlap


def split_text_recursive(
    text, split_size=DEFAULT_CHUNK_SIZE, split_overlap=DEFAULT_OVERLAP
) -> list[str]:
    """Split text using recursive splitter"""
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=split_size,
        chunk_overlap=split_overlap,
        separators=[
            "\n\n",
            "\n",
            " ",
            ".",
            ",",
            "\u200b",  # Zero-width space
            "\uff0c",  # Fullwidth comma
            "\u3001",  # Ideographic comma
            "\uff0e",  # Fullwidth full stop
            "\u3002",  # Ideographic full stop
            "",
        ],
    )
    splits = text_splitter.create_documents([text])
    for split in splits:
        chunk = split.page_content.replace("\n", " ")
        split.page_content = chunk
    texts = [split.page_content for split in splits]
    logger.warning(f"Splits after recursive splitting: {len(texts)}")
    for i, split in enumerate(texts):
        logger.warning(f"Split {i} - Length: {len(split)}")
    return texts
