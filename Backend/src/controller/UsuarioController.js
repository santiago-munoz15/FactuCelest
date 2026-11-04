import { getConnection, sql } from "../config/db.js";
import { randomInt } from "node:crypto";

const brevoConfigurado = () => Boolean(process.env.BREVO_API_KEY && process.env.BREVO_FROM_EMAIL);
const generarCodigo = () => String(randomInt(100000, 1000000));
const escaparHtml = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
})[char]);

const enviarCodigoVerificacion = async (email, nombre, codigo) => {
  if (!brevoConfigurado()) throw new Error("BREVO_NOT_CONFIGURED");
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": process.env.BREVO_API_KEY,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      sender: { name: process.env.BREVO_FROM_NAME || "FactuCelest", email: process.env.BREVO_FROM_EMAIL },
      to: [{ email, name: nombre }],
      subject: "Código de verificación - FactuCelest",
      textContent: `Hola ${nombre}, tu código de verificación es ${codigo}. Vence en 15 minutos.`,
      htmlContent: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;color:#173452"><h2>Verifica tu correo</h2><p>Hola ${escaparHtml(nombre)}, usa este código para activar tu cuenta:</p><p style="font-size:30px;font-weight:bold;letter-spacing:8px;color:#087bf5">${codigo}</p><p>El código vence en 15 minutos. Si no solicitaste esta cuenta, puedes ignorar este mensaje.</p></div>`,
    }),
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) {
    const error = new Error(`Brevo respondió con HTTP ${response.status}`);
    error.details = await response.text();
    error.status = response.status;
    throw error;
  }
};
export const Login = async (req, res) => {
  try {
    const { correo, contrasena } = req.body;

    const pool = await getConnection();
    const result = await pool
      .request()
      .input("Email", sql.VarChar(100), correo)
      .input("Contrasena", sql.VarChar(100), contrasena)
      .execute("spLoginUsuario");

    const usuario = result.recordset[0];

    if (!usuario) {
      return res
        .status(401)
        .json({ message: "❌ Usuario o contraseña incorrectos." });
    }

    if (!usuario.Verificado) {
      return res.status(403).json({
        message: "⚠️ Cuenta no verificada. Por favor verifica tu correo.",
      });
    }

    res.status(200).json({
      message: "✅ Inicio de sesión exitoso.",
      usuario,
    });
  } catch (error) {
    console.error("❌ Error en Login:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

// ✅ REGISTRAR USUARIO
export const Registrar = async (req, res) => {
  try {
    const nombre = String(req.body.nombre || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    if (!nombre || !email || !password) return res.status(400).json({ message: "Nombre, correo y contraseña son obligatorios." });
    if (nombre.length > 100 || email.length > 100 || password.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "Revisa el nombre, el correo o la longitud de la contraseña." });
    }
    if (!brevoConfigurado()) return res.status(503).json({ message: "El envío de códigos no está configurado. Contacta al administrador." });

    const codigo = generarCodigo();
    const pool = await getConnection();
    const registro = await pool.request()
      .input("Nombre", sql.VarChar(100), nombre)
      .input("Email", sql.VarChar(100), email)
      .input("Password", sql.VarChar(100), password)
      .input("Codigo", sql.VarChar(10), codigo)
      .execute("spRegistrarUsuario");

    if (registro.recordset[0]?.Resultado === "EXISTE") {
      const existente = await pool.request().input("Email", sql.VarChar(100), email)
        .query("SELECT TOP 1 Verificado FROM dbo.InicioSesion WHERE Email = @Email");
      if (existente.recordset[0] && !existente.recordset[0].Verificado) {
        return res.status(409).json({ code: "REGISTRATION_PENDING", message: "Ya hay un registro pendiente con ese correo. Reenvía el código de verificación." });
      }
      return res.status(409).json({ message: "Ya existe una cuenta con ese correo." });
    }

    await pool.request().input("Email", sql.VarChar(100), email)
      .query("UPDATE dbo.InicioSesion SET CodigoExpiraEn = DATEADD(minute, 15, GETDATE()), CodigoEnviadoEn = GETDATE() WHERE Email = @Email AND ISNULL(Verificado, 0) = 0");

    try {
      await enviarCodigoVerificacion(email, nombre, codigo);
      return res.status(201).json({ message: "Registro creado. Enviamos un código de verificación a tu correo." });
    } catch (mailError) {
      console.error("No se pudo enviar el código de verificación:", mailError.details || mailError.message || mailError);
      return res.status(502).json({ code: "REGISTRATION_EMAIL_FAILED", message: "La cuenta quedó pendiente de verificación, pero no se pudo enviar el correo. Intenta reenviar el código." });
    }
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    return res.status(500).json({ message: "Error al registrar usuario." });
  }
};

export const ReenviarCodigo = async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    if (email.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ message: "Ingresa un correo válido." });
    if (!brevoConfigurado()) return res.status(503).json({ message: "El envío de códigos no está configurado. Contacta al administrador." });

    const pool = await getConnection();
    const codigo = generarCodigo();
    const actualizado = await pool.request()
      .input("Email", sql.VarChar(100), email)
      .input("Codigo", sql.VarChar(10), codigo)
      .query(`UPDATE dbo.InicioSesion
        SET CodigoVerificacion = @Codigo,
            CodigoExpiraEn = DATEADD(minute, 15, GETDATE()),
            CodigoEnviadoEn = GETDATE()
        OUTPUT INSERTED.Nombre
        WHERE Email = @Email AND ISNULL(Verificado, 0) = 0
          AND (CodigoEnviadoEn IS NULL OR CodigoEnviadoEn <= DATEADD(second, -60, GETDATE()))`);

    const usuario = actualizado.recordset[0];
    if (!usuario) {
      const consulta = await pool.request().input("Email", sql.VarChar(100), email)
        .query("SELECT TOP 1 Verificado FROM dbo.InicioSesion WHERE Email = @Email");
      const existente = consulta.recordset[0];
      if (existente && !existente.Verificado) return res.status(429).json({ message: "Espera un minuto antes de solicitar otro código." });
      return res.status(404).json({ message: "No encontramos una cuenta pendiente de verificación para ese correo." });
    }

    try {
      await enviarCodigoVerificacion(email, usuario.Nombre, codigo);
      return res.status(200).json({ message: "Enviamos un nuevo código. Revisa tu correo." });
    } catch (mailError) {
      console.error("No se pudo reenviar el código:", mailError.details || mailError.message || mailError);
      return res.status(502).json({ message: "No se pudo enviar el correo. Espera un minuto e inténtalo de nuevo." });
    }
  } catch (error) {
    console.error("Error al reenviar el código:", error);
    return res.status(500).json({ message: "No se pudo reenviar el código." });
  }
};
export const Verificar = async (req, res) => {
  try {
    const correo = String(req.body.correo || "").trim().toLowerCase();
    const codigo = String(req.body.codigo || "").trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo) || !/^\d{6}$/.test(codigo)) {
      return res.status(400).json({ message: "El correo o el código no son válidos." });
    }

    const pool = await getConnection();
    const result = await pool.request()
      .input("Email", sql.VarChar(100), correo)
      .input("Codigo", sql.VarChar(10), codigo)
      .query(`UPDATE dbo.InicioSesion
        SET Verificado = 1, CodigoVerificacion = NULL, CodigoExpiraEn = NULL, CodigoEnviadoEn = NULL
        OUTPUT INSERTED.IdUsuario
        WHERE Email = @Email AND CodigoVerificacion = @Codigo
          AND ISNULL(Verificado, 0) = 0 AND CodigoExpiraEn > GETDATE()`);

    if (!result.recordset[0]) return res.status(400).json({ message: "El código es incorrecto o venció. Solicita uno nuevo." });
    return res.status(200).json({ message: "Cuenta verificada correctamente. Ya puedes iniciar sesión." });
  } catch (error) {
    console.error("Error al verificar código:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
};
