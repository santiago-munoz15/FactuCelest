import { Router } from "express";
import { getAllC } from "../controller/CategoriaController.js";

const router = Router();

router.get("/listarcategorias", getAllC);

export default router;
