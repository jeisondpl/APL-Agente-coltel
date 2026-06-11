import logging
import os
import uuid
from pathlib import Path

from langgraph.graph import END, START, StateGraph

from app.agents.agents.summarizer import summarizer
from app.agents.state.state import FileState
from app.agents.workflows.docx_workflow import docx_graph
from app.agents.workflows.pdf_workflow import pdf_graph
from app.core.config import settings
from app.schemas.file_schemas import ChunkData, PointData
from app.services.image_service import analyze_image, classify_image, encode_image
from app.services.openai_embeddings import embed_texts
from app.services.qdrant_service import upsert_points
from app.services.recursive_splitter import split_text_recursive
from app.services.semantic_splitter import split_text_semantic
from app.services.storage_service import get_object_stream, upload_folder_to_storage

logger = logging.getLogger(__name__)

MAX_CHUNK_LENGTH = settings.max_chunk_size
DEFAULT_SPLIT_SIZE = settings.default_chunk_size
DEFAULT_SPLIT_OVERLAP = settings.default_chunk_overlap
SIMILARITY_THRESHOLD = settings.similarity_threshold
CHUNK_STRATEGY = settings.chunk_strategy


def save_file(state: FileState) -> FileState:
    """Save file to bucket"""
    filename = state.filename
    folder = filename
    file_object = get_object_stream(filename, folder)
    content = file_object.read()
    save_path = Path("app") / "output" / folder / filename
    save_path.parent.mkdir(parents=True, exist_ok=True)
    with open(save_path, "wb") as f:
        f.write(content)
    return {"content": content}


def route_format(state: FileState):
    """Route file to appropriate workflow"""
    extension = Path(state.filename).suffix.lower()
    route_to = ""
    if extension == ".docx":
        route_to = "process_docx"
    elif extension == ".pdf":
        route_to = "process_pdf"
    return route_to


def classify_images(state: FileState):
    """Call LLM to classify images"""
    filename = state.filename
    folder = filename
    output_dir = Path(f"app/output/{folder}/images")
    output_dir.mkdir(parents=True, exist_ok=True)
    images = state.images
    for image in images:
        path = str(f"app/output/{folder}/images/{image.name}")
        logger.critical(f"Classifying image {image.name} at path: {path}")
        image.image_type = classify_image(encode_image(path))
        logger.warning(f"Image {image.name} classified as: {image.image_type}")
    return {"images": images}


def describe_images(state: FileState):
    """Get description for diagrams, code and user interfaces"""
    filename = state.filename
    folder = filename
    output_dir = Path(f"app/output/{folder}/images")
    output_dir.mkdir(parents=True, exist_ok=True)
    images = state.images
    for image in images:
        if image.image_type in ["diagram", "code", "user interface"]:
            path = str(f"app/output/{folder}/images/{image.name}")
            image.description = analyze_image(encode_image(path))
        else:
            path = str(f"app/output/{folder}/images/{image.name}")
            if os.path.exists(path):
                os.remove(path)
                logger.warning(
                    f"Image {image.name} deleted - not in required categories"
                )
            continue
    return {"images": images}


def insert_image_descriptions(state: FileState):
    """Insert image descriptions into markdown file"""
    images = state.images
    name = state.filename
    file_path = Path(f"app/output/{name}/{name}-with-descriptions.md")
    content = file_path.read_text(encoding="utf-8")
    updated_content = content
    placeholder = "<!-- image -->"
    for image in images:
        if image.description is not None:
            description_text = f"(Imagen)\n[Descripción imagen: {image.description}]\n"
            updated_content = updated_content.replace(placeholder, description_text, 1)
        else:
            updated_content = updated_content.replace(placeholder, "", 1)
    file_path.write_text(updated_content, encoding="utf-8")
    return {"enriched_text": updated_content}


def summarize(state: FileState):
    """Summarize file"""
    file_summary = summarizer.invoke({"full_text": state.full_text})
    summary = file_summary.summary
    return {"summary": summary}


def generate_chunks(state: FileState):
    """Generate chunks from file"""
    text = state.full_text
    chunks = []
    if CHUNK_STRATEGY == "recursive":
        fragments = split_text_recursive(
            text, DEFAULT_SPLIT_SIZE, DEFAULT_SPLIT_OVERLAP
        )
    elif CHUNK_STRATEGY == "semantic":
        fragments = split_text_semantic(text, DEFAULT_SPLIT_SIZE, SIMILARITY_THRESHOLD)
    else:
        raise ValueError(f"Unknown split strategy: {CHUNK_STRATEGY}")
    for i, fragment in enumerate(fragments):
        chunk = ChunkData(
            text=fragment, chunk_type="chunk", order=i, parent_file=state.filename
        )
        chunks.append(chunk)
    summary_chunk = ChunkData(
        text=state.summary, chunk_type="summary", parent_file=state.filename
    )
    chunks.append(summary_chunk)
    for image in state.images:
        if image.description is not None:
            image_chunk = ChunkData(
                text=image.description,
                chunk_type="image",
                parent_file=state.filename,
                image_file=image.name,
            )
            chunks.append(image_chunk)
    return {"chunks": chunks}


def generate_embeddings(state: FileState) -> FileState:
    """Generate embeddings for chunks"""
    chunks = state.chunks
    texts = [chunk.text[:MAX_CHUNK_LENGTH] for chunk in chunks]
    vectors = embed_texts(texts)
    state.vectors = vectors
    return {"vectors": vectors}


async def save_to_vector_store(state: FileState) -> FileState:
    """Save embeddings to vector store"""
    points = []
    for chunk, vector in zip(state.chunks, state.vectors):
        payload = chunk.model_dump()
        points.append(PointData(id=str(uuid.uuid4()), vector=vector, payload=payload))
    n_points = await upsert_points(points)
    logger.info(f"Inserted {n_points} points")
    return {"points": points}


def save_files_to_storage(state: FileState):
    """Save files to bucket"""
    folder = state.filename
    output_path = Path(f"app/output/{folder}")
    upload_folder_to_storage(output_path, folder)


graph = StateGraph(FileState)

graph.add_node("save_file", save_file)
graph.add_node("process_pdf", pdf_graph)
graph.add_node("process_docx", docx_graph)
graph.add_node("classify", classify_images)
graph.add_node("describe", describe_images)
graph.add_node("summary", summarize)
graph.add_node("chunks", generate_chunks)
graph.add_node("embeddings", generate_embeddings)
graph.add_node("vectorstore", save_to_vector_store)
graph.add_node("storage", save_files_to_storage)


graph.add_edge(START, "save_file")
graph.add_conditional_edges("save_file", route_format)
graph.add_edge("process_pdf", "classify")
graph.add_edge("process_docx", "classify")
graph.add_edge("classify", "describe")
graph.add_edge("describe", "summary")
graph.add_edge("summary", "chunks")
graph.add_edge("chunks", "embeddings")
graph.add_edge("embeddings", "vectorstore")
graph.add_edge("vectorstore", "storage")
graph.add_edge("storage", END)


file_graph = graph.compile()
