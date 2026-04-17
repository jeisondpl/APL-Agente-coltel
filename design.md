# Design System Template — Millicom / Tigo Portal

> Plantilla genérica extraída del portal **APL-IntAltamiraReactJSFront**.
> Replicar este documento como base para nuevos portales internos Tigo/Millicom.

---

## 1. Paleta de Colores

### Marca Principal

| Nombre | Hex | Uso |
|---|---|---|
| Tigo Blue (Primary) | `#001EB3` | Color principal de marca, botones contenidos, bordes de acento |
| Tigo Blue Dark (Secondary) | `#0D2A8A` | Botones login, gradientes oscuros |
| Section Blue | `#175379` | Encabezados de sección, títulos de módulo |
| Table Header Blue | `#006699` | Encabezados de tablas personalizadas |
| Tab Blue (Active) | `#1890ff` | Pestañas activas |

### Fondos y Neutros

| Nombre | Hex | Uso |
|---|---|---|
| Background Main | `#E5E5E5` | Fondo principal de la app |
| Background Body | `#efefef` | Fondo del `<body>` |
| Background Info | `#f2f2f2` | Fondos secundarios, info panels |
| Background Light | `#F5F5F5` | Fondos de tarjetas secundarias |
| Border Gray | `#d1d1d1` | Bordes generales |
| Border Light | `#E4E4E4` | Bordes de árbol/listas |
| Row Alternate | `#DEE0D6` | Filas alternadas en tablas |
| Selected List | `#f0f0f0` | Item seleccionado en lista |
| White | `#FFFFFF` | Fondos de componentes |

### Semánticos / Estado

| Nombre | Hex | Uso |
|---|---|---|
| Error Red | `#FF3333` | Estados de error |
| Error Toast | `#DC6161` | Mensajes de error tipo toast |
| Success Green | `#08753f` | Éxito, iconos Excel |
| Excel Green 1 | `#45B058` | Acento Excel |
| Excel Green 2 | `#349C42` | Sombra Excel |
| Excel Yellow 1 | `#F9CA06` | Highlight documentos |
| Excel Yellow 2 | `#F7BC04` | Sombra documentos |
| Table Border Blue | `#51B8F6` | Bordes de celdas en tabla |
| Logout Red | `rgb(253, 107, 107)` | Ícono de logout |
| Disabled | `#b8b8b8` | Inputs y controles deshabilitados |

### Texto

| Nombre | Hex | Uso |
|---|---|---|
| Text Primary | `#001EB3` | Subtítulos hero, accent text |
| Text Dark | `#666666` | Cuerpo de texto general |
| Text Secondary | `#616161` | Texto secundario |
| Text White | `#FFFFFF` | Texto sobre fondos oscuros |

---

## 2. Tipografía

### Familia de Fuentes

```css
font-family: 'Roboto', system-ui, -apple-system, sans-serif;
```

> Dependencia: `@fontsource/roboto` v5.0.12

### Escala Tipográfica

| Nombre | Tamaño | Peso | Uso |
|---|---|---|---|
| Hero / Subtitle | `36px` | `500` | Títulos login, subtítulos hero |
| Title | `24px` | `700` | Títulos de tabla, módulos |
| Heading | `18px` | `700` | Encabezados de lista, módulos |
| Body Large | `16px` | `400` | Celdas de tabla, texto estándar |
| Body | `14px` | `400` | Labels, date picker, tree |
| Caption | `13px` | `400` | Labels de error |
| Small | `12px` | `400` | Mensajes de error, paginación |

### Transformaciones de Texto

```css
/* Menú y navegación */
text-transform: uppercase;

/* Botones */
text-transform: none;
```

---

## 3. Espaciado

### Valores Base

```
4px — borde de acento (border-left)
5px — espaciado mínimo
10px — espaciado interno componentes
15px — padding de secciones
20px — padding de contenedores / márgenes estándar
30px — márgenes grandes
1rem — gaps en formularios
```

### Contenedores

```css
/* Contenedor principal */
width: 90%;
margin: auto;

/* Login container */
width: 570px;
max-height: 462px;
padding: 3% 0;
```

---

## 4. Bordes y Radios

| Nombre | Valor | Uso |
|---|---|---|
| Pill (inputs/botones) | `25px` | Todos los inputs y botones |
| Card | `10px` | Tarjetas, paneles, árbol |
| Panel | `15px` | Formulario login |
| Small | `5px` | Filtros, bordes menores |

---

## 5. Sombras

```css
/* Header / Navbar */
box-shadow: 0px 0px 5px 0px #000000;

/* Cards / Componentes */
box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
```

---

## 6. Componentes

### Botones

