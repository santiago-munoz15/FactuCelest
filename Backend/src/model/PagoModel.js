import { getConnection, sql } from "../config/db.js";

const PagoModel = {
  listarFacturas: async ({ estado = "", busqueda = "" } = {}) => {
    const pool = await getConnection();
    const result = await pool.request()
      .input("Estado", sql.VarChar(20), estado)
      .input("Busqueda", sql.VarChar(120), busqueda.trim())
      .query(`
        WITH ResumenPagos AS (
          SELECT IdFacturaFK, SUM(Monto) AS MontoPagado, MAX(FechaPago) AS UltimoPago
          FROM dbo.Pagos
          GROUP BY IdFacturaFK
        ), Saldos AS (
          SELECT f.IdFactura, f.Fecha, COALESCE(f.FechaVencimiento, DATEADD(day, 30, CAST(f.Fecha AS date))) AS FechaVencimiento,
            f.Total, f.MetodoPago, c.Documento AS DocumentoCliente, c.Nombre AS NombreCliente,
            COALESCE(r.MontoPagado, 0) AS MontoPagado, r.UltimoPago,
            CASE WHEN f.Total - COALESCE(r.MontoPagado, 0) <= 0 THEN 'Pagada'
              WHEN COALESCE(f.FechaVencimiento, DATEADD(day, 30, CAST(f.Fecha AS date))) < CAST(GETDATE() AS date) THEN 'Vencida'
              WHEN COALESCE(r.MontoPagado, 0) > 0 THEN 'Abonada'
              ELSE 'Pendiente' END AS Estado
          FROM dbo.Facturas f
          INNER JOIN dbo.Clientes c ON c.Documento = f.IdClienteFK
          LEFT JOIN ResumenPagos r ON r.IdFacturaFK = f.IdFactura
        )
        SELECT *, CASE WHEN Total - MontoPagado < 0 THEN 0 ELSE Total - MontoPagado END AS Saldo
        FROM Saldos
        WHERE (@Estado = '' OR Estado = @Estado)
          AND (@Busqueda = '' OR CONVERT(VARCHAR(30), IdFactura) LIKE '%' + @Busqueda + '%'
            OR NombreCliente LIKE '%' + @Busqueda + '%' OR CONVERT(VARCHAR(30), DocumentoCliente) LIKE '%' + @Busqueda + '%')
        ORDER BY CASE WHEN Estado = 'Vencida' THEN 0 WHEN Estado IN ('Pendiente','Abonada') THEN 1 ELSE 2 END,
          FechaVencimiento ASC, Fecha DESC;
      `);
    return result.recordset;
  },

  listarAbonos: async (idFactura) => {
    const pool = await getConnection();
    const result = await pool.request()
      .input("IdFactura", sql.BigInt, idFactura)
      .query(`SELECT IdPago, IdFacturaFK, FechaPago, Monto, MetodoPago, Pagador, Observaciones
        FROM dbo.Pagos WHERE IdFacturaFK = @IdFactura ORDER BY FechaPago DESC, IdPago DESC`);
    return result.recordset;
  },

  registrarAbono: async ({ idFactura, monto, metodoPago, pagador, observaciones }) => {
    const pool = await getConnection();
    const transaction = new sql.Transaction(pool);
    try {
      await transaction.begin();
      const resumen = await transaction.request()
        .input("IdFactura", sql.BigInt, idFactura)
        .query(`SELECT f.Total, COALESCE(SUM(p.Monto), 0) AS MontoPagado
          FROM dbo.Facturas f WITH (UPDLOCK, HOLDLOCK)
          LEFT JOIN dbo.Pagos p ON p.IdFacturaFK = f.IdFactura
          WHERE f.IdFactura = @IdFactura GROUP BY f.Total`);
      const factura = resumen.recordset[0];
      if (!factura) throw Object.assign(new Error("No existe esa factura."), { status: 404 });
      const saldo = Math.max(0, Number(factura.Total) - Number(factura.MontoPagado));
      if (monto > saldo + 0.001) {
        throw Object.assign(new Error(`El abono supera el saldo pendiente de ${saldo.toFixed(2)}.`), { status: 400 });
      }

      const insertado = await transaction.request()
        .input("IdFactura", sql.BigInt, idFactura)
        .input("Monto", sql.Decimal(18, 2), monto)
        .input("MetodoPago", sql.VarChar(30), metodoPago)
        .input("Pagador", sql.VarChar(150), pagador || null)
        .input("Observaciones", sql.VarChar(500), observaciones || null)
        .query(`INSERT INTO dbo.Pagos (IdFacturaFK, Monto, MetodoPago, Pagador, Observaciones)
          OUTPUT INSERTED.IdPago, INSERTED.IdFacturaFK, INSERTED.FechaPago, INSERTED.Monto,
            INSERTED.MetodoPago, INSERTED.Pagador, INSERTED.Observaciones
          VALUES (@IdFactura, @Monto, @MetodoPago, @Pagador, @Observaciones)`);
      await transaction.commit();
      return { pago: insertado.recordset[0], saldoRestante: saldo - monto };
    } catch (error) {
      try { await transaction.rollback(); } catch { /* La transacción puede haberse revertido al fallar. */ }
      throw error;
    }
  },
};

export default PagoModel;
