import logging
from io import BytesIO
from pathlib import Path

from docling.datamodel.base_models import DocumentStream, InputFormat
from docling.datamodel.pipeline_options import PdfPipelineOptions
from docling.document_converter import DocumentConverter, PdfFormatOption
from docling_core.types.doc import ImageRefMode, PictureItem, TableItem

logger = logging.getLogger(__name__)

IMAGE_RESOLUTION_SCALE = 2.0


pipeline_options = PdfPipelineOptions()
pipeline_options.images_scale = IMAGE_RESOLUTION_SCALE
pipeline_options.generate_page_images = True
pipeline_options.generate_picture_images = True

doc_converter = DocumentConverter(
    format_options={InputFormat.PDF: PdfFormatOption(pipeline_options=pipeline_options)}
)


def to_docling_document(file_content: bytes, filename: str):
    """Convert file to docling document."""
    buffer = BytesIO(file_content)
    source = DocumentStream(name=filename, stream=buffer)
    conv_res = doc_converter.convert(source)
    document = conv_res.document
    return document


def process_pdf_file(file_content: bytes, filename: str):
    """Process pdf file."""
    name = filename
    output_dir = Path(f"app/output/{name}")
    output_dir.mkdir(parents=True, exist_ok=True)
    (output_dir / "pages").mkdir(parents=True, exist_ok=True)
    (output_dir / "tables").mkdir(parents=True, exist_ok=True)
    (output_dir / "images").mkdir(parents=True, exist_ok=True)
    doc_filename = str(name)
    pages = []
    tables = []
    images = []

    document = to_docling_document(file_content, filename)

    # Save page images
    for page_no, page in document.pages.items():
        page_no = page.page_no
        page_image_filename = output_dir / f"pages/{doc_filename}-{page_no:03d}.png"
        pages.append(page_image_filename)
        logger.info(f"page_image_filename: {page_image_filename}")
        with page_image_filename.open("wb") as fp:
            page.image.pil_image.save(fp, format="PNG")

    # Save images of figures and tables
    table_counter = 0
    picture_counter = 0
    for element, _level in document.iterate_items():
        if isinstance(element, TableItem):
            table_counter += 1
            element_image_filename = (
                output_dir / f"tables/{doc_filename}-table-{table_counter:03d}.png"
            )
            tables.append(element_image_filename)
            logger.warning(f"element_table_filename: {element_image_filename}")
            with element_image_filename.open("wb") as fp:
                element.get_image(document).save(fp, "PNG")

        if isinstance(element, PictureItem):
            picture_counter += 1
            element_image_filename = (
                output_dir / f"images/{doc_filename}-picture-{picture_counter:03d}.png"
            )
            logger.info(f"element_image_filename: {element_image_filename}")
            images.append(element_image_filename)
            with element_image_filename.open("wb") as fp:
                element.get_image(document).save(fp, "PNG")

    # Save markdown with pictures descriptions
    md_filename = output_dir / f"{doc_filename}-with-descriptions.md"
    document.save_as_markdown(md_filename, image_mode=ImageRefMode.PLACEHOLDER)
    # _add_image_counters(md_filename)

    # Save markdown with embedded pictures
    md_filename = output_dir / f"{doc_filename}-with-images.md"
    document.save_as_markdown(md_filename, image_mode=ImageRefMode.EMBEDDED)

    text = document.export_to_markdown()
    return text, images, tables, pages


