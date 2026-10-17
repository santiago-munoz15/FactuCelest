import { getConnection, sql } from "../config/db.js";

const columnas = "Documento, TipoDocumento, Nombre, Telefono, Correo, Direccion, Departamento, Ciudad";
const ClienteModel = {
  listar: async () => {
    const pool = await getConnection();
    const result = await pool.request().query(`SELECT ${columnas} FROM dbo.Clientes ORDER BY Nombre`);
    return result.recordset;
  },
  buscarPorDocumento: async (documento) => {
    const pool = await getConnection();
    const result = await pool.request().input("Documento", sql.VarChar(30), documento)
      .query(`SELECT ${columnas} FROM dbo.Clientes WHERE Documento = @Documento`);
    return result.recordset[0];
  },
  buscarPorNombre: async (nombre) => {
    const pool = await getConnection();
    const result = await pool.request().input("Nombre", sql.VarChar(150), nombre.trim())
      .query(`SELECT ${columnas} FROM dbo.Clientes WHERE Nombre LIKE @Nombre + '%' ORDER BY Nombre`);
    return result.recordset;
  },
  actualizar: async (documento, data) => {
    const pool = await getConnection();
    const result = await pool.request()
      .input("Documento", sql.VarChar(30), documento)
      .input("Nombre", sql.VarChar(50), data.Nombre)
      .input("Telefono", sql.BigInt, data.Telefono ? Number(data.Telefono) : null)
      .input("Correo", sql.VarChar(100), data.Correo || null)
      .input("Direccion", sql.VarChar(150), data.Direccion || null)
      .input("Departamento", sql.VarChar(100), data.Departamento || null)
      .input("Ciudad", sql.VarChar(100), data.Ciudad || null)
      .query(`UPDATE dbo.Clientes SET Nombre = @Nombre, Telefono = @Telefono, Correo = @Correo,
        Direccion = @Direccion, Departamento = @Departamento, Ciudad = @Ciudad WHERE Documento = @Documento;
        SELECT ${columnas} FROM dbo.Clientes WHERE Documento = @Documento`);
    const cliente = result.recordset[0];
    return cliente ? { success: true, message: "Cliente actualizado correctamente", cliente }
      : { success: false, message: "Cliente no encontrado" };
  },
  eliminar: async (documento) => {
    const pool = await getConnection();
    const result = await pool.request().input("Documento", sql.VarChar(30), documento)
      .query("DELETE FROM dbo.Clientes WHERE Documento = @Documento");
    const success = result.rowsAffected[0] > 0;
    return { success, message: success ? "Cliente eliminado correctamente" : "Cliente no encontrado" };
  },
  crear: async (data) => {
    const pool = await getConnection();
    const result = await pool.request()
      .input("Documento", sql.VarChar(30), data.Documento.trim())
      .input("TipoDocumento", sql.VarChar(10), data.TipoDocumento)
      .input("Nombre", sql.VarChar(50), data.Nombre.trim())
      .input("Telefono", sql.BigInt, data.Telefono ? Number(data.Telefono) : null)
      .input("Correo", sql.VarChar(100), data.Correo?.trim() || null)
      .input("Direccion", sql.VarChar(150), data.Direccion?.trim() || null)
      .input("Departamento", sql.VarChar(100), data.Departamento?.trim() || null)
      .input("Ciudad", sql.VarChar(100), data.Ciudad?.trim() || null)
      .query(`IF EXISTS (SELECT 1 FROM dbo.Clientes WHERE Documento = @Documento)
        BEGIN
          UPDATE dbo.Clientes SET TipoDocumento = @TipoDocumento, Nombre = @Nombre, Telefono = @Telefono,
            Correo = @Correo, Direccion = @Direccion, Departamento = @Departamento, Ciudad = @Ciudad
          WHERE Documento = @Documento;
        END
        ELSE
        BEGIN
          INSERT INTO dbo.Clientes (Documento, TipoDocumento, Nombre, Telefono, Correo, Direccion, Departamento, Ciudad)
          VALUES (@Documento, @TipoDocumento, @Nombre, @Telefono, @Correo, @Direccion, @Departamento, @Ciudad);
        END
        SELECT ${columnas} FROM dbo.Clientes WHERE Documento = @Documento`);
    return { success: true, message: "Cliente registrado correctamente", cliente: result.recordset[0] };
  },
};

export default ClienteModel;
