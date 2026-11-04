import { getConnection, sql } from "../config/db.js";

const NotificacionModel = {
  listar: async () => {
    const pool = await getConnection();
    const result = await pool.request().query(`
      INSERT INTO dbo.Notificaciones (Clave, Tipo, Titulo, Mensaje, Ruta)
      SELECT CONCAT('vence-pronto-', f.IdFactura), 'Vencimiento', 'Factura próxima a vencer',
        CONCAT('La factura #', f.IdFactura, ' de ', c.Nombre, ' vence el ', CONVERT(VARCHAR(10), f.FechaVencimiento, 103), '.'), '/pagos'
      FROM dbo.Facturas f
      INNER JOIN dbo.Clientes c ON c.Documento = f.IdClienteFK
      OUTER APPLY (SELECT SUM(p.Monto) AS Pagado FROM dbo.Pagos p WHERE p.IdFacturaFK = f.IdFactura) pagos
      WHERE f.FechaVencimiento >= CAST(GETDATE() AS date)
        AND f.FechaVencimiento <= DATEADD(day, 3, CAST(GETDATE() AS date))
        AND ISNULL(pagos.Pagado, 0) < f.Total
        AND NOT EXISTS (SELECT 1 FROM dbo.Notificaciones n WHERE n.Clave = CONCAT('vence-pronto-', f.IdFactura));

      INSERT INTO dbo.Notificaciones (Clave, Tipo, Titulo, Mensaje, Ruta)
      SELECT CONCAT('vencida-', f.IdFactura), 'Vencimiento', 'Factura vencida',
        CONCAT('La factura #', f.IdFactura, ' de ', c.Nombre, ' está vencida y tiene un saldo pendiente.'), '/pagos'
      FROM dbo.Facturas f
      INNER JOIN dbo.Clientes c ON c.Documento = f.IdClienteFK
      OUTER APPLY (SELECT SUM(p.Monto) AS Pagado FROM dbo.Pagos p WHERE p.IdFacturaFK = f.IdFactura) pagos
      WHERE f.FechaVencimiento < CAST(GETDATE() AS date)
        AND ISNULL(pagos.Pagado, 0) < f.Total
        AND NOT EXISTS (SELECT 1 FROM dbo.Notificaciones n WHERE n.Clave = CONCAT('vencida-', f.IdFactura));

      SELECT TOP (40) IdNotificacion, Tipo, Titulo, Mensaje, Ruta, Fecha, Leida
      FROM dbo.Notificaciones ORDER BY Fecha DESC, IdNotificacion DESC;
      SELECT COUNT(*) AS NoLeidas FROM dbo.Notificaciones WHERE Leida = 0;
    `);
    return { notificaciones: result.recordsets[0], noLeidas: result.recordsets[1][0]?.NoLeidas ?? 0 };
  },

  crear: async ({ clave, tipo, titulo, mensaje, ruta = "/pagos" }) => {
    const pool = await getConnection();
    await pool.request()
      .input("Clave", sql.VarChar(100), clave)
      .input("Tipo", sql.VarChar(30), tipo)
      .input("Titulo", sql.VarChar(150), titulo)
      .input("Mensaje", sql.VarChar(500), mensaje)
      .input("Ruta", sql.VarChar(100), ruta)
      .query(`IF NOT EXISTS (SELECT 1 FROM dbo.Notificaciones WITH (UPDLOCK, HOLDLOCK) WHERE Clave = @Clave)
        INSERT INTO dbo.Notificaciones (Clave, Tipo, Titulo, Mensaje, Ruta)
        VALUES (@Clave, @Tipo, @Titulo, @Mensaje, @Ruta);`);
  },

  marcarLeida: async (id) => {
    const pool = await getConnection();
    const result = await pool.request().input("Id", sql.BigInt, id)
      .query("UPDATE dbo.Notificaciones SET Leida = 1 WHERE IdNotificacion = @Id; SELECT @@ROWCOUNT AS Actualizadas;");
    return result.recordset[0]?.Actualizadas > 0;
  },

  marcarTodasLeidas: async () => {
    const pool = await getConnection();
    await pool.request().query("UPDATE dbo.Notificaciones SET Leida = 1 WHERE Leida = 0;");
  },
};

export default NotificacionModel;
