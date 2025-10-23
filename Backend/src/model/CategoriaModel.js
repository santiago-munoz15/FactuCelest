import { sql, getConnection } from "../config/db.js";

const getAllCategorias = async () => {
  const con = await getConnection;
  const result = await con.request().execute("spListarCategorias");
  return result.recordset;
};

export { getAllCategorias };
