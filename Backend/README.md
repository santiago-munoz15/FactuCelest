# FactuCelest Backend

## Desarrollo local

1. Instala Node.js 18 o superior y ejecuta `npm install` en esta carpeta.
2. Copia `.env.example` como `.env` y completa las credenciales de Azure SQL.
3. Ejecuta `npm run dev` para desarrollo o `npm start` para iniciar el servidor.

El backend valida y actualiza las columnas requeridas al iniciar. El servidor escucha en `PORT` (3000 localmente) y ofrece `GET /health` para comprobar disponibilidad. En Render, configura las variables `DB_USER`, `DB_PASSWORD`, `DB_SERVER`, `DB_NAME` y `DB_PORT`; nunca subas el archivo `.env` con credenciales.

Para correo de verificación configura `BREVO_API_KEY` y `BREVO_FROM_EMAIL` y, opcionalmente, `BREVO_FROM_NAME`. En Render, abre el servicio del backend, entra en **Environment** y agrega las variables. `BREVO_API_KEY` es una API key de Brevo; `BREVO_FROM_EMAIL` debe ser un remitente verificado en Brevo. Esta integración usa la API HTTPS de Brevo, no SMTP. No agregues las credenciales al código ni al repositorio. Guarda los cambios y vuelve a desplegar el backend.

Los códigos vencen a los 15 minutos. El endpoint `POST /api/usuarios/reenviar-codigo` permite solicitar otro para una cuenta pendiente, con un intervalo mínimo de un minuto entre envíos. La verificación por correo no muestra el código en la respuesta de la API.
