// src/model/FacturaModel.js
import { getConnection, sql } from "../config/db.js";

const FacturaModel = {
  crearFactura: async (factura) => {
    try {
      const {
        DocumentoCliente,
        Subtotal,
        Iva,
        Total,
        MetodoPago = "Efectivo",
      } = factura;
      const pool = await getConnection();

      const result = await pool
        .request()
        .input("DocumentoCliente", sql.BigInt, DocumentoCliente)
        .input("Subtotal", sql.Decimal(18, 2), Subtotal)
        .input("Impuesto", sql.Decimal(18, 2), Iva)
        .input("Total", sql.Decimal(18, 2), Total)
        .input("MetodoPago", sql.VarChar(50), MetodoPago)
        .execute("sp_CrearFactura");

      return { success: true, IdFactura: result.recordset[0].IdFactura };
    } catch (error) {
      console.error("❌ Error al crear factura:", error);
      return { success: false, error: error.message };
    }
  },

  obtenerUltimasFacturas: async (cantidad = 10) => {
    try {
      const pool = await getConnection();

      const result = await pool
        .request()
        .input("Cantidad", sql.Int, cantidad)
        .execute("spObtenerUltimasFacturas");

      return { success: true, facturas: result.recordset };
    } catch (error) {
      console.error("❌ Error al obtener facturas:", error);
      return { success: false, error: error.message };
    }
  },

  obtenerVentasMensuales: async (anio = null, mes = null) => {
    try {
      const pool = await getConnection();

      const result = await pool
        .request()
        .input("Anio", sql.Int, anio)
        .input("Mes", sql.Int, mes)
        .execute("spObtenerVentasMensuales");

      return { success: true, ventas: result.recordset };
    } catch (error) {
      console.error("❌ Error al obtener ventas mensuales:", error);
      return { success: false, error: error.message };
    }
  },
};

export default FacturaModel;
