// src/controllers/FacturaController.js
import FacturaModel from "../model/FacturaModel.js";

const FacturaController = {
  crearFactura: async (req, res) => {
    try {
      const {
        DocumentoCliente,
        Subtotal,
        Iva,
        Total,
        MetodoPago = "Efectivo",
        Detalle = [],
      } = req.body;

      console.log("📦 Datos recibidos:", {
        DocumentoCliente,
        Subtotal,
        Iva,
        Total,
        MetodoPago,
        Detalle,
      });

      // Validaciones
      if (
        !DocumentoCliente ||
        Subtotal === undefined ||
        Iva === undefined ||
        Total === undefined
      ) {
        return res.status(400).json({
          success: false,
          error:
            "Todos los campos son obligatorios (DocumentoCliente, Subtotal, Iva, Total)",
        });
      }

      // Validar que haya productos en el detalle (opcional, según tu lógica)
      if (Detalle.length === 0) {
        console.warn("⚠️ Factura sin productos en el detalle");
      }

      const result = await FacturaModel.crearFactura({
        DocumentoCliente,
        Subtotal,
        Iva,
        Total,
        MetodoPago,
      });

      if (!result.success) {
        return res.status(500).json({
          success: false,
          error: result.error,
        });
      }

      console.log("✅ Factura creada con ID:", result.IdFactura);

      res.status(201).json({
        success: true,
        message: "✅ Factura registrada correctamente",
        IdFactura: result.IdFactura,
      });
    } catch (error) {
      console.error("❌ Error en crearFactura:", error);
      res.status(500).json({
        success: false,
        error: "Error al crear la factura",
      });
    }
  },

  obtenerUltimasFacturas: async (req, res) => {
    try {
      const { cantidad = 10 } = req.query;

      const result = await FacturaModel.obtenerUltimasFacturas(
        parseInt(cantidad)
      );

      if (!result.success) {
        return res.status(500).json({
          success: false,
          error: result.error,
        });
      }

      res.status(200).json({
        success: true,
        facturas: result.facturas,
      });
    } catch (error) {
      console.error("❌ Error en obtenerUltimasFacturas:", error);
      res.status(500).json({
        success: false,
        error: "Error al obtener facturas",
      });
    }
  },

  obtenerVentasMensuales: async (req, res) => {
    try {
      const { anio, mes } = req.query;

      const result = await FacturaModel.obtenerVentasMensuales(
        anio ? parseInt(anio) : null,
        mes ? parseInt(mes) : null
      );

      if (!result.success) {
        return res.status(500).json({
          success: false,
          error: result.error,
        });
      }

      res.status(200).json({
        success: true,
        ventas: result.ventas,
      });
    } catch (error) {
      console.error("❌ Error en obtenerVentasMensuales:", error);
      res.status(500).json({
        success: false,
        error: "Error al obtener ventas mensuales",
      });
    }
  },
};

export default FacturaController;
