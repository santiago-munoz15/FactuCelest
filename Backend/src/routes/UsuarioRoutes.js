import express from "express";
import {
  Login,
  Registrar,
  Verificar,
} from "../controller/UsuarioController.js";

const UsuarioRouter = express.Router();

// 🔹 Rutas para autenticación y registro
UsuarioRouter.post("/login", Login);
UsuarioRouter.post("/registrar", Registrar);
UsuarioRouter.post("/verificar", Verificar);

export default UsuarioRouter;