```tsx
// Contained (acción principal)
<Button variant="contained" color="primary">
  // background: #001EB3 | text: white | border-radius: 25px
  // padding: 10px 20px | textTransform: none

// Outlined (acción secundaria)
<Button variant="outlined">
  // background: white | text: black | border: primary | border-radius: 25px

// Login
  // background: #0D2A8A | text: white | border-radius: 25px
```

### Inputs / TextField

```tsx
// Patrón estándar para todos los campos
sx={{
  "& .MuiOutlinedInput-root": {
    "& fieldset": { borderRadius: "25px" },
    "&:hover fieldset": { borderRadius: "25px" },
    "&.Mui-focused fieldset": { borderRadius: "25px" }
  }
}}
```

### Cards

```css
.card {
  background: #fff;
  border-radius: 10px;
  border-left: 5px solid #001EB3;  /* acento de marca */
  padding: 10px;
  margin: 10px;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
}
```

### Tablas

```css
/* Encabezado */
background: #006699;
color: #fff;
font-weight: bold;
font-size: 16px;

/* Filas alternadas */
background: #fff | #DEE0D6;

/* Bordes de celda */
border: 1px solid #51B8F6;

/* Paginación */
font-size: 12px;
color: #666666;
```

### Navbar

```css
.navbar {
  background: #001EB3;
  height: 100px;
  color: white;
  box-shadow: 0px 0px 5px 0px #000000;
}

/* Logo */
width: 40px;
height: 40px;

/* Barra de usuario */
background: white;
color: #001EB3;
height: 30px;
```

### Paneles / Filtros

```css
.filter-section {
  border-left: 4px solid #001EB3;
  padding: 15px;
  margin: 20px;
  background: #fff;
  border-radius: 10px;
}
```

### Tree View (Menú lateral)

```css
.tree-view {
  background: white;
  border: 1px solid #E4E4E4;
  border-radius: 10px;
  padding: 10px;
}
```

### Loading / Backdrop

```css
.backdrop {
  z-index: 99999;
}
.loading-image {
  width: 50px;
  height: 38px;
}
```

---

## 7. Configuración MUI Theme

```typescript
// src/styles/theme.ts
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#001EB3',
    },
    secondary: {
      main: '#0D2A8A',
    },
    info: {
      main: '#d1d1d1',
    },
    background: {
      default: '#E5E5E5',
    },
  },
  typography: {
    fontFamily: "'Roboto', system-ui, -apple-system, sans-serif",
    subtitle1: {
      fontSize: '36px',
      color: '#001EB3',
      fontWeight: '500',
    },
  },
});
```

---

## 8. Layout y Grid

```css
/* Contenedor principal de página */
.page-container {
  width: 90%;
  margin: auto;
}

/* Formularios y listas */
.form-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Navbar items */
.navbar-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  justify-content: space-between;
}

/* Home / Dashboard */
.home-grid {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}
```

---

## 9. Assets de Marca

| Archivo | Dimensiones | Uso |
|---|---|---|
| `LogoNavbar.png` | 40×40px | Logo en navbar |
| `LogoNavbarBlue.png` | 40×40px | Logo azul alternativo |
| `fondoTigo.png` | — | Imagen de fondo en pantalla login |
| `loading.png` | 50×38px | Spinner de carga |
| `not-found.png` | — | Página 404 |

---

## 10. Estados Interactivos

```css
/* Hover sobre listas */
background: #f0f0f0;

/* Focus en inputs */
border-color: #001EB3;
border-radius: 25px; /* mantener */

/* Seleccionado */
background: #E5E5E5;

/* Deshabilitado */
color: #b8b8b8;
cursor: not-allowed;
```

---

## 11. Dependencias UI

```json
{
  "@mui/material": "^6.1.1",
  "@mui/icons-material": "^6.1.1",
  "@mui/lab": "latest",
  "@mui/x-date-pickers": "latest",
  "@mui/x-tree-view": "latest",
  "@emotion/react": "latest",
  "@emotion/styled": "latest",
  "@fontsource/roboto": "5.0.12"
}
```

---

## 12. Principios de Diseño

1. **Color único de marca**: `#001EB3` — consistencia total en toda la UI
2. **Estética redondeada**: `25px` en inputs y botones para apariencia moderna
3. **Fondos grises suaves**: `#E5E5E5` / `#f2f2f2` para jerarquía visual sin fatiga
4. **Tipografía Roboto**: Sans-serif legible, accesible y corporativa
5. **Cards en blanco**: Alto contraste con fondo gris, radio de `10px`
6. **Acento izquierdo**: Borde izquierdo de `4–5px` en color primario en paneles
7. **MUI como base**: Material Design con tema customizado Tigo/Millicom
8. **Contraste accesible**: Texto blanco sobre azul, rojo para errores, gris para secundario

---

*Generado automáticamente desde APL-IntAltamiraReactJSFront — Rama ODTT-30915*
