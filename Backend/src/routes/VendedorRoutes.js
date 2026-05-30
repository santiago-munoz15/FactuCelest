import express from "express";
import VendedorController from "../controller/VendedorController.js";

const router = express.Router();

router.get("/", VendedorController.listar);
router.post("/", VendedorController.crear);

export default router;