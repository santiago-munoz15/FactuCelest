// src/routes/FacturaRoutes.js
import express from "express";
import FacturaController from "../controller/FacturaController.js";

const router = express.Router();

// POST /api/facturas/crear
router.post("/crear", FacturaController.crearFactura);

// GET /api/facturas/reporte
router.get("/reporte", FacturaController.obtenerFacturasReporte);

// GET /api/facturas/ultimas
router.get("/ultimas", FacturaController.obtenerUltimasFacturas);

// GET /api/facturas/detalle/:id
router.get("/detalle/:id", FacturaController.obtenerFacturaPorId);

// PUT /api/facturas/actualizar/:id
router.put("/actualizar/:id", FacturaController.actualizarFactura);

// GET /api/facturas/excel/:id
router.get("/excel/:id", FacturaController.descargarFacturaExcel);

// GET /api/facturas/ventas-mensuales
router.get("/ventas-mensuales", FacturaController.obtenerVentasMensuales);

export default router;
