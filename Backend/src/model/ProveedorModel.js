import { sql, getConnection } from "../config/db.js";

const getAllProveedor = async () => {
  const con = await getConnection();
  const result = await con.request().execute("spListarProveedor");
  return result.recordset;
};

const obtenerRequest = async () => {
  const con = await getConnection();
  return con.request();
};

const asignarCampos = (request, proveedor) => {
  request.input("NombreEmpresa", sql.VarChar(100), proveedor.NombreEmpresa);
  request.input("NombreContacto", sql.VarChar(100), proveedor.NombreContacto || null);
  request.input("Telefono", sql.BigInt, proveedor.Telefono ? Number(proveedor.Telefono) : null);
  request.input("Correo", sql.VarChar(100), proveedor.Correo || null);
  request.input("Direccion", sql.VarChar(150), proveedor.Direccion || null);
  request.input("CondicionesPago", sql.VarChar(200), proveedor.CondicionesPago || null);
};

const crearProveedor = async (proveedor) => {
  const request = await obtenerRequest();
  request.input("TaxId", sql.BigInt, Number(proveedor.TaxId));
  asignarCampos(request, proveedor);
  const result = await request.query(`
    INSERT INTO Proveedores (TaxId, NombreEmpresa, NombreContacto, Telefono, Correo, Direccion, CondicionesPago)
    OUTPUT INSERTED.*
    VALUES (@TaxId, @NombreEmpresa, @NombreContacto, @Telefono, @Correo, @Direccion, @CondicionesPago)
  `);
  return result.recordset[0];
};

const actualizarProveedor = async (taxId, proveedor) => {
  const request = await obtenerRequest();
  request.input("TaxId", sql.BigInt, Number(taxId));
  asignarCampos(request, proveedor);
  const result = await request.query(`
    UPDATE Proveedores
    SET NombreEmpresa = @NombreEmpresa, NombreContacto = @NombreContacto, Telefono = @Telefono,
        Correo = @Correo, Direccion = @Direccion, CondicionesPago = @CondicionesPago
    OUTPUT INSERTED.*
    WHERE TaxId = @TaxId
  `);
  return result.recordset[0];
};

const eliminarProveedor = async (taxId) => {
  const request = await obtenerRequest();
  request.input("TaxId", sql.BigInt, Number(taxId));
  await request.query("DELETE FROM Proveedores WHERE TaxId = @TaxId");
};

export { actualizarProveedor, crearProveedor, eliminarProveedor, getAllProveedor };
