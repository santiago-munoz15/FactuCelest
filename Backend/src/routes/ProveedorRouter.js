import { Router } from "express";
import { getAllProv } from "../controller/ProveedorController.js";

const router = Router();

router.get("/listarproveedor", getAllProv);

export default router;
