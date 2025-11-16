import { getConnection, sql } from "../config/db.js";
import nodemailer from "nodemailer";

// ✅ LOGIN
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

    if (usuario.Verificado === 0) {
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
    const { nombre, email, password } = req.body;

    // Generar un código de verificación aleatorio de 6 dígitos
    const codigoVerificacion = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const pool = await getConnection();
    await pool
      .request()
      .input("Nombre", sql.VarChar(100), nombre)
      .input("Email", sql.VarChar(100), email)
      .input("Password", sql.VarChar(100), password)
      .input("Codigo", sql.VarChar(10), codigoVerificacion) // ✅ importante
      .execute("spRegistrarUsuario");

    // Configurar transporte de correo (usa tu propio correo aquí)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // tu correo
        pass: process.env.EMAIL_PASS, // tu contraseña o App Password
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Código de verificación - FactuCelest",
      html: `
        <h2>Hola ${nombre},</h2>
        <p>Tu código de verificación es:</p>
        <h3 style="color:blue;">${codigoVerificacion}</h3>
        <p>Por favor ingrésalo en la aplicación para completar tu registro.</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({
      message:
        "✅ Usuario registrado. Se envió un código de verificación al correo.",
    });
  } catch (error) {
    console.error("❌ Error al registrar usuario:", error);
    res.status(500).json({ message: "Error al registrar usuario." });
  }
};

// ✅ VERIFICAR CÓDIGO
export const Verificar = async (req, res) => {
  try {
    const { correo, codigo } = req.body;

    const pool = await getConnection();
    const result = await pool
      .request()
      .input("Email", sql.VarChar(100), correo)
      .input("Codigo", sql.VarChar(6), codigo)
      .execute("spConfirmarCodigo");

    const usuario = result.recordset[0];

    if (!usuario) {
      return res
        .status(400)
        .json({ message: "❌ Código inválido o usuario no encontrado." });
    }

    res.status(200).json({
      message: "✅ Cuenta verificada correctamente.",
    });
  } catch (error) {
    console.error("❌ Error al verificar código:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};
