// src/controllers/FacturaController.js
import XLSX from "xlsx";
import FacturaModel from "../model/FacturaModel.js";

const DATOS_EMPRESA = {
  Nombre: "INTIMAS CELESTE",
  Nit: "4268675-2",
  Ciudad: "Medellin",
  Telefono: "3174668696",
};

const formatearFecha = (fecha) => {
  const valor = new Date(fecha);

  if (Number.isNaN(valor.getTime())) {
    return "";
  }

  return valor.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const construirFilasExcel = (factura, vendedor) => {
  const filas = [
    ["Nombre", DATOS_EMPRESA.Nombre],
    ["Nit", DATOS_EMPRESA.Nit],
    ["Ciudad", DATOS_EMPRESA.Ciudad],
    ["Telefono", DATOS_EMPRESA.Telefono],
    [],
    ["Datos del cliente"],
    ["Nombre", factura.NombreCliente ?? ""],
    ["C.C / NIT", factura.DocumentoCliente ?? ""],
    ["Direccion", factura.DireccionCliente ?? ""],
    ["Ciudad", "Medellin"],
    ["Telefono", factura.TelefonoCliente ?? ""],
    [],
    ["Datos Vendedor"],
    ["Nombre", vendedor],
    [],
    ["Factura", `#${factura.IdFactura}`],
    ["Fecha de la factura", formatearFecha(factura.Fecha)],
    ["Metodo de pago", factura.MetodoPago ?? ""],
    [],
    ["Código", "Descripción", "Talla", "Cantidad", "Valor Unit.", "Valor Total"],
  ];

  factura.Detalle.forEach((item) => {
    filas.push([
      item.IdProductoFK ?? "",
      item.Descripcion ?? item.Referencia ?? "",
      item.Talla ?? "",
      Number(item.Cantidad ?? 0),
      Number(item.PrecioUnitario ?? 0),
      Number(item.Subtotal ?? 0),
    ]);
  });

  filas.push([]);
  filas.push(["Subtotal", "", "", "", "", Number(factura.Subtotal ?? 0)]);
  filas.push(["Impuesto", "", "", "", "", Number(factura.Impuesto ?? 0)]);
  filas.push(["Total", "", "", "", "", Number(factura.Total ?? 0)]);

  return filas;
};

const FacturaController = {
  crearFactura: async (req, res) => {
    try {
      const {
        DocumentoCliente,
        Subtotal,
        Iva,
        Total,
        MetodoPago = "Efectivo",
        NombreVendedor = null,
        TelefonoVendedor = null,
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
        NombreVendedor,
        TelefonoVendedor,
        Detalle,
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

  obtenerFacturasReporte: async (req, res) => {
    try {
      const { periodo = "todos", desde, hasta, busqueda = "" } = req.query;

      const result = await FacturaModel.obtenerFacturasReporte({
        periodo,
        desde,
        hasta,
        busqueda,
      });

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
      console.error("❌ Error en obtenerFacturasReporte:", error);
      res.status(500).json({
        success: false,
        error: "Error al obtener el reporte de facturas",
      });
    }
  },

  obtenerFacturaPorId: async (req, res) => {
    try {
      const { id } = req.params;

      const result = await FacturaModel.obtenerFacturaPorId(id);

      if (!result.success) {
        return res.status(404).json({
          success: false,
          error: result.error,
        });
      }

      res.status(200).json({
        success: true,
        factura: result.factura,
      });
    } catch (error) {
      console.error("❌ Error en obtenerFacturaPorId:", error);
      res.status(500).json({
        success: false,
        error: "Error al obtener la factura",
      });
    }
  },

  actualizarFactura: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        DocumentoCliente,
        Subtotal,
        Iva,
        Total,
        MetodoPago = "Efectivo",
        NombreVendedor = null,
        TelefonoVendedor = null,
        Detalle = [],
      } = req.body;

      if (!DocumentoCliente || Subtotal === undefined || Iva === undefined || Total === undefined) {
        return res.status(400).json({
          success: false,
          error:
            "Todos los campos son obligatorios (DocumentoCliente, Subtotal, Iva, Total)",
        });
      }

      const result = await FacturaModel.actualizarFactura(id, {
        DocumentoCliente,
        Subtotal,
        Iva,
        Total,
        MetodoPago,
        NombreVendedor,
        TelefonoVendedor,
        Detalle,
      });

      if (!result.success) {
        return res.status(500).json({
          success: false,
          error: result.error,
        });
      }

      res.status(200).json({
        success: true,
        message: "✅ Factura actualizada correctamente",
        IdFactura: result.IdFactura,
      });
    } catch (error) {
      console.error("❌ Error en actualizarFactura:", error);
      res.status(500).json({
        success: false,
        error: "Error al actualizar la factura",
      });
    }
  },

  descargarFacturaExcel: async (req, res) => {
    try {
      const { id } = req.params;

      const result = await FacturaModel.obtenerFacturaPorId(id);

      if (!result.success) {
        return res.status(404).json({
          success: false,
          error: result.error,
        });
      }

      const vendedor =
        result.factura.NombreVendedor?.trim() ||
        req.query.vendedor?.trim() ||
        "SARA";

      const filas = construirFilasExcel(result.factura, vendedor);
      const worksheet = XLSX.utils.aoa_to_sheet(filas);
      const workbook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(workbook, worksheet, `Factura-${id}`);

      const buffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "buffer",
      });

      res.setHeader(
        "Content-Disposition",
        `attachment; filename=factura_${id}.xlsx`
      );
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.send(buffer);
    } catch (error) {
      console.error("❌ Error al descargar factura Excel:", error);
      res.status(500).json({
        success: false,
        error: "No se pudo generar el archivo Excel",
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
