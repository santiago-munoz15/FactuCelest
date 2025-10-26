import { sql, getConnection } from "../config/db.js";

const getAllProveedor = async () => {
  const con = await getConnection;
  const result = await con.request().execute("spListarProveedor");
  return result.recordset;
};

export { getAllProveedor };
