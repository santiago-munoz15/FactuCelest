import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { getConnection } from "./config/db.js";
import router from "./routes/ProductoRoutes.js";
import CategoriaRouter from "./routes/CategoriaRouter.js";
import ProveedorRouter from "./routes/ProveedorRouter.js";

const app = express();

dotenv.config();

app.use(cors());
app.use(express.json());
app.use("/", router);
app.use("/", CategoriaRouter);
app.use("/", ProveedorRouter);
app.listen(process.env.PORT, () => {
  console.log("Conectado al puerto #: " + process.env.PORT);
  getConnection;
});
