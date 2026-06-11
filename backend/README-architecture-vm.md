# Arquitectura Cloud Agnóstica Simplificada — Escenario con Máquina Virtual

## 1. Descripción General

La solución corresponde a una aplicación web en arquitectura de tres capas compuesta por:

* Frontend web
* Backend API
* Persistencia de datos

La solución incorpora:

* Procesamiento asíncrono de archivos
* Base de datos vectorial
* Almacenamiento de objetos
* Integración con IA generativa

En este escenario:

* FastAPI, Celery, Redis y Qdrant se ejecutan dentro de una máquina virtual.
* Redis cumple simultáneamente el rol de broker y backend de Celery.
* PostgreSQL y Blob Storage son servicios administrados por el proveedor cloud.

La arquitectura es independiente del proveedor cloud.

---

# 2. Componentes de Arquitectura

# 2.1 Frontend

## Tecnología

* React
* Next.js

## Responsabilidad

* Interfaz web
* Consumo de APIs REST
* Gestión de autenticación
* Carga y descarga de archivos

## Despliegue

* Servicio web o contenedor
* Acceso público HTTPS

---

# 2.2 API Backend

## Tecnología

* Python
* FastAPI

## Responsabilidad

* Exposición de APIs REST
* Lógica de negocio
* Integración con OpenAI
* Gestión de archivos
* Orquestación de procesamiento asíncrono
* Acceso a PostgreSQL y Qdrant

## Despliegue

* Ejecutándose dentro de una máquina virtual

## Red

* Subred privada
* Acceso únicamente desde el balanceador/API Gateway

---

# 2.3 Celery Workers

## Tecnología

* Python Celery

## Responsabilidad

* Procesamiento asíncrono de archivos
* Generación de embeddings
* Procesamiento IA
* Indexación vectorial

## Integraciones

* Redis
* PostgreSQL
* Blob Storage
* Qdrant
* OpenAI

## Despliegue

* Ejecutándose dentro de la misma máquina virtual

---

# 2.4 Redis

## Tecnología

* Redis

## Responsabilidad

* Broker de Celery
* Backend de resultados de Celery
* Caché temporal

## Despliegue

* Ejecutándose dentro de la misma máquina virtual

## Red

* Acceso local o privado únicamente

---

# 2.5 Qdrant

## Tecnología

* Qdrant

## Responsabilidad

* Almacenamiento y búsqueda de embeddings

## Despliegue

* Ejecutándose dentro de la misma máquina virtual

## Red

* Acceso privado únicamente

---

# 2.6 PostgreSQL

## Tecnología

* PostgreSQL administrado

## Responsabilidad

* Persistencia relacional de la aplicación

## Red

* Subred privada
* Acceso restringido a la máquina virtual

---

# 2.7 Blob Storage

## Tecnología

* Servicio administrado de almacenamiento de objetos

## Responsabilidad

* Almacenamiento de archivos
* Archivos procesados
* Documentos para embeddings

## Acceso

* Backend
* Celery Workers
* Frontend mediante URLs firmadas temporales

---

# 2.8 Servicio de Autenticación

## Responsabilidad

* Autenticación de usuarios
* Emisión y validación de JWT
* OAuth2/OpenID Connect

## Integración

* Frontend
* Backend

---

# 2.9 Integración OpenAI

## Tecnología

* SDK OpenAI para Python

## Servicios utilizados

* Modelos GPT
* Modelos de embeddings

## Integración

* FastAPI
* Celery Workers

## Conectividad

* Salida HTTPS a internet desde la máquina virtual

---

# 3. Máquina Virtual de Aplicación

La máquina virtual centraliza los siguientes componentes:

* FastAPI
* Celery Workers
* Redis
* Qdrant

## Responsabilidades

* Ejecución de servicios backend
* Procesamiento asíncrono
* Gestión de embeddings
* Comunicación con servicios administrados

## Requerimientos

* Persistencia local para Qdrant
* Acceso privado a PostgreSQL
* Acceso HTTPS saliente a OpenAI
* Recursos suficientes de CPU, memoria y disco para procesamiento IA y embeddings

---

# 4. Arquitectura de Red

# 4.1 Subred Pública

Contiene:

* Load Balancer o API Gateway
* Frontend

---

# 4.2 Subred Privada de Aplicación

Contiene:

* Máquina virtual con:

  * FastAPI
  * Celery
  * Redis
  * Qdrant

---

# 4.3 Subred Privada de Datos

Contiene:

* PostgreSQL administrado

---

# 5. Flujo Principal

## Flujo Web

Usuario → HTTPS → Load Balancer/API Gateway → Frontend

## Consumo API

Frontend → HTTPS REST → FastAPI

## Persistencia

FastAPI/Celery → PostgreSQL

## Procesamiento Asíncrono

FastAPI → Redis → Celery Workers

## Procesamiento IA

FastAPI/Celery → OpenAI APIs

## Flujo Vectorial

Celery/FastAPI → Qdrant

## Archivos

Frontend/FastAPI/Celery → Blob Storage

---

# 6. Seguridad Básica

## Requerimientos

* HTTPS obligatorio
* JWT para autenticación
* Máquina virtual en subred privada
* PostgreSQL sin exposición pública
* Secrets almacenados de forma segura
* Cifrado en tránsito

---

# 7. Componentes del Diagrama

## Públicos

* Usuarios
* Load Balancer / API Gateway
* Frontend

## Privados

* Máquina Virtual:

  * FastAPI
  * Celery Workers
  * Redis
  * Qdrant

## Servicios administrados

* PostgreSQL
* Blob Storage

## Servicios externos

* OpenAI
* Proveedor de autenticación OAuth2/OIDC

