import math
import unicodedata
import uuid
import logging
from langgraph.graph import END, START, StateGraph
from app.core.config import settings
from app.services.openai_embeddings import embed_texts
from app.agents.state.state import ExcelState
from app.services.pandas_service import (
    extract_data_from_xlsx,
    extract_data_to_dicts,
    extract_text_from_df,
    write_md_to_file,
)
from app.schemas.file_schemas import PointData
from app.services.qdrant_service import upsert_points
from app.services.search_service import remove_pbi
from app.services.storage_service import get_object_stream

logger = logging.getLogger(__name__)
MAX_CHUNK_LENGTH = settings.max_chunk_size


def extract_xlsx_to_df(state: ExcelState) -> dict:
    filename = state.filename
    folder = filename
    file_object = get_object_stream(filename, folder)
    content = file_object.read()
    df = extract_data_from_xlsx(content)
    return {"data": df, "content": content}


def extract_text(state: ExcelState) -> dict:
    df = state.data
    full_text = extract_text_from_df(df)
    return {"full_text": full_text}


def generate_md_file(state: ExcelState) -> dict:
    full_text = state.full_text
    filename = state.filename
    write_md_to_file(full_text, filename)
    return {}


def build_payloads(state: ExcelState) -> dict:
    df = state.data
    payloads = extract_data_to_dicts(df)
    normalized_payloads = []
    for payload in payloads:
        normalized_payload = {}
        cleaned_payload = {
            k: None if isinstance(v, float) and math.isnan(v) else v
            for k, v in payload.items()
        }
        payload.update(cleaned_payload)
        for k, v in payload.items():
            norm_k = unicodedata.normalize("NFKD", k)
            norm_k = "".join(c for c in norm_k if not unicodedata.combining(c))
            norm_key = norm_k.lower()
            normalized_payload[norm_key] = v
        text = ""
        if "pbi" in normalized_payload:
            text += f"pbi: {normalized_payload.get("pbi")}\n"
        if "descripcion" in normalized_payload:
            text += f"Descripción: {normalized_payload.get("descripcion")}\n"
        if "notas" in normalized_payload:
            text += f"Notas: {normalized_payload.get("notas")}\n"
        normalized_payload.update({"text": text, "chunk_type": "pbi"})    
        normalized_payloads.append(normalized_payload)
    return {"payloads": normalized_payloads}


def generate_embeddings(state: ExcelState) -> dict:
    """Generate embeddings for chunks"""
    texts = [payload["text"][:MAX_CHUNK_LENGTH] for payload in state.payloads]
    vectors = embed_texts(texts)
    state.vectors = vectors
    return {"vectors": vectors}


async def save_to_vector_store(state: ExcelState) -> dict:
    """Save embeddings to vector store"""
    removed = remove_pbi()
    points = []
    for payload, vector in zip(state.payloads, state.vectors):
        points.append(PointData(id=str(uuid.uuid4()), vector=vector, payload=payload))
    n_points = await upsert_points(points)
    logger.info(f"Inserted {n_points} points")
    return {"points": points}


graph = StateGraph(ExcelState)

graph.add_node("extract", extract_xlsx_to_df)
graph.add_node("to_text", extract_text)
graph.add_node("to_md_file", generate_md_file)
graph.add_node("to_payloads", build_payloads)
graph.add_node("embeddings", generate_embeddings)
graph.add_node("vectorstore", save_to_vector_store)

graph.add_edge(START, "extract")
graph.add_edge("extract", "to_text")
graph.add_edge("to_text", "to_md_file")
graph.add_edge("extract", "to_payloads")
graph.add_edge("to_payloads", "embeddings")
graph.add_edge("embeddings", "vectorstore")
graph.add_edge("vectorstore", END)
graph.add_edge("to_md_file", END)

pbi_graph = graph.compile()
