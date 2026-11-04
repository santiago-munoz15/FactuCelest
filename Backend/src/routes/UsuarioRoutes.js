import express from "express";
import {
  Login,
  Registrar,
  ReenviarCodigo,
  Verificar,
} from "../controller/UsuarioController.js";

const UsuarioRouter = express.Router();

// 🔹 Rutas para autenticación y registro
UsuarioRouter.post("/login", Login);
UsuarioRouter.post("/registrar", Registrar);
UsuarioRouter.post("/reenviar-codigo", ReenviarCodigo);
UsuarioRouter.post("/verificar", Verificar);

export default UsuarioRouter;
