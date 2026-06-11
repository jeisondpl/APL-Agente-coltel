import base64
import logging

from services.llm import load_model

logger = logging.getLogger(__name__)


IMAGE_PROMPT = (
    "Analiza la imagen y con base en su contenido retorna: un título sugerido 'title', "
    "una descripción breve 'caption' y una descripción detallada 'description'."
    "'title' debe ser un string sin espacios, en lugar de espacios utiliza guiones, "
    "ej. 'forest-landscape'. 'caption' debe ser una única frase que describa el "
    "contenido de la imagen. 'description' debe ser una descripción detallada de la "
    "imagen. Todos los campos deben estar en español."
)

BASIC_PROMPT = "Describe brevemente el contenido de la imagen, en español."

CLASSIFY_PROMPT = (
    "Analiza la imagen y con base en su contenido clasifícala en una de las siguientes "
    "categorías: 'diagram', 'code', 'user interface', 'logo', 'photo', 'other'. "
    "La categoría 'diagram' se refiere a diagramas de arquitectura u otros tipos "
    "de diagramas de diseño de software. "
    "La categoría 'code' se refiere a código fuente de software. "
    "La categoría 'user interface' se refiere a interfaces de usuario de aplicaciones "
    "o sitios web. "
    "La categoría 'logo' se refiere a logotipos de empresas, marcas o productos. "
    "La categoría 'photo' se refiere a fotos de personas, lugares u objetos reales. "
    "La categoría 'other' se refiere a cualquier imagen que no encaje en las "
    "categorías anteriores, como gráficos o ilustraciones. "
    "Retorna solo el nombre de la categoría sin ningún texto adicional."
)


llm = load_model()


def encode_image(path):
    """Encode an image to Base64."""
    with open(path, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")


def build_message_from_base64(base64_string: str, prompt: str = IMAGE_PROMPT) -> dict:
    """Build a message dictionary for describing an image from a Base64 string."""
    return {
        "role": "user",
        "content": [
            {
                "type": "text",
                "text": prompt,
            },
            {
                "type": "image_url",
                "image_url": {"url": f"data:image/jpeg;base64,{base64_string}"},
            },
        ],
    }


def analyze_image(base64_string: str, prompt: str = BASIC_PROMPT) -> dict:
    """Analyze an image from a Base64 string using the LLM."""
    message = build_message_from_base64(base64_string, prompt)
    response = llm.invoke([message])
    return response.content


def classify_image(base64_string: str, prompt: str = CLASSIFY_PROMPT) -> str:
    """Classify an image from a Base64 string using the LLM."""
    return analyze_image(base64_string, prompt)
