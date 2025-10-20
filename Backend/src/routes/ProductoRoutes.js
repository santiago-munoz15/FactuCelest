import { getAllP } from "../controller/productoController.js";
import { Router } from "express";
const router = Router();

router.get("/listarp", getAllP);

export default router;
