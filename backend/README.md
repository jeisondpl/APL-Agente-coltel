# Coltel Agent

## Introducción

Coltel Agent es un servicio de procesamiento de documentos y agente conversacional basado en FastAPI. Está diseñado para extraer texto, tablas e imágenes de archivos PDF y DOCX, enriquecerlos con workflows de LangGraph y exponerlos mediante una API REST.

## Alcance

Impulsar la eficiencia en la atención de incidentes de los clientes de COLTEL, mediante un asistente con Inteligencia Artificial que atiende las consultas del equipo de soporte y genera respuestas en lenguaje natural a partir de la información contenida en la documentación técnica, manuales e instructivos de los diferentes procesos del área y registro histórico de resolución de tickets.

## Objetivos

* Reducir el Tiempo Medio de Resolución (MTTR): Agilizar la respuesta técnica.​

* ​Estandarizar Soporte: Garantizar que las soluciones sigan los protocolos técnicos oficiales.​

* ​Gestión del Conocimiento: Centralizar el aprendizaje de incidentes pasados en una herramienta consultable 24/7.​

* Reducir los costos de personal para atender el servicio de soporte a partir de la eficiencia operativa lograda con el agente, en un 30%.

## Arquitectura

La aplicación está organizada en capas:

- `app/main.py`: instancia la aplicación FastAPI, configura CORS y monta los routers.
- `app/api/routers/`: define los endpoints REST para archivos, consultas, autenticación, usuarios, hilos, mensajes y almacenamiento.
- `app/helpers/` y `app/services/`: manejan la lógica de procesamiento de documentos y servicios de soporte.
- `app/agents/`: contiene los workflows de LangGraph, agentes, estados y herramientas.
- `app/db/`, `app/crud/` y `app/models/`: gestionan persistencia, ORM y lógica de datos.
- `app/output/`: carpeta local donde se guardan archivos generados y procesados.

### Flujo de datos

1. El cliente envía un archivo o una consulta a la API.
2. El servicio determina si es PDF o DOCX y enruta el procesamiento.
3. Los workflows de LangGraph ejecutan pasos de extracción, resumen, chunking y almacenamiento.
4. El resultado se guarda en `app/output/` y/o se indexa en Qdrant.
5. Las consultas se responden mediante consultas sobre vectores, agentes y búsqueda de fuentes.

## Workflows de LangGraph

La aplicación usa LangGraph para orquestar procesos complejos mediante grafos de estados.

- `app/agents/workflows/file_workflow.py`: enruta archivos a los workflows `pdf_graph` o `docx_graph`, luego clasifica imágenes, describe figuras, resume texto, genera chunks, crea embeddings y guarda datos en el vector store.
- `app/agents/workflows/pdf_workflow.py`: workflow específico para PDF que extrae texto, imágenes y tablas usando `docling_service`.
- `app/agents/workflows/docx_workflow.py`: workflow específico para DOCX que extrae texto e imágenes usando `docx_service`.
- `app/agents/workflows/assistance_workflow.py`: maneja el flujo de agente conversacional para respuestas asistidas.

## Alcance del agente de soporte

Este agente está diseñado para apoyar a los analistas de soporte N1 y Oncall del contrato 24TE20 de Telefónica Colombia. Su alcance es:

- Brindar asesoría interna basada en documentos de referencia y workarounds disponibles,
- Apoyar en la atención, clasificación y diagnóstico inicial de incidentes,
- Sugerir posibles soluciones y rutas de escalamiento cuando los casos no se resuelven al primer contacto,
- Ayudar en el manejo de incidencias masivas y el cumplimiento de tiempos de respuesta corporativos,
- Mantener un enfoque profesional y operativo, sin tomar decisiones finales ni reemplazar al analista humano.

El agente utiliza información recuperada de documentos vectorizados para fundamentar sus respuestas y facilitar que los analistas tomen decisiones más rápidas y consistentes.

## Utilidades de procesamiento de documentos

### `docling_service`

Ubicado en `app/services/docling_service.py`, este módulo procesa PDFs con Docling:

- convierte PDF a documento Docling
- extrae texto como Markdown
- genera imágenes de páginas, tablas y figuras
- guarda resultados en `app/output/<nombre>`
- soporta chunking híbrido con `HybridChunker`

### `docx_service`

Ubicado en `app/services/docx_service.py`, este módulo procesa DOCX con `python-docx`:

- convierte tablas a Markdown
- extrae fragmentos de texto en bloques de hasta ~1000 caracteres
- detecta estilos de encabezado para convertirlos a Markdown
- extrae imágenes embebidas del DOCX
- guarda los resultados en `app/output/<nombre>`

## Tecnologías utilizadas

- *Python 3.12:* lenguaje principal del proyecto y entorno en el que se ejecuta el servicio.
- *FastAPI:* framework web usado para definir endpoints REST y manejar peticiones HTTP.
- *Uvicorn:* servidor ASGI que despliega la aplicación FastAPI en producción y desarrollo.
- *Celery:* motor de tareas asincrónicas para procesar archivos o trabajos en segundo plano.
- *Podman / Podman Compose:* herramientas de contenedores para construir y orquestar los servicios del proyecto.
- *Docling:* librería de extracción de contenido de PDF, incluyendo texto y tablas.
- *python-docx:* librería para leer y extraer datos de documentos DOCX.
- *LangGraph:* orquesta workflows de agente conversacional mediante grafos de estados.
- *LangChain:* gestiona cadenas de prompts, embeddings y recuperación contextual.
- *Qdrant:* almacén de vectores para indexar y buscar embeddings de documentos.
- *Redis:* broker y cache usado para Celery y otros servicios de mensajería.
- *SQLAlchemy:* ORM que gestiona la conexión y las operaciones con la base de datos.
- *Pydantic:* valida y serializa los datos de entrada y salida de la API.
- *Pandas:* ayuda en la manipulación de datos tabulares extraídos de documentos.

