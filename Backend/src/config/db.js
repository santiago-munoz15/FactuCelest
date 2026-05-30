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

let schemaReadyPromise = null;

const ensureSchema = async (pool) => {
  await pool.request().query(`
    IF OBJECT_ID('dbo.Vendedores', 'U') IS NULL
    BEGIN
      CREATE TABLE dbo.Vendedores (
        IdVendedor BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        Nombre VARCHAR(150) NOT NULL UNIQUE,
        Telefono VARCHAR(30) NOT NULL,
        FechaRegistro DATETIME NOT NULL DEFAULT(GETDATE())
      );
    END;

    IF COL_LENGTH('dbo.Facturas', 'NombreVendedor') IS NULL
    BEGIN
      ALTER TABLE dbo.Facturas ADD NombreVendedor VARCHAR(150) NULL;
    END;

    IF COL_LENGTH('dbo.Facturas', 'TelefonoVendedor') IS NULL
    BEGIN
      ALTER TABLE dbo.Facturas ADD TelefonoVendedor VARCHAR(30) NULL;
    END;
  `);
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

export const ensureDatabaseSchema = async () => {
  if (!schemaReadyPromise) {
    schemaReadyPromise = getConnection().then((pool) => ensureSchema(pool));
  }

  return schemaReadyPromise;
};

// Exporta también sql para usar los tipos (VarChar, Int, etc.)
export { sql };
