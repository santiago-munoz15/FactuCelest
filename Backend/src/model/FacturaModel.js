// src/model/FacturaModel.js
import { getConnection, sql } from "../config/db.js";

const normalizarDetalle = (detalle = []) =>
  detalle
    .map((item) => {
      const cantidad = Number(item.Cantidad ?? item.cantidad ?? 0);
      const precioUnitario = Number(
        item.PrecioUnitario ??
          item.PrecioVenta ??
          item.precioUnitario ??
          item.precioVenta ??
          0
      );

      return {
        IdProducto: Number(item.IdProducto ?? item.idProducto ?? item.id_producto),
        Descripcion: item.Descripcion ?? item.descripcion ?? "",
        Talla: item.Talla ?? item.talla ?? "",
        Cantidad: cantidad,
        PrecioUnitario: precioUnitario,
        Subtotal: Number(
          item.Subtotal ?? item.Total ?? item.subtotal ?? item.total ?? cantidad * precioUnitario
        ),
      };
    })
    .filter(
      (item) => Number.isFinite(item.IdProducto) && item.IdProducto > 0 && item.Cantidad > 0
    );

const obtenerSiguienteIdDetalle = async (transaction) => {
  const result = await transaction
    .request()
    .query("SELECT ISNULL(MAX(IdDetalleFactura), 0) AS MaxId FROM DetalleFactura WITH (UPDLOCK, HOLDLOCK)");

  return Number(result.recordset[0]?.MaxId ?? 0) + 1;
};

const construirFiltroFacturas = ({ periodo, desde, hasta, busqueda }) => {
  const condiciones = [];
  const params = {};

  if (periodo === "dia") {
    condiciones.push("CAST(f.Fecha AS date) = CAST(GETDATE() AS date)");
  } else if (periodo === "mes") {
    condiciones.push("YEAR(f.Fecha) = YEAR(GETDATE())");
    condiciones.push("MONTH(f.Fecha) = MONTH(GETDATE())");
  } else if (periodo === "rango" && desde && hasta) {
    params.desde = new Date(`${desde}T00:00:00`);
    params.hasta = new Date(`${hasta}T23:59:59.999`);
    condiciones.push("f.Fecha >= @Desde");
    condiciones.push("f.Fecha <= @Hasta");
  }

  if (busqueda) {
    params.busqueda = busqueda;
    condiciones.push(
      "(CONVERT(VARCHAR(30), f.IdFactura) LIKE '%' + @Busqueda + '%' OR CONVERT(VARCHAR(30), c.Documento) LIKE '%' + @Busqueda + '%' OR c.Nombre LIKE '%' + @Busqueda + '%')"
    );
  }

  return { condiciones, params };
};

