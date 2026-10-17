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
    IF COL_LENGTH('dbo.Clientes', 'Ciudad') IS NULL ALTER TABLE dbo.Clientes ADD Ciudad VARCHAR(100) NULL;
    IF COL_LENGTH('dbo.Clientes', 'Departamento') IS NULL ALTER TABLE dbo.Clientes ADD Departamento VARCHAR(100) NULL;
    IF COL_LENGTH('dbo.Clientes', 'TipoDocumento') IS NULL ALTER TABLE dbo.Clientes ADD TipoDocumento VARCHAR(10) NULL;
  `);

  // SQL Server compila cada lote antes de aplicar los ALTER TABLE anteriores.
  await pool.request().query(`
    UPDATE dbo.Clientes SET TipoDocumento = 'CC' WHERE TipoDocumento IS NULL;

    IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.Clientes') AND name = 'Documento' AND TYPE_NAME(user_type_id) <> 'varchar')
    BEGIN
      DECLARE @fkName sysname, @parentId int, @dropFk nvarchar(max);
      DECLARE fk_cursor CURSOR LOCAL FAST_FORWARD FOR
        SELECT name, parent_object_id FROM sys.foreign_keys WHERE referenced_object_id = OBJECT_ID('dbo.Clientes');
      OPEN fk_cursor;
      FETCH NEXT FROM fk_cursor INTO @fkName, @parentId;
      WHILE @@FETCH_STATUS = 0
      BEGIN
        SET @dropFk = N'ALTER TABLE ' + QUOTENAME(OBJECT_SCHEMA_NAME(@parentId)) + N'.' + QUOTENAME(OBJECT_NAME(@parentId)) + N' DROP CONSTRAINT ' + QUOTENAME(@fkName);
        EXEC sp_executesql @dropFk;
        FETCH NEXT FROM fk_cursor INTO @fkName, @parentId;
      END;
      CLOSE fk_cursor;
      DEALLOCATE fk_cursor;

      DECLARE @pkName sysname = (SELECT name FROM sys.key_constraints WHERE parent_object_id = OBJECT_ID('dbo.Clientes') AND type = 'PK');
      IF @pkName IS NOT NULL
      BEGIN
        SET @dropFk = N'ALTER TABLE dbo.Clientes DROP CONSTRAINT ' + QUOTENAME(@pkName);
        EXEC sp_executesql @dropFk;
      END;
      ALTER TABLE dbo.Clientes ALTER COLUMN Documento VARCHAR(30) NOT NULL;
      IF OBJECT_ID('dbo.Facturas', 'U') IS NOT NULL ALTER TABLE dbo.Facturas ALTER COLUMN IdClienteFK VARCHAR(30) NOT NULL;
      ALTER TABLE dbo.Clientes ADD CONSTRAINT PK_Clientes_Documento PRIMARY KEY (Documento);
      IF OBJECT_ID('dbo.Facturas', 'U') IS NOT NULL
        ALTER TABLE dbo.Facturas ADD CONSTRAINT FK_Facturas_Clientes_Documento FOREIGN KEY (IdClienteFK) REFERENCES dbo.Clientes(Documento);
    END;

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

    IF COL_LENGTH('dbo.Facturas', 'CondicionPago') IS NULL
      ALTER TABLE dbo.Facturas ADD CondicionPago VARCHAR(20) NULL;

    IF COL_LENGTH('dbo.Facturas', 'FechaVencimiento') IS NULL
      ALTER TABLE dbo.Facturas ADD FechaVencimiento DATE NULL;
  `);

  // Ejecuta esto después del ALTER TABLE: SQL Server compila cada lote antes de
  // ejecutarlo y no reconoce una columna recién agregada dentro del mismo lote.
  await pool.request().query(`
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
