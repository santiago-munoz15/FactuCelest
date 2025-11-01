import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { getConnection } from "./config/db.js";

// 🔹 Importar rutas
import ProductoRouter from "./routes/ProductoRoutes.js";
import CategoriaRouter from "./routes/CategoriaRouter.js";
import ProveedorRouter from "./routes/ProveedorRouter.js";
import UsuarioRouter from "./routes/UsuarioRoutes.js"; // 👈 Nueva ruta para login/registro

const app = express();
dotenv.config();

app.use(cors());
app.use(express.json());

// 🔹 Rutas API
app.use("/api/productos", ProductoRouter);
app.use("/api/categorias", CategoriaRouter);
app.use("/api/proveedores", ProveedorRouter);
app.use("/api/usuarios", UsuarioRouter); // 👈 Aquí estará el login/registro/verificación

// 🔹 Iniciar servidor
app.listen(process.env.PORT, () => {
  console.log("✅ Servidor corriendo en el puerto:", process.env.PORT);
  getConnection();
});
