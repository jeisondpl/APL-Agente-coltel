# APL Agente Coltel

Asistente IA para soporte técnico interno de Coltel — Millicom. Construido con Next.js 15, TypeScript y Tailwind CSS v4.

## Requisitos previos

- Node.js 18 o superior
- npm 9 o superior

Verifica tu versión:

```bash
node -v
npm -v
```

## Instalación y ejecución local

### 1. Clona el repositorio

```bash
git clone https://github.com/jeisondpl/APL-Agente-coltel.git
cd APL-Agente-coltel
```

### 2. Instala las dependencias

```bash
npm install
```

### 3. Configura las variables de entorno

Copia el archivo de ejemplo y edítalo:

```bash
cp .env.example .env.local
```

Abre `.env.local` y ajusta los valores:

```env
# URL del backend real (endpoint de consultas IA)
BACKEND_URL=https://tu-backend.com/query

# URL base del servidor de medios (imágenes)
NEXT_PUBLIC_MEDIA_BASE_URL=http://localhost:9000
```

> Si no tienes backend propio, el proyecto apunta por defecto a `https://lqbjk5bh-8081.use2.devtunnels.ms/query` (devtunnel de desarrollo, puede no estar disponible).

### 4. Inicia el servidor de desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Credenciales de acceso (usuarios de prueba)

| Usuario | Contraseña | Rol |
|---|---|---|
| `admin` | `tigo2024` | Administrador |
| `agente1` | `coltel123` | Agente Soporte |
| `supervisor` | `super456` | Supervisor N2 |

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo en `localhost:3000` |
| `npm run build` | Compilación para producción |
| `npm run start` | Servidor de producción (requiere build previo) |
| `npm run lint` | Análisis estático del código |

## Stack

- **Next.js 15** — App Router, Server Components, API Routes
- **TypeScript** — tipado estricto
- **Tailwind CSS v4** — estilos utilitarios
- **React Markdown** + **remark-gfm** — renderizado de Markdown en respuestas

## Estructura del proyecto

```
app/
  page.tsx                — Página principal (protegida, redirige a /login)
  layout.tsx              — Layout raíz con fuente Roboto
  globals.css             — Estilos globales y tokens Tigo/Millicom
  login/
    page.tsx              — Pantalla de login split-screen
  api/
    query/route.ts        — Proxy POST al backend IA

components/
  chat-shell.tsx          — Shell principal: header, estado, layout
  chat-message.tsx        — Burbujas de mensajes usuario/asistente
  chat-input.tsx          — Compositor de texto (Enter/Shift+Enter)
  answer-renderer.tsx     — Renderiza bloques text + image de la respuesta
  image-gallery.tsx       — Galería responsive con lightbox

lib/
  types.ts                — Tipos TypeScript (ChatMessage, ContentBlock, etc.)
  utils.ts                — Helpers (generateId, formatTime, cn)

public/
  img-pruebas/millicom/   — Assets de marca Tigo/Millicom
```

## Deploy en Vercel

```bash
# Vincular proyecto (solo la primera vez)
vercel link

# Agregar variable de entorno
echo "https://tu-backend.com/query" | vercel env add BACKEND_URL production

# Desplegar a producción
vercel --prod
```

URL de producción: [https://apl-agente-coltel.vercel.app](https://apl-agente-coltel.vercel.app)
