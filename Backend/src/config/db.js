import sql from "mssql";
import dotenv from "dotenv";

dotenv.config();

const dbSettings = {
  user: process.env.USER,
  password: process.env.PASSWORD,
  server: process.env.SERVER,
  database: process.env.DATABASE,
  options: {
    trustServerCertificate: true, // Evita errores de SSL en entornos locales
  },
};

// Función para obtener la conexión (pool)
export const getConnection = async () => {
  try {
    const pool = await sql.connect(dbSettings);
    console.log("✅ Conectado correctamente a la base de datos");
    return pool;
  } catch (err) {
    console.error("❌ Error de conexión a la BD:", err);
    throw err;
  }
};

// Exporta también sql para usar los tipos (VarChar, Int, etc.)
export { sql };
