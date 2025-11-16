// src/routes/FacturaRoutes.js
import express from "express";
import FacturaController from "../controller/FacturaController.js";

const router = express.Router();

// POST /api/facturas/crear
router.post("/crear", FacturaController.crearFactura);

// GET /api/facturas/ultimas
router.get("/ultimas", FacturaController.obtenerUltimasFacturas);

// GET /api/facturas/ventas-mensuales
router.get("/ventas-mensuales", FacturaController.obtenerVentasMensuales);

export default router;
