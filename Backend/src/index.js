import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { ensureDatabaseSchema } from "./config/db.js";
import ClienteRoutes from "./routes/ClienteRoutes.js";
import ProductoRouter from "./routes/ProductoRoutes.js";
import CategoriaRouter from "./routes/CategoriaRouter.js";
import ProveedorRouter from "./routes/ProveedorRouter.js";
import UsuarioRouter from "./routes/UsuarioRoutes.js";
import VendedorRouter from "./routes/VendedorRoutes.js";
import FacturaRouter from "./routes/FacturaRoutes.js";
import PagoRoutes from "./routes/PagoRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.get("/health", (_req, res) => res.status(200).json({ status: "ok" }));

app.use("/api/productos", ProductoRouter);
app.use("/api/categorias", CategoriaRouter);
app.use("/api/proveedores", ProveedorRouter);
app.use("/api/usuarios", UsuarioRouter);
app.use("/api/vendedores", VendedorRouter);
app.use("/api/clientes", ClienteRoutes);
app.use("/api/facturas", FacturaRouter);
app.use("/api/pagos", PagoRoutes);

const port = Number(process.env.PORT) || 3000;

const startServer = async () => {
  try {
    await ensureDatabaseSchema();
    app.listen(port, () => console.log(`Servidor listo en el puerto ${port}`));
  } catch (error) {
    console.error("No se pudo iniciar el servidor porque falló la base de datos:", error);
    process.exitCode = 1;
  }
};

startServer();
