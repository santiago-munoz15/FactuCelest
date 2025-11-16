import {
  getAllP,
  buscarP,
  getInsertarProducto,
  updateP,
  deleteP,
} from "../controller/ProductoController.js";
import { Router } from "express";

const router = Router();

// 🔹 Rutas del CRUD de Productos
router.get("/listarp", getAllP);
router.get("/buscar", buscarP);
router.post("/insertarp", getInsertarProducto);
router.put("/actualizarp/:id", updateP);
router.delete("/eliminarp/:id", deleteP);

export default router;
