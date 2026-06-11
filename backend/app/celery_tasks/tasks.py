import asyncio
import logging
from pathlib import Path

from app.agents.workflows.file_workflow import file_graph
from app.agents.workflows.pbi_workflow import pbi_graph

from .worker import app

logger = logging.getLogger(__name__)


@app.task(name="app.celery_tasks.tasks.process_file_task")
def process_file_task(filename: str):
    """Task to process an uploaded file."""
    extension = Path(filename).suffix.lower()
    logger.warning(f"File extension: {extension}")
    if extension == ".pdf" or extension == ".docx":
        result = asyncio.run(file_graph.ainvoke({"filename": filename}))
    elif extension == ".xlsx":
        result = asyncio.run(pbi_graph.ainvoke({"filename": filename}))
    logger.info(f"Processing file: {filename}.")
