import { Router } from "express";
import { actualizarCategoria, crearCategoria, eliminarCategoria, getAllC } from "../controller/CategoriaController.js";

const router = Router();

router.get("/listarcategorias", getAllC);
router.post("/crear", crearCategoria);
router.put("/actualizar/:id", actualizarCategoria);
router.delete("/eliminar/:id", eliminarCategoria);

export default router;
