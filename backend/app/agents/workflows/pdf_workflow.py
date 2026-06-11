import logging
from pathlib import Path

from langgraph.graph import END, START, StateGraph

from app.agents.state.state import PdfState
from app.schemas.file_schemas import ImageData
from app.services.docling_service import process_pdf_file

logger = logging.getLogger(__name__)


def extract_elements(state: PdfState):
    """Extract elements from a pdf file."""
    extension = Path(state.filename).suffix.lower()
    full_text, images, tables, pages = process_pdf_file(state.content, state.filename)
    images_data = [ImageData(name=image.name) for image in images]
    return {"extension": extension, "full_text": full_text, "images": images_data}


graph = StateGraph(PdfState)

graph.add_node("extract", extract_elements)

graph.add_edge(START, "extract")
graph.add_edge("extract", END)

pdf_graph = graph.compile()