## Estructura del proyecto

```text
📦 raiz_del_proyecto/
├── app/
│   ├── celery_tasks/      # Tareas asincrónicas (ej. con Celery)
│   ├── config/            # Configuración general del proyecto
│   ├── api/
│   │   └── routers/       # Definición de endpoints de la API
│   ├── agents/            # Workflows, agentes, prompts y estados
│   ├── helpers/           # Utilidades de extracción de documentos
│   ├── db/                # Conexión y operaciones con base de datos
│   ├── crud/              # Operaciones CRUD y lógica de persistencia
│   ├── models/            # Modelos de datos (ORM y Pydantic)
│   ├── schemas/           # Esquemas Pydantic para validación
│   ├── services/          # Servicios auxiliares y utilitarios
│   └── output/            # Resultados y archivos procesados
├── docker-compose.yml     # Definición de servicios de contenedores
├── Dockerfile             # Imagen de contenedor de la aplicación
├── requirements.txt       # Dependencias del proyecto
├── requirements-dev.txt   # Dependencias de desarrollo
└── pytest.ini             # Configuración de pruebas
```

## Guía de instalación

### Requisitos previos

- Podman instalado
- Podman Compose disponible (`podman compose`)
- Python 3.12 para desarrollo local
- Archivo `.env` con variables de entorno necesarias


### Variables de ambiente
En el archivo .env se deben especificar los valores de las variables de ambiente. A continuación se presentan valores de referencia. Las credenciales para usar los modelos gpt deben generarse en la plataforma web de OpenAI.

```
# General
APP_ORIGIN=
SECRET_KEY=

# OpenAI
OPENAI_API_KEY=
OPENAI_LLM_NAME=gpt-5-mini

# Inference Config
TEMPERATURE=0.0
TOKENS=

# Postgres
POSTGRES_USER=
POSTGRES_PASSWORD=
POSTGRES_HOST=
POSTGRES_DB=coltel
POSTGRES_PORT=5432

# Embeddings
EMBEDDINGS_PROVIDER=openai
VECTOR_DIMENSION=1536
URL_EMBEDDINGS=

# Qdrant
URL_QDRANT=
COLLECTION_NAME=coltel-docs
DENSE_MODEL=sentence-transformers/all-MiniLM-L6-v2
SPARSE_MODEL=Qdrant/bm25
DENSE_PREFETCH_LIMIT=50
SPARSE_PREFETCH_LIMIT=50
LIMIT=20
RERANK_LIMIT=5

# MinIO
MINIO_ENDPOINT=
MINIO_EXTERNAL_ENDPOINT=
MINIO_ACCESS_KEY=
MINIO_SECRET_KEY=
BUCKET_NAME=coltel-docs

# RAG
CHUNK_STRATEGY=semantic
DEFAULT_CHUNK_SIZE=400
MAX_CHUNK_SIZE=2000
DEFAULT_CHUNK_OVERLAP=0
SIMILARITY_THRESHOLD=0.55

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_DB=0

# Rabbit
RABBITMQ_DEFAULT_USER=
RABBITMQ_DEFAULT_PASS=
RABBITMQ_HOST=
RABBITMQ_PORT=5672
RABBITMQ_VHOST=/
```

### Ejecución con Podman Compose

En la raíz del proyecto:

```powershell
podman compose -f docker-compose.yml up --build
```

Esto levantará los servicios principales:

- `qdrant`
- `redis`
- `coltel-prod-agent`
- `worker`

Si es necesario detenerlos:

```powershell
podman compose -f docker-compose.yml down
```

## Uso de la API

La API principal se expone con prefijo `/api` y además incluye un endpoint de salud en `/health`.

### Endpoints principales

- `GET /health`
  - Comprueba que el servicio esté activo.

- `POST /api/admin/files/`
  - Carga un archivo (PDF o DOCX) para procesarlo y enviarlo al vector store.
  - Requiere autenticación de administrador.

- `DELETE /api/admin/files/?filename=<nombre>`
  - Elimina una fuente del vector store y del almacenamiento.

- `GET /api/admin/files/`
  - Lista archivos indexados en el vector store.

- `POST /api/admin/files/async`
  - Carga un archivo de forma asíncrona.

- `GET /api/admin/files/async?task_id=<id>`
  - Consulta el estado de una tarea asíncrona de procesamiento.

- `POST /api/queries/search`
  - Busca documentos relevantes para una pregunta.

- `POST /api/queries/images`
  - Recupera imágenes relevantes de fuentes asociadas a una consulta.

- `POST /api/queries/query`
  - Responde preguntas con información relevante y fuentes.

- `POST /api/queries/agent`
  - Ejecuta el flujo de agente conversacional asistido.

- `POST /api/queries/chat`
  - Endpoint de chat en desarrollo / placeholder.

- `POST /api/queries/titles`
  - Descubre fuentes relevantes para una pregunta.

### Autenticación y usuarios

- `POST /api/auth/token`
  - Genera token de acceso para autenticación.

- `GET /api/users/`
  - Lista usuarios.

- `POST /api/users/`
  - Crea nuevos usuarios.

- `GET /api/me/`
  - Consulta información del usuario autenticado y sus hilos.

- `GET /api/threads/`
  - Lista hilos por usuario.

- `GET /api/messages/`
  - Lista mensajes de un hilo.


