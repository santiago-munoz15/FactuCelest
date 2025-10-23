import { sql, getConnection } from "../config/db.js";

const getAllProductos = async () => {
  const con = await getConnection;
<<<<<<< HEAD
  const resultado = await con.request().execute("spListarProductos");
=======
  const resultado = await con.request().execute("splistarproductos");
>>>>>>> 5c17b0152674b45fd63353cf41f3523408cae730
  return resultado.recordset;
};
export { getAllProductos };
