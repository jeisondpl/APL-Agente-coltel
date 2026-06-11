from services.recursive_splitter import split_text_recursive
from services.semantic_splitter import split_text_semantic


def split_text(text, split_size, split_overlap, strategy):
    """Split text using different strategies"""
    if strategy == "recursive":
        return split_text_recursive(text)
    elif strategy == "semantic":
        return split_text_semantic(text)
    else:
        raise ValueError(f"Unknown split strategy: {strategy}")
