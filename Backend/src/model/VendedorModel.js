import { getConnection, sql } from "../config/db.js";

const VendedorModel = {
  listar: async (nombre = "") => {
    try {
      const pool = await getConnection();
      const request = pool.request();

      const filtro = nombre.trim();

      if (filtro) {
        request.input("Nombre", sql.VarChar(150), filtro);
      }

      const query = filtro
        ? `
          SELECT IdVendedor, Nombre, Telefono, FechaRegistro
          FROM Vendedores
          WHERE Nombre LIKE '%' + @Nombre + '%'
          ORDER BY Nombre ASC;
        `
        : `
          SELECT IdVendedor, Nombre, Telefono, FechaRegistro
          FROM Vendedores
          ORDER BY Nombre ASC;
        `;

      const result = await request.query(query);
      return { success: true, vendedores: result.recordset };
    } catch (error) {
      console.error("❌ Error al listar vendedores:", error);
      return { success: false, error: error.message };
    }
  },

  crear: async ({ Nombre, Telefono }) => {
    try {
      const nombre = String(Nombre || "").trim();
      const telefono = String(Telefono || "").trim();

      if (!nombre || !telefono) {
        return {
          success: false,
          error: "Nombre y teléfono son obligatorios",
        };
      }

      const pool = await getConnection();
      const result = await pool
        .request()
        .input("Nombre", sql.VarChar(150), nombre)
        .input("Telefono", sql.VarChar(30), telefono)
        .query(`
          IF EXISTS (SELECT 1 FROM Vendedores WHERE Nombre = @Nombre)
          BEGIN
            SELECT TOP 1 IdVendedor, Nombre, Telefono, FechaRegistro
            FROM Vendedores
            WHERE Nombre = @Nombre;
          END
          ELSE
          BEGIN
            INSERT INTO Vendedores (Nombre, Telefono)
            OUTPUT INSERTED.IdVendedor, INSERTED.Nombre, INSERTED.Telefono, INSERTED.FechaRegistro
            VALUES (@Nombre, @Telefono);
          END
        `);

      return {
        success: true,
        vendedor: result.recordset[0],
      };
    } catch (error) {
      console.error("❌ Error al crear vendedor:", error);
      return { success: false, error: error.message };
    }
  },
};

export default VendedorModel;