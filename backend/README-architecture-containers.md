# Arquitectura Cloud Agnóstica Simplificada

## 1. Descripción General

La solución corresponde a una aplicación web en arquitectura de tres capas compuesta por:

* Frontend web
* Backend API
* Persistencia de datos

La solución incorpora además:

* Procesamiento asíncrono de archivos
* Base de datos vectorial
* Almacenamiento de objetos
* Integración con servicios de IA generativa

La arquitectura es agnóstica al proveedor cloud y basada en contenedores y servicios administrados.

---

# 2. Componentes de Arquitectura

# 2.1 Frontend

## Tecnología

* React
* Next.js

## Responsabilidad

* Interfaz de usuario
* Consumo de APIs REST
* Gestión de autenticación
* Carga y descarga de archivos

## Despliegue

* Contenedor OCI
* Servicio web escalable horizontalmente

## Exposición

* Acceso público HTTPS

---

# 2.2 Backend API

## Tecnología

* Python
* FastAPI

## Responsabilidad

* Exposición de APIs REST
* Lógica de negocio
* Integración con OpenAI
* Gestión de archivos
* Publicación de tareas asíncronas
* Acceso a PostgreSQL y Qdrant

## Despliegue

* Contenedores OCI
* Servicio escalable horizontalmente

## Red

* Subred privada
* Acceso únicamente desde el balanceador/API Gateway

---

# 2.3 PostgreSQL

## Tecnología

* PostgreSQL administrado

## Responsabilidad

* Persistencia relacional de la aplicación

## Red

* Subred privada
* Acceso restringido al backend y workers

---

# 2.4 Qdrant

## Tecnología

* Qdrant en contenedores

## Responsabilidad

* Almacenamiento y búsqueda de embeddings

## Red

* Subred privada
* Acceso restringido al backend y workers

---

# 2.5 Blob Storage

## Tecnología

* Servicio administrado de almacenamiento de objetos

## Responsabilidad

* Almacenamiento de archivos
* Archivos procesados
* Documentos para embeddings

## Acceso

* Backend
* Workers
* Frontend mediante URLs temporales firmadas

---

# 2.6 RabbitMQ

## Tecnología

* RabbitMQ en contenedores

## Responsabilidad

* Broker de mensajería para procesamiento asíncrono

## Integración

* Productor: FastAPI
* Consumidor: Celery Workers

## Red

* Subred privada

---

# 2.7 Redis

## Tecnología

* Redis administrado

## Responsabilidad

* Backend temporal de Celery
* Caché temporal

## Red

* Subred privada

---

# 2.8 Celery Workers

## Tecnología

* Python Celery
* Contenedores OCI

## Responsabilidad

* Procesamiento asíncrono de archivos
* Generación de embeddings
* Procesamiento IA
* Indexación en Qdrant

## Integraciones

* RabbitMQ
* Redis
* Blob Storage
* PostgreSQL
* Qdrant
* OpenAI

## Red

* Subred privada

---

# 2.9 Servicio de Autenticación

## Responsabilidad

* Autenticación de usuarios
* Emisión y validación de tokens JWT
* OAuth2/OpenID Connect

## Integración

* Frontend
* Backend

---

# 2.10 Integración OpenAI

## Tecnología

* SDK OpenAI para Python

## Servicios utilizados

* Modelos GPT
* Modelos de embeddings

## Integración

* Backend FastAPI
* Celery Workers

## Conectividad

* Salida HTTPS a internet

---

# 3. Arquitectura de Red

# 3.1 Subred Pública

Contiene:

* Load Balancer o API Gateway
* Frontend

---

# 3.2 Subred Privada de Aplicación

Contiene:

* FastAPI
* Celery Workers
* RabbitMQ
* Qdrant

---

# 3.3 Subred Privada de Datos

Contiene:

* PostgreSQL
* Redis

---

# 4. Flujo Principal

## Flujo Web

Usuario → HTTPS → Load Balancer/API Gateway → Frontend

## Consumo API

Frontend → HTTPS REST → Backend FastAPI

## Persistencia

Backend → PostgreSQL

## Procesamiento Asíncrono

Backend → RabbitMQ → Celery Workers

## Procesamiento IA

Celery/Backend → OpenAI APIs

## Flujo Vectorial

Celery/Backend → Qdrant

## Archivos

Frontend/Backend → Blob Storage

---

# 5. Seguridad Básica

## Requerimientos

* HTTPS obligatorio
* JWT para autenticación
* Componentes internos en subred privada
* Secrets almacenados de forma segura
* Cifrado en tránsito

---

# 6. Componentes del Diagrama

## Públicos

* Usuarios
* Load Balancer / API Gateway
* Frontend

## Privados

* FastAPI
* Celery Workers
* RabbitMQ
* Qdrant
* PostgreSQL
* Redis

## Servicios administrados

* Blob Storage
* PostgreSQL
* Redis

## Servicios externos

* OpenAI
* Proveedor de autenticación (OAuth2/OIDC)
