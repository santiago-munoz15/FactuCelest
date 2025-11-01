import { getConnection, sql } from "../config/db.js";

// 🔹 Iniciar sesión
export const loginUsuario = async (correo, contrasena) => {
  const pool = await getConnection();
  const result = await pool
    .request()
    .input("Correo", sql.VarChar, correo)
    .input("Contrasena", sql.VarChar, contrasena)
    .execute("spLoginUsuario"); // Nombre del SP en tu BD

  return result.recordset;
};

// 🔹 Registrar usuario (primera parte, sin verificar aún)
export const registrarUsuario = async (
  nombre,
  correo,
  contrasena,
  codigoVerificacion
) => {
  const pool = await getConnection();
  const result = await pool
    .request()
    .input("Nombre", sql.VarChar, nombre)
    .input("Correo", sql.VarChar, correo)
    .input("Contrasena", sql.VarChar, contrasena)
    .input("CodigoVerificacion", sql.VarChar, codigoVerificacion)
    .execute("spRegistrarUsuario"); // Nombre del SP correspondiente

  return result.recordset;
};

// 🔹 Verificar código (para completar el registro)
export const verificarCodigo = async (correo, codigo) => {
  const pool = await getConnection();
  const result = await pool
    .request()
    .input("Correo", sql.VarChar, correo)
    .input("Codigo", sql.VarChar, codigo)
    .execute("spVerificarCodigo"); // Nombre del SP correspondiente

  return result.recordset;
};
