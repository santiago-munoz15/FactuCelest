import { sql, getConnection } from "../config/db.js";

const getAllProductos = async () => {
  const con = await getConnection;
  const resultado = await con.request().execute("splistarproductos");
  return resultado.recordset;
};
export { getAllProductos };
