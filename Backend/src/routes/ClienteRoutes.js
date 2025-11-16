import express from "express";
import ClienteController from "../controller/ClienteController.js";

const router = express.Router();

// 🔹 Buscar cliente por documento
router.get("/buscar/:documento", ClienteController.buscarCliente);

// 🔹 Crear cliente nuevo
router.post("/crear", ClienteController.crearCliente);

export default router;
