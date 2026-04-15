# APL Agente Coltel

Aplicación de chat con IA construida con Next.js, TypeScript y Tailwind CSS.

## Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS v4
- React Markdown

## Instalación y uso

```bash
npm install
npm run dev
```

Luego abre [http://localhost:3000](http://localhost:3000).

## Estructura

```
app/
  page.tsx              — Página principal
  layout.tsx            — Layout raíz
  globals.css           — Estilos globales
  api/query/route.ts    — Endpoint POST simulado
components/
  chat-shell.tsx        — Shell principal del chat
  chat-message.tsx      — Burbujas de mensajes
  chat-input.tsx        — Compositor de texto
  answer-renderer.tsx   — Renderizador de respuestas
  image-gallery.tsx     — Galería de imágenes
lib/
  types.ts              — Tipos TypeScript
  utils.ts              — Utilidades
```
