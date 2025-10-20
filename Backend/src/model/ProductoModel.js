import { sql, getConnection } from "../config/db.js";

const getAllProductos = async () => {
  const con = await getConnection;
  const resultado = await con.request().execute("sp_listar_productos");
  return resultado.recordset;
};
export { getAllProductos };
