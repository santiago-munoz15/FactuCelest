# FactuCelest Frontend

Este repositorio contiene únicamente el frontend del sistema FactuCelest. Está hecho con React + Vite y se conecta a un backend externo mediante la variable de entorno `VITE_API_URL`.

## Requisitos

- Node.js 18 o superior
- npm

## Ejecutar en la PC

1. Abrir una terminal dentro de la carpeta `Frontend`.
2. Instalar dependencias:

```bash
npm install
```

3. Crear un archivo `.env` basado en `.env.example` y definir la URL del backend.
4. Iniciar la aplicación:

```bash
npm run dev
```

La app se abrirá normalmente en `http://localhost:5173`.

## Variables de entorno

- `VITE_API_URL`: URL del backend que consume el frontend. Si el backend está desplegado, aquí debe ir su URL pública.

Ejemplo:

```env
VITE_API_URL=https://tu-backend-en-render.onrender.com
```

## Generar versión de entrega

Si quieres entregar el frontend listo para compilar:

```bash
npm install
npm run build
```

Luego se genera la carpeta `dist`, que contiene los archivos compilados.

## Nota para el profesor

Si solo va a ejecutar el frontend en su PC, no necesita levantar el backend localmente. Solo debe configurar `VITE_API_URL` con una URL válida del backend para que la aplicación funcione correctamente.
