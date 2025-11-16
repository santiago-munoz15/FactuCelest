import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { getConnection } from "./config/db.js";
import ClienteRoutes from "./routes/ClienteRoutes.js";

// 🔹 Importar rutas
import ProductoRouter from "./routes/ProductoRoutes.js";
import CategoriaRouter from "./routes/CategoriaRouter.js";
import ProveedorRouter from "./routes/ProveedorRouter.js";
import UsuarioRouter from "./routes/UsuarioRoutes.js";
import FacturaRouter from "./routes/FacturaRoutes.js";

const app = express();
dotenv.config();

app.use(cors());
app.use(express.json());

// 🔹 Rutas API
app.use("/api/productos", ProductoRouter);
app.use("/api/categorias", CategoriaRouter);
app.use("/api/proveedores", ProveedorRouter);
app.use("/api/usuarios", UsuarioRouter);
app.use("/api/clientes", ClienteRoutes);
app.use("/api/facturas", FacturaRouter);

// 🔹 Iniciar servidor
app.listen(process.env.PORT, () => {
  console.log("✅ Servidor corriendo en el puerto:", process.env.PORT);
  getConnection();
});
