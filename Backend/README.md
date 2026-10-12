# FactuCelest Backend

## Desarrollo local

1. Instala Node.js 18 o superior y ejecuta `npm install` en esta carpeta.
2. Copia `.env.example` como `.env` y completa las credenciales de Azure SQL.
3. Ejecuta `npm run dev` para desarrollo o `npm start` para iniciar el servidor.

El backend valida y actualiza las columnas requeridas al iniciar. El servidor escucha en `PORT` (3000 localmente) y ofrece `GET /health` para comprobar disponibilidad. En Render, configura las variables `DB_USER`, `DB_PASSWORD`, `DB_SERVER`, `DB_NAME` y `DB_PORT`; nunca subas el archivo `.env` con credenciales.

Para correo de verificación configura `SENDGRID_API_KEY` y `SENDGRID_FROM_EMAIL`.
