import express from "express";
import PagoController from "../controller/PagoController.js";

const router = express.Router();
router.get("/", PagoController.listar);
router.get("/:id/abonos", PagoController.listarAbonos);
router.post("/:id/abonos", PagoController.registrarAbono);

export default router;
