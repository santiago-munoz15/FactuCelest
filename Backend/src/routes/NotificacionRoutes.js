import express from "express";
import NotificacionController from "../controller/NotificacionController.js";

const router = express.Router();
router.get("/", NotificacionController.listar);
router.patch("/leer-todas", NotificacionController.marcarTodasLeidas);
router.patch("/:id/leer", NotificacionController.marcarLeida);

export default router;
