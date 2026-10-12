import sql from "mssql";
import dotenv from "dotenv";

dotenv.config();

const dbSettings = {
  user: process.env.DB_USER || process.env.SQL_USER || process.env.USER,
  password: process.env.DB_PASSWORD || process.env.SQL_PASSWORD || process.env.PASSWORD,
  server: process.env.DB_SERVER || process.env.SQL_SERVER || process.env.SERVER,
  database: process.env.DB_NAME || process.env.SQL_DATABASE || process.env.DATABASE,
  port: Number(process.env.DB_PORT || process.env.SQL_PORT || 1433),
  options: {
    encrypt: true,
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === "true" || process.env.NODE_ENV !== "production",
  },
};

let schemaReadyPromise = null;

const ensureSchema = async (pool) => {
  await pool.request().query(`
    IF COL_LENGTH('dbo.Clientes', 'Ciudad') IS NULL
      ALTER TABLE dbo.Clientes ADD Ciudad VARCHAR(100) NULL;

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
      ALTER TABLE dbo.Facturas ADD NombreVendedor VARCHAR(150) NULL;

    IF COL_LENGTH('dbo.Facturas', 'TelefonoVendedor') IS NULL
      ALTER TABLE dbo.Facturas ADD TelefonoVendedor VARCHAR(30) NULL;

    IF COL_LENGTH('dbo.Facturas', 'Observaciones') IS NULL
      ALTER TABLE dbo.Facturas ADD Observaciones VARCHAR(500) NULL;

    IF COL_LENGTH('dbo.Facturas', 'FechaVencimiento') IS NULL
      ALTER TABLE dbo.Facturas ADD FechaVencimiento DATE NULL;

    UPDATE dbo.Facturas
    SET FechaVencimiento = DATEADD(day, 30, CAST(Fecha AS date))
    WHERE FechaVencimiento IS NULL AND Fecha IS NOT NULL;

    IF OBJECT_ID('dbo.Pagos', 'U') IS NULL
    BEGIN
      CREATE TABLE dbo.Pagos (
        IdPago BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        IdFacturaFK BIGINT NOT NULL,
        FechaPago DATETIME NOT NULL DEFAULT(GETDATE()),
        Monto DECIMAL(18,2) NOT NULL CHECK (Monto > 0),
        MetodoPago VARCHAR(30) NOT NULL,
        Pagador VARCHAR(150) NULL,
        Observaciones VARCHAR(500) NULL,
        CONSTRAINT FK_Pagos_Facturas FOREIGN KEY (IdFacturaFK) REFERENCES dbo.Facturas(IdFactura)
      );
      CREATE INDEX IX_Pagos_IdFacturaFK_FechaPago ON dbo.Pagos(IdFacturaFK, FechaPago);
    END;
  `);
};

export const getConnection = async () => {
  try {
    return await sql.connect(dbSettings);
  } catch (error) {
    console.error("Error de conexión a la base de datos:", error);
    throw error;
  }
};

export const ensureDatabaseSchema = async () => {
  if (!schemaReadyPromise) {
    schemaReadyPromise = getConnection()
      .then(ensureSchema)
      .catch((error) => {
        schemaReadyPromise = null;
        throw error;
      });
  }

  return schemaReadyPromise;
};

export { sql };
