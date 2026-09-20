import { Router } from "express";
import {
	crearProveedor,
	eliminarProveedor,
	getAllProv,
	actualizarProveedor,
} from "../controller/ProveedorController.js";

const router = Router();

router.get("/listarproveedor", getAllProv);
router.post("/crear", crearProveedor);
router.put("/actualizar/:taxId", actualizarProveedor);
router.delete("/eliminar/:taxId", eliminarProveedor);

export default router;
