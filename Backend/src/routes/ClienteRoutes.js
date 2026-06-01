import express from "express";
import ClienteController from "../controller/ClienteController.js";

const router = express.Router();

// 🔹 Listar clientes
router.get("/listar", ClienteController.listarClientes);

// 🔹 Buscar cliente por documento
router.get("/buscar", ClienteController.buscarCliente);

// 🔹 Buscar cliente por documento
router.get("/buscar/:documento", ClienteController.buscarCliente);

// 🔹 Actualizar cliente
router.put("/actualizar/:documento", ClienteController.actualizarCliente);

// 🔹 Eliminar cliente
router.delete("/eliminar/:documento", ClienteController.eliminarCliente);

// 🔹 Crear cliente nuevo
router.post("/crear", ClienteController.crearCliente);

export default router;
