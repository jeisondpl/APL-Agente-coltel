# Coltel Agent - Copilot Instructions

## Project Overview
**Coltel Agent** is a FastAPI-based document processing service that extracts structured content (text, tables) from PDFs and DOCX files using the Docling library and python-docx. The service containerizes and exposes processing capabilities via REST APIs.

## Architecture

### Core Components
- **FastAPI Application** (`app/main.py`): FastAPI instance that mounts API routers
- **Document Helpers** (`app/helpers/`):
  - `pdf_helper.py`: Converts PDFs to DoclingDocument objects, extracts text/tables to markdown
  - `docx_helper.py`: Extracts text fragments and tables from DOCX files, respecting 1000-char fragment limits
- **API Routers** (`app/api/routers/`): Modular endpoint definitions (currently `hello.py`)
- **Configuration** (`app/config/`): Environment and SSL certificate setup

### Data Flow
1. Client uploads file (PDF/DOCX) via API endpoint
2. Helper module reads bytes and converts to intermediate format (DoclingDocument or Document object)
3. Content extraction functions convert tables to dicts and text to markdown
4. Response returned as JSON

### Key Design Decisions
- **Fragment-based extraction for DOCX**: Text is chunked into ~1000-char segments with table boundaries respected (see `docx_helper.py` lines 25-40)
- **Docling for PDFs**: Uses `DocumentConverter` for robust PDF parsing with native table-to-dataframe support
- **Markdown output**: Extracted content exported as markdown for downstream LLM/agent compatibility
- **Docker containerization**: Python 3.12-slim with system deps (gcc, libgl1) for OpenCV/Docling

## Developer Workflows

### Local Development
```bash
# Setup environment
python -m venv env
env\Scripts\activate
pip install -r requirements-dev.txt

# Format & lint code
black app/ tests/
isort app/ tests/
flake8 app/ tests/

# Run tests
pytest  # Uses pythonpath=. from pytest.ini

# Run API server locally
uvicorn app.main:app --reload --host 0.0.0.0 --port 8081
```

### Docker Workflow
```bash
# Build and run with compose
docker-compose up --build

# Service runs on port 8081 with hot-reload volume mount
```

### Testing
- Test files in `tests/unit/` import helpers directly
- Test files in `tests/files/` contain SOP PDFs/DOCX for integration testing
- SSL verification disabled in tests (`ssl._create_unverified_context`) - remove for production
- Use `pytest-asyncio` for async endpoint testing

## Code Conventions

### Formatting & Linting
- **Black**: 88-char line length, target Python 3.11-3.13
- **isort**: Black-compatible profile, skip env/venv directories
- **flake8**: Ignores E203, E501 (Black-controlled), W503 (binary operator breaks)
- **pyproject.toml**: Single source of truth for tool config

### Import Organization
- Docling ecosystem: `from docling.document_converter import DocumentConverter`, `from docling_core.types.doc.document import DoclingDocument`
- FastAPI patterns: `from fastapi import FastAPI, APIRouter`
- File I/O: Use `BytesIO` for in-memory file handling (see `pdf_helper.py`, `docx_helper.py`)

### Function Patterns
- **Converter functions**: Take bytes, return parsed objects (`convert()`, `extract_fragments()`)
- **Extraction functions**: Take document objects, return dicts/strings (`extract_tables_to_dicts()`, `extract_full_text()`)
- **Utility functions**: Handle transformations (`table_to_dict()`, `table_to_markdown()`, `convert_keys_to_str()`)

## Integration Points

### External Dependencies
- **Docling** (≥2.70.0): PDF parsing + table extraction with Markdown export
- **python-docx** (==1.2.0): DOCX table/paragraph introspection and style detection
- **FastAPI** (==0.128.0): Web framework with async support
- **uvicorn** (==0.40.0): ASGI server with `--proxy-headers` for reverse proxy support
- **pandas**: Table export/manipulation (indirect via Docling)

### Environment Configuration
- `.env` file loaded by Docker (see `docker-compose.yml`)
- SSL certificate bundle configured in `app/config/config.py` for HTTPS requests
- `PYTHONPATH` set to `/app/app` in Docker for relative imports

### API Router Pattern
New endpoints added via `APIRouter` in `app/api/routers/`, then included in `app/main.py`:
```python
from app.api.routers import new_router
app.include_router(new_router.router)
```

## Common Tasks

### Adding a New Document Processing Endpoint
1. Create helper function in `app/helpers/` (follow converter→extractor pattern)
2. Create router in `app/api/routers/` using `APIRouter()` and `@router.post()`
3. Include router in `app/main.py` with `app.include_router()`
4. Add integration test in `tests/unit/` using test files from `tests/files/`

### Modifying Fragment Logic
- DOCX fragmentation logic: `docx_helper.py` lines 25-40
- Current limit: 1000 chars per fragment with table boundary respect
- Modify `len(current) + len(md_table) + 2 <= 1000` condition to adjust threshold

### Debugging Document Parsing
- Use `DoclingDocument.export_to_markdown()` for text inspection
- Use `document.tables` for table access (already converted to dicts via pandas)
- Check `para_obj.style.name` for paragraph style detection (Heading1, Heading2, etc.)
