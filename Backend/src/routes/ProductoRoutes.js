import { getAllP } from "../controller/ProductoController.js";
import { Router } from "express";
const router = Router();

router.get("/listarp", getAllP);

export default router;
