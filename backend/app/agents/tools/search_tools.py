from pathlib import Path
from typing import Any, Callable, List

from app.services.search_service import (
    find_pbi,
    search_images,
    search_in_sources,
    search_sources,
)
from app.services.storage_service import generate_download_url


def discover_sources(question: str) -> dict:
    """
    Discover relevant sources using semantic retrieval.
    This function performs a semantic search over indexed source summaries and returns the most relevant source summaries for the given question.

    Args:
        question (str): The natural language question to search for.

    Returns:
        dict: A dictionary with key "sources" containing a list of FileSummary objects for the best matching source documents.
    """
    sources = search_sources(question, limit=3)
    dict_sources = [source.model_dump() for source in sources]
    return {"sources": dict_sources}


def search_relevant_chunks(question: str, titles: List[str]) -> dict:
    """
    Run a semantic search inside a set of discovered sources.
    This function performs a semantic query against the indexed chunks for the provided source titles and returns the top matching chunks.

    Args:
        question (str): The natural language question to search for.
        titles (List[str]): The source titles to constrain the search to.

    Returns:
        dict: A dictionary with key "points" containing a list of semantic search result points, each representing a relevant document chunk.
    """
    result = search_in_sources(question, titles)
    dict_result = [point.model_dump() for point in result]
    return {"points": dict_result}


def retrieve_images(question: str, titles: List[str]) -> dict:
    """
    Retrieve images using semantic search over indexed image chunks.
    This function finds image-related chunks that are semantically relevant to the question within the specified sources and returns downloadable image blocks.

    Args:
        question (str): The natural language question to search for.
        titles (List[str]): The source titles to constrain the search to.

    Returns:
        dict: A dictionary with key "images" containing a list of ImageBlock objects for semantically relevant images.
    """
    images_result = search_images(question, titles)
    images_paths = []
    for point in images_result:
        if point.payload["chunk_type"] != "image":
            continue
        source_file = point.payload.get("parent_file")
        path = str(Path(source_file).stem)
        image_file = point.payload.get("image_file")
        if image_file:
            image_path = f"{path}/images/{image_file}"
            images_paths.append(image_path)
    images = []
    for image_path in images_paths:
        url = generate_download_url(image_path)
        images.append({"type": "image", "url": url})
    return {"images": images}


def retrieve_pbis(question: str):
    """
    Recupera los PBIs más relevantes para una pregunta.

    Esta función usa una búsqueda híbrida (semántica + BM25) sobre la base de datos vectorial
    para identificar los registros de PBI que mejor se relacionan con la consulta.
    Devuelve los resultados en formato serializado listos para la capa de API.

    Args:
        question (str): La pregunta o consulta natural para la búsqueda de PBIs.

    Returns:
        dict: Diccionario con clave "pbis" que contiene la lista de PBIs más relevantes.
    """
    pbis = find_pbi(question, limit=3)
    dict_pbis = [pbi.model_dump() for pbi in pbis]
    return {"pbis": dict_pbis}


TOOLS: List[Callable[..., Any]] = [
    discover_sources,
    search_relevant_chunks,
    retrieve_images,
    retrieve_pbis,
]
