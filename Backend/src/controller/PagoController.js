import PagoModel from "../model/PagoModel.js";
import NotificacionModel from "../model/NotificacionModel.js";

const METODOS_VALIDOS = new Set(["Efectivo", "Transferencia", "Tarjeta", "Nequi", "Daviplata"]);

const PagoController = {
  listar: async (req, res) => {
    try {
      const facturas = await PagoModel.listarFacturas({
        estado: String(req.query.estado || ""),
        busqueda: String(req.query.busqueda || ""),
      });
      res.json({ success: true, facturas });
    } catch (error) {
      console.error("Error al consultar cuentas por cobrar:", error);
      res.status(500).json({ success: false, error: "No se pudieron cargar las cuentas por cobrar." });
    }
  },

  listarAbonos: async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isSafeInteger(id) || id <= 0) return res.status(400).json({ success: false, error: "Factura inválida." });
      const abonos = await PagoModel.listarAbonos(id);
      res.json({ success: true, abonos });
    } catch (error) {
      console.error("Error al consultar abonos:", error);
      res.status(500).json({ success: false, error: "No se pudo cargar el historial de abonos." });
    }
  },

  registrarAbono: async (req, res) => {
    const idFactura = Number(req.params.id);
    const monto = Math.round(Number(req.body.monto) * 100) / 100;
    const metodoPago = String(req.body.metodoPago || "");
    const pagador = String(req.body.pagador || "").trim();
    const observaciones = String(req.body.observaciones || "").trim();

    if (!Number.isSafeInteger(idFactura) || idFactura <= 0 || !Number.isFinite(monto) || monto <= 0) {
      return res.status(400).json({ success: false, error: "Indica una factura y un abono mayor que cero." });
    }
    if (!METODOS_VALIDOS.has(metodoPago)) return res.status(400).json({ success: false, error: "Selecciona un método de pago válido." });
    if (pagador.length > 150 || observaciones.length > 500) return res.status(400).json({ success: false, error: "Revisa la longitud del pagador o de las observaciones." });

    try {
      const result = await PagoModel.registrarAbono({ idFactura, monto, metodoPago, pagador, observaciones });
      try {
        const montoFormateado = monto.toLocaleString("es-CO");
        const mensajeSaldo = result.saldoRestante <= 0
          ? `La factura #${idFactura} quedó pagada.`
          : `Se registró un abono de $${montoFormateado} a la factura #${idFactura}. Saldo pendiente: $${result.saldoRestante.toLocaleString("es-CO")}.`;
        await NotificacionModel.crear({
          clave: `pago-${result.pago.IdPago}`,
          tipo: "Pago",
          titulo: result.saldoRestante <= 0 ? "Factura pagada" : "Abono registrado",
          mensaje: mensajeSaldo,
          ruta: "/pagos",
        });
      } catch (notificationError) {
        console.error("No se pudo crear la notificación del pago:", notificationError);
      }
      res.status(201).json({ success: true, ...result });
    } catch (error) {
      console.error("Error al registrar abono:", error);
      res.status(error.status || 500).json({ success: false, error: error.status ? error.message : "No se pudo registrar el abono." });
    }
  },
};

export default PagoController;
