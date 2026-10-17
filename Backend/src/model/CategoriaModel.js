import { getConnection, sql } from "../config/db.js";

const getAllCategorias = async () => {
  const con = await getConnection();
  const result = await con.request().query("SELECT IdCategoria, NombreCategoria, Descripcion FROM dbo.Categorias ORDER BY NombreCategoria");
  return result.recordset;
};

const crearCategoria = async ({ NombreCategoria, Descripcion }) => {
  const con = await getConnection();
  const transaction = new sql.Transaction(con);
  await transaction.begin(sql.ISOLATION_LEVEL.SERIALIZABLE);
  try {
    const request = new sql.Request(transaction);
    request.input("NombreCategoria", sql.VarChar(50), NombreCategoria.trim());
    request.input("Descripcion", sql.VarChar(200), Descripcion?.trim() || null);
    const result = await request.query(`
      DECLARE @IdCategoria BIGINT = ISNULL((SELECT MAX(IdCategoria) FROM dbo.Categorias WITH (UPDLOCK, HOLDLOCK)), 0) + 1;
      INSERT INTO dbo.Categorias (IdCategoria, NombreCategoria, Descripcion)
      OUTPUT INSERTED.*
      VALUES (@IdCategoria, @NombreCategoria, @Descripcion);
    `);
    await transaction.commit();
    return result.recordset[0];
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const actualizarCategoria = async (id, { NombreCategoria, Descripcion }) => {
  const con = await getConnection();
  const result = await con.request()
    .input("IdCategoria", sql.BigInt, Number(id))
    .input("NombreCategoria", sql.VarChar(50), NombreCategoria.trim())
    .input("Descripcion", sql.VarChar(200), Descripcion?.trim() || null)
    .query(`UPDATE dbo.Categorias SET NombreCategoria = @NombreCategoria, Descripcion = @Descripcion
      OUTPUT INSERTED.* WHERE IdCategoria = @IdCategoria`);
  return result.recordset[0];
};

const eliminarCategoria = async (id) => {
  const con = await getConnection();
  const result = await con.request().input("IdCategoria", sql.BigInt, Number(id))
    .query("DELETE FROM dbo.Categorias WHERE IdCategoria = @IdCategoria");
  return result.rowsAffected[0] > 0;
};

export { actualizarCategoria, crearCategoria, eliminarCategoria, getAllCategorias };