const FacturaModel = {
  crearFactura: async (factura) => {
    const pool = await getConnection();
    const transaction = new sql.Transaction(pool);

    try {
      const {
        DocumentoCliente,
        Subtotal,
        Iva,
        Total,
        MetodoPago = "Crédito 30 días",
        NombreVendedor = null,
        TelefonoVendedor = null,
        Observaciones = null,
        Detalle = [],
      } = factura;

      const detalleNormalizado = normalizarDetalle(Detalle);

      await transaction.begin();

      const facturaCreada = await transaction
        .request()
        .input("DocumentoCliente", sql.BigInt, DocumentoCliente)
        .input("Subtotal", sql.Decimal(18, 2), Subtotal)
        .input("Impuesto", sql.Decimal(18, 2), Iva)
        .input("Total", sql.Decimal(18, 2), Total)
        .input("MetodoPago", sql.VarChar(50), MetodoPago)
        .input("NombreVendedor", sql.VarChar(150), NombreVendedor)
        .input("TelefonoVendedor", sql.VarChar(30), TelefonoVendedor)
        .input("Observaciones", sql.VarChar(500), Observaciones)
        .query(`
          INSERT INTO Facturas (
            IdClienteFK,
            Fecha,
            FechaVencimiento,
            Subtotal,
            Impuesto,
            Total,
            MetodoPago,
            NombreVendedor,
            TelefonoVendedor,
            Observaciones
          )
          OUTPUT INSERTED.IdFactura
          VALUES (
            @DocumentoCliente,
            GETDATE(),
            DATEADD(day, 30, CAST(GETDATE() AS date)),
            @Subtotal,
            @Impuesto,
            @Total,
            @MetodoPago,
            @NombreVendedor,
            @TelefonoVendedor,
            @Observaciones
          )
        `);

      const IdFactura = facturaCreada.recordset[0]?.IdFactura;

      if (!IdFactura) {
        throw new Error("No fue posible obtener el ID de la factura creada");
      }

      if (detalleNormalizado.length > 0) {
        let siguienteIdDetalle = await obtenerSiguienteIdDetalle(transaction);

        for (const item of detalleNormalizado) {
          await transaction
            .request()
            .input("IdDetalleFactura", sql.BigInt, siguienteIdDetalle)
            .input("IdFacturaFK", sql.BigInt, IdFactura)
            .input("IdProductoFK", sql.BigInt, item.IdProducto)
            .input("Cantidad", sql.Int, item.Cantidad)
            .input("PrecioUnitario", sql.Decimal(10, 2), item.PrecioUnitario)
            .input("Subtotal", sql.Decimal(10, 2), item.Subtotal)
            .query(`
              INSERT INTO DetalleFactura (
                IdDetalleFactura,
                IdFacturaFK,
                IdProductoFK,
                Cantidad,
                PrecioUnitario,
                Subtotal
              )
              VALUES (
                @IdDetalleFactura,
                @IdFacturaFK,
                @IdProductoFK,
                @Cantidad,
                @PrecioUnitario,
                @Subtotal
              )
            `);

          siguienteIdDetalle += 1;
        }
      }

      await transaction.commit();
      return { success: true, IdFactura };
    } catch (error) {
      try {
        await transaction.rollback();
      } catch (rollbackError) {
        console.error("❌ Error al deshacer la transacción de factura:", rollbackError);
      }

      console.error("❌ Error al crear factura:", error);
      return { success: false, error: error.message };
    }
  },

  obtenerUltimasFacturas: async (cantidad = 10) => {
    try {
      const pool = await getConnection();

      const result = await pool
        .request()
        .input("Cantidad", sql.Int, cantidad)
        .execute("spObtenerUltimasFacturas");

      return { success: true, facturas: result.recordset };
    } catch (error) {
      console.error("❌ Error al obtener facturas:", error);
      return { success: false, error: error.message };
    }
  },

  obtenerVentasMensuales: async (anio = null, mes = null) => {
    try {
      const pool = await getConnection();

      const result = await pool
        .request()
        .input("Anio", sql.Int, anio)
        .input("Mes", sql.Int, mes)
        .execute("spObtenerVentasMensuales");

      return { success: true, ventas: result.recordset };
    } catch (error) {
      console.error("❌ Error al obtener ventas mensuales:", error);
      return { success: false, error: error.message };
    }
  },

  obtenerFacturasReporte: async ({ periodo = "todos", desde = null, hasta = null, busqueda = "" } = {}) => {
    try {
      const pool = await getConnection();
      const { condiciones, params } = construirFiltroFacturas({
        periodo,
        desde,
        hasta,
        busqueda: busqueda?.trim(),
      });

      const request = pool.request();

      if (params.desde) {
        request.input("Desde", sql.DateTime, params.desde);
      }

      if (params.hasta) {
        request.input("Hasta", sql.DateTime, params.hasta);
      }

      if (params.busqueda) {
        request.input("Busqueda", sql.VarChar(100), params.busqueda);
      }

      const query = `
        SELECT
          f.IdFactura,
          f.Fecha,
          f.Subtotal,
          f.Impuesto,
          f.Total,
          f.MetodoPago,
          f.NombreVendedor,
          f.TelefonoVendedor,
          f.Observaciones,
          c.Documento AS DocumentoCliente,
          c.Nombre AS NombreCliente,
          c.Telefono AS TelefonoCliente,
          c.Correo AS CorreoCliente,
          c.Direccion AS DireccionCliente,
          COALESCE(SUM(df.Cantidad), 0) AS CantidadProductos,
          COALESCE(SUM(df.Subtotal), 0) AS TotalDetalle
        FROM Facturas f
        INNER JOIN Clientes c ON f.IdClienteFK = c.Documento
        LEFT JOIN DetalleFactura df ON df.IdFacturaFK = f.IdFactura
        ${condiciones.length > 0 ? `WHERE ${condiciones.join(" AND ")}` : ""}
        GROUP BY
          f.IdFactura,
          f.Fecha,
          f.Subtotal,
          f.Impuesto,
          f.Total,
          f.MetodoPago,
          f.NombreVendedor,
          f.TelefonoVendedor,
          f.Observaciones,
          c.Documento,
          c.Nombre,
          c.Telefono,
          c.Correo,
          c.Direccion
        ORDER BY f.Fecha DESC, f.IdFactura DESC;
      `;

      const result = await request.query(query);
      return { success: true, facturas: result.recordset };
    } catch (error) {
      console.error("❌ Error al obtener reporte de facturas:", error);
      return { success: false, error: error.message };
    }
  },

  obtenerFacturaPorId: async (idFactura) => {
    try {
      const pool = await getConnection();
      const result = await pool
        .request()
        .input("IdFactura", sql.BigInt, idFactura)
        .query(`
          SELECT
            f.IdFactura,
            f.Fecha,
            f.Subtotal,
            f.Impuesto,
            f.Total,
            f.MetodoPago,
            f.NombreVendedor,
            f.TelefonoVendedor,
            f.Observaciones,
            c.Documento AS DocumentoCliente,
            c.Nombre AS NombreCliente,
            c.Ciudad AS CiudadCliente,
            c.Telefono AS TelefonoCliente,
            c.Correo AS CorreoCliente,
            c.Direccion AS DireccionCliente
          FROM Facturas f
          INNER JOIN Clientes c ON f.IdClienteFK = c.Documento
          WHERE f.IdFactura = @IdFactura;

          SELECT
            df.IdDetalleFactura,
            df.IdProductoFK,
            df.Cantidad,
            df.PrecioUnitario,
            df.Subtotal,
            p.Referencia,
            p.Descripcion,
            p.Talla
          FROM DetalleFactura df
          LEFT JOIN Productos p ON p.IdProducto = df.IdProductoFK
          WHERE df.IdFacturaFK = @IdFactura
          ORDER BY df.IdDetalleFactura;
        `);

      const factura = result.recordsets[0]?.[0] ?? null;
      const detalle = result.recordsets[1] ?? [];

      if (!factura) {
        return { success: false, error: "Factura no encontrada" };
      }

      return { success: true, factura: { ...factura, Detalle: detalle } };
    } catch (error) {
      console.error("❌ Error al obtener factura por ID:", error);
      return { success: false, error: error.message };
    }
  },

  actualizarFactura: async (idFactura, factura) => {
    const pool = await getConnection();
    const transaction = new sql.Transaction(pool);

    try {
      const {
        DocumentoCliente,
        Subtotal,
        Iva,
        Total,
        MetodoPago = "Efectivo",
        NombreVendedor = null,
        TelefonoVendedor = null,
        Observaciones = null,
        Detalle = [],
      } = factura;

      const detalleNormalizado = normalizarDetalle(Detalle);

      await transaction.begin();

      const pagosExistentes = await transaction.request()
        .input("IdFactura", sql.BigInt, idFactura)
        .query("SELECT COALESCE(SUM(Monto), 0) AS MontoPagado FROM dbo.Pagos WITH (UPDLOCK, HOLDLOCK) WHERE IdFacturaFK = @IdFactura");
      const montoPagado = Number(pagosExistentes.recordset[0]?.MontoPagado || 0);
      if (Number(Total) < montoPagado) {
        throw new Error("El total de la factura no puede quedar por debajo de los abonos ya registrados.");
      }

      const updateResult = await transaction
        .request()
        .input("IdFactura", sql.BigInt, idFactura)
        .input("DocumentoCliente", sql.BigInt, DocumentoCliente)
        .input("Subtotal", sql.Decimal(18, 2), Subtotal)
        .input("Impuesto", sql.Decimal(18, 2), Iva)
        .input("Total", sql.Decimal(18, 2), Total)
        .input("MetodoPago", sql.VarChar(50), MetodoPago)
        .input("NombreVendedor", sql.VarChar(150), NombreVendedor)
        .input("TelefonoVendedor", sql.VarChar(30), TelefonoVendedor)
        .input("Observaciones", sql.VarChar(500), Observaciones)
        .query(`
          UPDATE Facturas
          SET
            IdClienteFK = @DocumentoCliente,
            Subtotal = @Subtotal,
            Impuesto = @Impuesto,
            Total = @Total,
            MetodoPago = @MetodoPago,
            NombreVendedor = @NombreVendedor,
            TelefonoVendedor = @TelefonoVendedor,
            Observaciones = @Observaciones
          WHERE IdFactura = @IdFactura;
        `);

      const filasAfectadas = updateResult.rowsAffected?.[0] ?? 0;

      if (filasAfectadas === 0) {
        throw new Error("Factura no encontrada para actualizar");
      }

      await transaction
        .request()
        .input("IdFactura", sql.BigInt, idFactura)
        .query("DELETE FROM DetalleFactura WHERE IdFacturaFK = @IdFactura");

      if (detalleNormalizado.length > 0) {
        let siguienteIdDetalle = await obtenerSiguienteIdDetalle(transaction);

        for (const item of detalleNormalizado) {
          await transaction
            .request()
            .input("IdDetalleFactura", sql.BigInt, siguienteIdDetalle)
            .input("IdFacturaFK", sql.BigInt, idFactura)
            .input("IdProductoFK", sql.BigInt, item.IdProducto)
            .input("Cantidad", sql.Int, item.Cantidad)
            .input("PrecioUnitario", sql.Decimal(10, 2), item.PrecioUnitario)
            .input("Subtotal", sql.Decimal(10, 2), item.Subtotal)
            .query(`
              INSERT INTO DetalleFactura (
                IdDetalleFactura,
                IdFacturaFK,
                IdProductoFK,
                Cantidad,
                PrecioUnitario,
                Subtotal
              )
              VALUES (
                @IdDetalleFactura,
                @IdFacturaFK,
                @IdProductoFK,
                @Cantidad,
                @PrecioUnitario,
                @Subtotal
              )
            `);

          siguienteIdDetalle += 1;
        }
      }

      await transaction.commit();
      return { success: true, IdFactura: Number(idFactura) };
    } catch (error) {
      try {
        await transaction.rollback();
      } catch (rollbackError) {
        console.error("❌ Error al revertir actualización de factura:", rollbackError);
      }

      console.error("❌ Error al actualizar factura:", error);
      return { success: false, error: error.message };
    }
  },
};

export default FacturaModel;
