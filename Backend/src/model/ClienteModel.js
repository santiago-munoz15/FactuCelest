import { getConnection, sql } from "../config/db.js";

const ClienteModel = {
  // 🔹 Listar todos los clientes
  listar: async () => {
    try {
      const pool = await getConnection();
      const result = await pool
        .request()
        .query("SELECT Documento, Nombre, Telefono, Correo, Direccion, Ciudad FROM Clientes");
      return result.recordset;
    } catch (error) {
      console.error("❌ Error al listar clientes:", error);
      throw error;
    }
  },

  // 🔹 Buscar cliente por documento
  buscarPorDocumento: async (documento) => {
    try {
      const pool = await getConnection();
      const result = await pool
        .request()
        .input("Documento", sql.BigInt, documento)
        .query(`
          SELECT
            Documento,
            Nombre,
            Telefono,
            Correo,
            Direccion,
            Ciudad
          FROM Clientes
          WHERE Documento = @Documento
        `);

      return result.recordset[0]; // devuelve solo 1 cliente con IdCliente, Nombre, etc.
    } catch (error) {
      console.error("❌ Error al buscar cliente:", error);
      throw error;
    }
  },

  // 🔹 Crear cliente
  crear: async (data) => {
    try {
      const pool = await getConnection();
      const { Documento, Nombre, Telefono, Correo, Direccion, Ciudad } = data;

      const result = await pool
        .request()
        .input("Documento", sql.BigInt, Documento)
        .input("Nombre", sql.VarChar, Nombre)
        .input("Telefono", sql.BigInt, Telefono)
        .input("Correo", sql.VarChar, Correo)
        .input("Direccion", sql.VarChar, Direccion)
        .input("Ciudad", sql.VarChar, Ciudad)
        .query(`
          IF EXISTS (SELECT 1 FROM Clientes WHERE Documento = @Documento)
          BEGIN
            UPDATE Clientes
            SET Nombre = @Nombre,
                Telefono = @Telefono,
                Correo = @Correo,
                Direccion = @Direccion,
                Ciudad = @Ciudad
            WHERE Documento = @Documento;

            SELECT Documento, Nombre, Telefono, Correo, Direccion, Ciudad
            FROM Clientes
            WHERE Documento = @Documento;
          END
          ELSE
          BEGIN
            INSERT INTO Clientes (Documento, Nombre, Telefono, Correo, Direccion, Ciudad)
            VALUES (@Documento, @Nombre, @Telefono, @Correo, @Direccion, @Ciudad);

            SELECT Documento, Nombre, Telefono, Correo, Direccion, Ciudad
            FROM Clientes
            WHERE Documento = @Documento;
          END
        `);

      const clienteCreado = result.recordset[0];

      // Verificar si fue exitoso
      if (clienteCreado && clienteCreado.Documento > 0) {
        return {
          success: true,
          message: "✅ Cliente registrado correctamente.",
          cliente: clienteCreado, // Retorna el cliente con Documento
        };
      } else {
        return {
          success: false,
          message:
            clienteCreado?.Mensaje || "⚠️ No se pudo registrar el cliente.",
        };
      }
    } catch (error) {
      console.error("❌ Error al crear cliente:", error);
      return {
        success: false,
        message: "❌ Error interno al registrar cliente.",
      };
    }
  },
};

export default ClienteModel;
