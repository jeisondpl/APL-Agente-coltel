from langgraph.graph import END, START, StateGraph
from app.agents.state.state import DocxState
from pathlib import Path
from app.services.docx_service import process_docx_file
from app.schemas.file_schemas import ImageData


def extract_elements(state: DocxState):
    """Extract elements from a docx file."""
    extension = Path(state.filename).suffix.lower()
    full_text, images, tables, pages = process_docx_file(state.content, state.filename)
    images_data = [ImageData(name=image.name) for image in images]
    return {"extension": extension, "full_text": full_text, "images": images_data}


graph = StateGraph(DocxState)

graph.add_node("extract", extract_elements)

graph.add_edge(START, "extract")
graph.add_edge("extract", END)

docx_graph = graph.compile()
