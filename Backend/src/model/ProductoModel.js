import { sql, getConnection } from "../config/db.js";

// 🔹 Obtener todos los productos
const getAllProductos = async () => {
  const con = await getConnection();
  const resultado = await con.request().execute("spListarProductos");
  return resultado.recordset;
};

// 🔹 Insertar un producto nuevo
const getInsertarProducto = async (producto) => {
  const con = await getConnection();
  const resultado = await con
    .request()
    .input("Referencia", sql.VarChar(100), producto.Referencia)
    .input("Descripcion", sql.VarChar(255), producto.Descripcion)
    .input("Talla", sql.VarChar(10), producto.Talla)
    .input("PrecioVenta", sql.Decimal(10, 2), producto.PrecioVenta)
    .input("PrecioCompra", sql.Decimal(10, 2), producto.PrecioCompra)
    .input("IdCategoriaFK", sql.Int, producto.IdCategoriaFK)
    .input("TaxIdFK", sql.Int, producto.TaxIdFK)
    .execute("spInsertarProducto");

  return resultado.recordset;
};

// 🔹 Actualizar un producto existente
const getUpdateProducto = async (id, data) => {
  const con = await getConnection();
  const {
    Referencia,
    Descripcion,
    Talla,
    PrecioVenta,
    PrecioCompra,
    IdCategoriaFK,
    TaxIdFK,
  } = data;

  console.log("🧩 Datos recibidos para actualizar:", data);

  const resultado = await con
    .request()
    .input("IdProducto", sql.Int, id)
    .input("Referencia", sql.VarChar(100), Referencia)
    .input("Descripcion", sql.VarChar(255), Descripcion)
    .input("Talla", sql.VarChar(10), Talla)
    .input("PrecioVenta", sql.Decimal(10, 2), PrecioVenta)
    .input("PrecioCompra", sql.Decimal(10, 2), PrecioCompra)
    .input("IdCategoriaFK", sql.Int, IdCategoriaFK)
    .input("TaxIdFK", sql.Int, TaxIdFK)
    .execute("spActualizarProducto");

  return resultado.recordset;
};

// 🔹 Eliminar producto
const getDeleteProducto = async (id) => {
  const con = await getConnection();
  const resultado = await con
    .request()
    .input("IdProducto", sql.Int, id)
    .execute("spEliminarProducto");

  return resultado.rowsAffected; // opcional
};

// ✅ Exportación correcta y uniforme
export {
  getAllProductos,
  getInsertarProducto,
  getUpdateProducto,
  getDeleteProducto,
};
