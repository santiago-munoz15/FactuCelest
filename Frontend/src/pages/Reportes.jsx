import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  showErrorAlert,
  showInfoAlert,
  showConfirmAlert,
  showSuccessAlert,
} from "../utils/sweetAlertHelper";
import { buildApiUrl } from "../config/api";
import ReportsDashboard from "../components/ReportsDashboard";

const initialDetalleItem = () => ({
  IdProducto: "",
  Descripcion: "",
  Talla: "",
  Cantidad: 1,
  PrecioUnitario: 0,
});

const currencyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const formatCurrency = (value) => currencyFormatter.format(Number(value || 0));

const escaparHtml = (texto = "") =>
  String(texto)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const formatDate = (value) => {
  const dateOnly = typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
  const date = dateOnly
    ? (() => { const [year, month, day] = value.split("-").map(Number); return new Date(year, month - 1, day); })()
    : new Date(value);
  const sqlDate = value instanceof Date && value.getUTCHours() === 0 && value.getUTCMinutes() === 0 && value.getUTCSeconds() === 0;

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    ...(sqlDate ? { timeZone: "UTC" } : {}),
  });
};

const calcularTotales = (detalle = []) => {
  const subtotal = detalle.reduce((acc, item) => {
    const cantidad = Number(item.Cantidad || 0);
    const precio = Number(item.PrecioUnitario || 0);
    return acc + cantidad * precio;
  }, 0);
  const iva = subtotal * 0.19;
  const total = subtotal + iva;

  return { subtotal, iva, total };
};

const normalizarDetalle = (detalle = []) =>
  detalle.map((item) => ({
    IdProducto: item.IdProducto ?? item.IdProductoFK ?? "",
    Descripcion: item.Descripcion ?? "",
    Talla: item.Talla ?? "",
    Cantidad: Number(item.Cantidad ?? 1),
    PrecioUnitario: Number(item.PrecioUnitario ?? 0),
  }));

const getUsuarioLocal = () => {
  try {
    const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
    return usuario?.Nombre || usuario?.nombre || "SARA";
  } catch {
    return "SARA";
  }
};

const DATOS_EMPRESA = {
  Nombre: "INTIMAS CELESTE",
  Nit: "4268675-2",
  Ciudad: "Medellin",
  Telefono: "3174668696",
};

function Reportes() {
  const [facturas, setFacturas] = useState([]);
  const [facturaSeleccionada, setFacturaSeleccionada] = useState(null);
  const [facturaDetalle, setFacturaDetalle] = useState(null);
  const [productos, setProductos] = useState([]);
  const [vendedores, setVendedores] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [facturasHistoricas, setFacturasHistoricas] = useState([]);
  const [filtroVendedor, setFiltroVendedor] = useState("");
  const [filtroCliente, setFiltroCliente] = useState("");
  const [filtroMetodoPago, setFiltroMetodoPago] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [periodo, setPeriodo] = useState("mes");
  const [busqueda, setBusqueda] = useState("");
  const [filtrosAplicados, setFiltrosAplicados] = useState({ periodo: "mes", desde: "", hasta: "", busqueda: "" });
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [showEditor, setShowEditor] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [editorFacturaId, setEditorFacturaId] = useState(null);
  const [editorForm, setEditorForm] = useState({
    DocumentoCliente: "",
    MetodoPago: "Efectivo",
    Observaciones: "",
    Detalle: [initialDetalleItem()],
  });
  const vendedor = useMemo(() => getUsuarioLocal(), []);

  const cargarProductos = useCallback(async () => {
    try {
      const res = await axios.get(buildApiUrl("/api/productos/listarp"));
      if (Array.isArray(res.data)) {
        setProductos(res.data);
      }
    } catch (error) {
      console.error("Error al cargar productos:", error);
    }
  }, []);

  const cargarFacturas = useCallback(async () => {
    const { periodo: periodoConsulta, desde: desdeConsulta, hasta: hastaConsulta, busqueda: busquedaConsulta } = filtrosAplicados;
    if (periodoConsulta === "rango" && (!desdeConsulta || !hastaConsulta || desdeConsulta > hastaConsulta)) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("periodo", periodoConsulta);

      if (busquedaConsulta.trim()) {
        params.set("busqueda", busquedaConsulta.trim());
      }

      if (periodoConsulta === "rango") {
        if (desdeConsulta) {
          params.set("desde", desdeConsulta);
        }
        if (hastaConsulta) {
          params.set("hasta", hastaConsulta);
        }
      }

      const res = await axios.get(
        buildApiUrl(`/api/facturas/reporte?${params.toString()}`)
      );

      if (res.data.success) {
        setFacturas(res.data.facturas || []);
      } else {
        showErrorAlert(
          "Error",
          res.data.error || "No se pudo cargar el reporte"
        );
      }
    } catch (error) {
      console.error("Error cargando facturas:", error);
      showErrorAlert(
        "Error",
        error.response?.data?.error || "No se pudo cargar el reporte"
      );
    } finally {
      setLoading(false);
    }
  }, [filtrosAplicados]);

  const cargarDetalleFactura = async (idFactura, mostrarError = true) => {
    if (!idFactura) {
      return;
    }

    setLoadingDetalle(true);
    try {
      const res = await axios.get(buildApiUrl(`/api/facturas/detalle/${idFactura}`));

      if (res.data.success) {
        setFacturaDetalle(res.data.factura);
        setFacturaSeleccionada(res.data.factura);
      } else if (mostrarError) {
        showErrorAlert("Error", res.data.error || "No se pudo cargar la factura");
      }
    } catch (error) {
      console.error("Error cargando detalle de factura:", error);
      if (mostrarError) {
        showErrorAlert("Error", "No se pudo cargar el detalle de la factura");
      }
    } finally {
      setLoadingDetalle(false);
    }
  };

  const verFactura = async (factura) => {
    setFacturaSeleccionada(factura);
    setFacturaDetalle(null);
    setShowInvoiceModal(true);
    await cargarDetalleFactura(factura.IdFactura);
  };

  useEffect(() => {
    cargarProductos();
  }, [cargarProductos]);

  useEffect(() => {
    cargarFacturas();
  }, [cargarFacturas]);

  useEffect(() => {
    axios.get(buildApiUrl("/api/vendedores")).then((res) => {
      if (res.data.success) setVendedores(res.data.vendedores || []);
    }).catch((error) => console.error("Error al cargar vendedores:", error));
    axios.get(buildApiUrl("/api/clientes/listar")).then((res) => {
      if (res.data.success) setClientes(res.data.clientes || []);
    }).catch((error) => console.error("Error al cargar clientes:", error));

    const hoy = new Date();
    const inicio = new Date(hoy.getFullYear(), hoy.getMonth() - 3, 1);
    const comoFechaLocal = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    const params = new URLSearchParams({ periodo: "rango", desde: comoFechaLocal(inicio), hasta: comoFechaLocal(hoy) });
    axios.get(buildApiUrl(`/api/facturas/reporte?${params.toString()}`)).then((res) => {
      if (res.data.success) setFacturasHistoricas(res.data.facturas || []);
    }).catch((error) => console.error("Error al cargar el histórico de ventas:", error));
  }, []);

  const handleBuscar = async () => {
    if (periodo === "rango" && (!desde || !hasta || desde > hasta)) {
      showInfoAlert("Rango de fechas incompleto", "Selecciona un rango válido para generar el reporte.");
      return;
    }
    setFiltrosAplicados({ periodo, desde, hasta, busqueda });
  };

  const abrirEditor = async (factura) => {
    const facturaBase = factura?.IdFactura ? factura : facturaSeleccionada;

    if (!facturaBase?.IdFactura) {
      showInfoAlert("Sin factura", "Selecciona una factura para editarla.");
      return;
    }

    let facturaCompleta = facturaDetalle;

    if (!facturaCompleta || facturaCompleta.IdFactura !== facturaBase.IdFactura) {
      setLoadingDetalle(true);
      try {
        const res = await axios.get(
          buildApiUrl(`/api/facturas/detalle/${facturaBase.IdFactura}`)
        );

        if (!res.data.success) {
          showErrorAlert("Error", res.data.error || "No se pudo cargar la factura");
          return;
        }

        facturaCompleta = res.data.factura;
        setFacturaDetalle(facturaCompleta);
        setFacturaSeleccionada(facturaCompleta);
      } catch (error) {
        console.error("Error cargando factura para editar:", error);
        showErrorAlert("Error", "No se pudo cargar la factura para editar");
        return;
      } finally {
        setLoadingDetalle(false);
      }
    }

    setEditorFacturaId(facturaBase.IdFactura);
    setEditorForm({
      DocumentoCliente: facturaCompleta.DocumentoCliente ?? "",
      MetodoPago: facturaCompleta.MetodoPago ?? "Efectivo",
      Observaciones: facturaCompleta.Observaciones ?? "",
      Detalle:
        facturaCompleta.Detalle?.length > 0
          ? normalizarDetalle(facturaCompleta.Detalle)
          : [initialDetalleItem()],
    });
    setShowEditor(true);
  };

  const cerrarEditor = () => {
    setShowEditor(false);
    setEditorFacturaId(null);
    setEditorForm({
      DocumentoCliente: "",
      MetodoPago: "Efectivo",
      Observaciones: "",
      Detalle: [initialDetalleItem()],
    });
  };

  const actualizarDetalle = (index, campo, valor) => {
    setEditorForm((actual) => {
      const detalle = [...actual.Detalle];
      const fila = { ...detalle[index] };

      if (campo === "IdProducto") {
        const producto = productos.find((item) => String(item.IdProducto) === String(valor));
        fila.IdProducto = valor;
        fila.Descripcion = producto?.Descripcion || "";
        fila.Talla = producto?.Talla || "";
        fila.PrecioUnitario = Number(producto?.PrecioVenta || 0);
      } else {
        fila[campo] = valor;
      }

      detalle[index] = fila;
      return { ...actual, Detalle: detalle };
    });
  };

  const agregarDetalle = () => {
    setEditorForm((actual) => ({
      ...actual,
      Detalle: [...actual.Detalle, initialDetalleItem()],
    }));
  };

  const eliminarDetalle = (index) => {
    setEditorForm((actual) => {
      const detalle = actual.Detalle.filter((_, itemIndex) => itemIndex !== index);
      return {
        ...actual,
        Detalle: detalle.length > 0 ? detalle : [initialDetalleItem()],
      };
    });
  };

  const guardarEdicion = async () => {
    const detalleValido = editorForm.Detalle
      .map((item) => ({
        IdProducto: Number(item.IdProducto || 0),
        Descripcion: item.Descripcion || "",
        Talla: item.Talla || "",
        Cantidad: Number(item.Cantidad || 0),
        PrecioUnitario: Number(item.PrecioUnitario || 0),
      }))
      .filter((item) => item.IdProducto > 0 && item.Cantidad > 0 && item.PrecioUnitario >= 0);

    if (!editorForm.DocumentoCliente) {
      showErrorAlert("Cliente requerido", "Debes ingresar un documento de cliente");
      return;
    }

    if (detalleValido.length === 0) {
      showErrorAlert("Detalle vacío", "Debes conservar al menos un producto válido");
      return;
    }

    try {
      await axios.get(
        buildApiUrl(`/api/clientes/buscar/${editorForm.DocumentoCliente}`)
      );
    } catch (error) {
      console.error("Cliente no encontrado:", error);
      showErrorAlert(
        "Cliente no encontrado",
        "El documento ingresado no existe en la base de datos"
      );
      return;
    }

    const totales = calcularTotales(detalleValido);

    try {
      const res = await axios.put(
        buildApiUrl(`/api/facturas/actualizar/${editorFacturaId}`),
        {
          DocumentoCliente: editorForm.DocumentoCliente,
          Subtotal: totales.subtotal,
          Iva: totales.iva,
          Total: totales.total,
          MetodoPago: editorForm.MetodoPago,
          Observaciones: editorForm.Observaciones,
          Detalle: detalleValido,
        }
      );

      if (res.data.success) {
        await showSuccessAlert(
          "Factura actualizada",
          `La factura #${editorFacturaId} fue actualizada correctamente`
        );
        cerrarEditor();
        await cargarFacturas();
      } else {
        showErrorAlert("Error", res.data.error || "No se pudo actualizar la factura");
      }
    } catch (error) {
      console.error("Error actualizando factura:", error);
      showErrorAlert(
        "Error",
        error.response?.data?.error || "No se pudo actualizar la factura"
      );
    }
  };

  const descargarExcel = async (idFactura) => {
    try {
      const res = await axios.get(
        buildApiUrl(`/api/facturas/excel/${idFactura}`),
        { responseType: "blob" }
      );

      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `factura_${idFactura}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      showSuccessAlert("Descarga lista", `Factura #${idFactura} exportada a Excel`);
    } catch (error) {
      console.error("Error descargando factura:", error);
      showErrorAlert(
        "Error",
        error.response?.data?.error || "No se pudo descargar la factura"
      );
    }
  };

  const reimprimirFactura = async (factura) => {
    if (!factura?.IdFactura) {
      showErrorAlert("Sin factura", "Selecciona una factura para reimprimirla");
      return;
    }

    const decision = await showConfirmAlert(
      "Reimprimir factura",
      `¿Deseas imprimir la factura #${factura.IdFactura}?`
    );

    if (!decision.isConfirmed) {
      return;
    }

    const detalle = factura.Detalle || [];
    const fechaFactura = factura.Fecha
      ? new Date(factura.Fecha).toLocaleString("es-CO", {
          dateStyle: "short",
          timeStyle: "short",
        })
      : new Date().toLocaleString("es-CO");

    const filasDetalle = detalle
      .map(
        (item) => `
          <tr>
            <td>${escaparHtml(item.Descripcion || item.Referencia || "")}</td>
            <td style="text-align:center;">${escaparHtml(item.Talla || "-")}</td>
            <td style="text-align:right;">${Number(item.Cantidad || 0)}</td>
            <td style="text-align:right;">${formatCurrency(item.PrecioUnitario ?? 0)}</td>
            <td style="text-align:right;">${formatCurrency(item.Subtotal ?? item.Total ?? 0)}</td>
          </tr>
        `
      )
      .join("");
    const filasAbonos = (factura.Pagos || []).map((pago) => `
      <tr>
        <td>${escaparHtml(formatDate(pago.FechaPago))}</td>
        <td>${escaparHtml(pago.MetodoPago || "")}</td>
        <td>${escaparHtml(pago.Pagador || "—")}</td>
        <td style="text-align:right;">${formatCurrency(pago.Monto || 0)}</td>
        <td>${escaparHtml(pago.Observaciones || "")}</td>
      </tr>
    `).join("");

    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    iframe.style.visibility = "hidden";
    document.body.appendChild(iframe);

    const documento = iframe.contentDocument || iframe.contentWindow?.document;

    if (!documento) {
      iframe.remove();
      showErrorAlert("Error", "No fue posible abrir la ventana de impresión");
      return;
    }

    documento.open();
    documento.write(`
      <!doctype html>
      <html lang="es">
        <head>
          <meta charset="UTF-8" />
          <title>Factura #${escaparHtml(factura.IdFactura)}</title>
          <style>
            @page { margin: 14mm; }
            body {
              font-family: Arial, Helvetica, sans-serif;
              color: #111827;
              margin: 0;
              padding: 0;
            }
            .sheet {
              max-width: 900px;
              margin: 0 auto;
              padding: 24px;
            }
            .header {
              display: flex;
              justify-content: space-between;
              gap: 16px;
              border-bottom: 2px solid #0f766e;
              padding-bottom: 16px;
              margin-bottom: 20px;
            }
            .brand {
              font-size: 24px;
              font-weight: 800;
              color: #0f766e;
            }
            .meta {
              text-align: right;
              font-size: 13px;
              line-height: 1.5;
            }
            .grid {
              display: grid;
              grid-template-columns: repeat(2, minmax(0, 1fr));
              gap: 12px 20px;
              margin-bottom: 20px;
              font-size: 13px;
            }
            .label {
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 0.08em;
              color: #6b7280;
              margin-bottom: 4px;
            }
            .value {
              font-weight: 600;
            }
            .section-title {
              margin: 18px 0 10px;
              font-size: 12px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 0.08em;
              color: #0f766e;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 12px;
              font-size: 13px;
            }
            thead th {
              background: #ecfeff;
              color: #0f172a;
              text-align: left;
              padding: 10px 8px;
              border-bottom: 1px solid #cbd5e1;
            }
            tbody td {
              padding: 10px 8px;
              border-bottom: 1px solid #e5e7eb;
            }
            .totals {
              margin-top: 20px;
              display: flex;
              justify-content: flex-end;
            }
            .totals-box {
              min-width: 280px;
              border: 1px solid #cbd5e1;
              border-radius: 14px;
              padding: 14px 16px;
            }
            .totals-row {
              display: flex;
              justify-content: space-between;
              gap: 12px;
              font-size: 13px;
              margin: 6px 0;
            }
            .totals-row.total {
              font-size: 15px;
              font-weight: 800;
              border-top: 1px solid #cbd5e1;
              padding-top: 10px;
              margin-top: 10px;
            }
            .footer {
              margin-top: 24px;
              font-size: 12px;
              color: #6b7280;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="sheet">
            <div class="header">
              <div>
                <div class="brand">FactuCelest</div>
                <div>${escaparHtml(DATOS_EMPRESA.Nombre)}</div>
                <div>NIT: ${escaparHtml(DATOS_EMPRESA.Nit)}</div>
                <div>${escaparHtml(DATOS_EMPRESA.Ciudad)} · ${escaparHtml(DATOS_EMPRESA.Telefono)}</div>
              </div>
              <div class="meta">
                <div><strong>Factura #${escaparHtml(factura.IdFactura)}</strong></div>
                <div>${escaparHtml(fechaFactura)}</div>
              </div>
            </div>

            <div class="section-title">Datos de la empresa</div>
            <div class="grid">
              <div>
                <div class="label">Nombre</div>
                <div class="value">${escaparHtml(DATOS_EMPRESA.Nombre)}</div>
              </div>
              <div>
                <div class="label">NIT</div>
                <div class="value">${escaparHtml(DATOS_EMPRESA.Nit)}</div>
              </div>
              <div>
                <div class="label">Ciudad</div>
                <div class="value">${escaparHtml(DATOS_EMPRESA.Ciudad)}</div>
              </div>
              <div>
                <div class="label">Teléfono</div>
                <div class="value">${escaparHtml(DATOS_EMPRESA.Telefono)}</div>
              </div>
            </div>

            <div class="section-title">Datos del cliente</div>
            <div class="grid">
              <div>
                <div class="label">Nombre</div>
                <div class="value">${escaparHtml(factura.NombreCliente || "")}</div>
              </div>
              <div>
                <div class="label">C.C / NIT</div>
                <div class="value">${escaparHtml(factura.DocumentoCliente || "")}</div>
              </div>
              <div>
                <div class="label">Dirección</div>
                <div class="value">${escaparHtml(factura.DireccionCliente || "No registrada")}</div>
              </div>
              <div>
                <div class="label">Ciudad</div>
                <div class="value">${escaparHtml(factura.CiudadCliente || "No registrada")}</div>
              </div>
              <div>
                <div class="label">Teléfono</div>
                <div class="value">${escaparHtml(factura.TelefonoCliente || "No registrado")}</div>
              </div>
              <div>
                <div class="label">Vendedor / Método de pago</div>
                <div class="value">${escaparHtml(factura.NombreVendedor || vendedor || "")} · ${escaparHtml(factura.MetodoPago || "")}</div>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th style="text-align:center;">Talla</th>
                  <th style="text-align:right;">Cant.</th>
                  <th style="text-align:right;">P. unitario</th>
                  <th style="text-align:right;">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${filasDetalle}
              </tbody>
            </table>

            <div class="section-title">Historial de abonos</div>
            <table>
              <thead><tr><th>Fecha</th><th>Método</th><th>Pagador</th><th style="text-align:right;">Monto</th><th>Observaciones</th></tr></thead>
              <tbody>${filasAbonos || '<tr><td colspan="5">Sin abonos registrados.</td></tr>'}</tbody>
            </table>

            <div class="totals">
              <div class="totals-box">
                <div class="totals-row"><span>Subtotal</span><span>${formatCurrency(factura.Subtotal || 0)}</span></div>
                <div class="totals-row"><span>IVA</span><span>${formatCurrency(factura.Impuesto ?? factura.Iva ?? 0)}</span></div>
                <div class="totals-row"><span>Abonado</span><span>${formatCurrency(factura.MontoPagado || 0)}</span></div>
                <div class="totals-row"><span>Saldo pendiente (${escaparHtml(factura.Estado || "Pendiente")})</span><span>${formatCurrency(factura.Saldo ?? factura.Total ?? 0)}</span></div>
                <div class="totals-row"><span>Vencimiento</span><span>${escaparHtml(formatDate(factura.FechaVencimiento))}</span></div>
                <div class="totals-row total"><span>Total factura</span><span>${formatCurrency(factura.Total || 0)}</span></div>
              </div>
            </div>

            <div class="footer">Documento reimpreso desde FactuCelest</div>
          </div>
        </body>
      </html>
    `);
    documento.close();

    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } finally {
        setTimeout(() => iframe.remove(), 1000);
      }
    }, 250);
  };

  const facturasFiltradas = useMemo(() => facturas.filter((factura) => {
    const vendedorCoincide = !filtroVendedor || String(factura.NombreVendedor || "") === filtroVendedor;
    const clienteCoincide = !filtroCliente || String(factura.DocumentoCliente || "") === filtroCliente;
    const metodoCoincide = !filtroMetodoPago || (filtroMetodoPago === "Crédito pendiente"
      ? Number(factura.Saldo || 0) > 0
      : Number(factura[`Monto${filtroMetodoPago}`] || 0) > 0);
    const estadoCoincide = !filtroEstado || factura.Estado === filtroEstado;
    return vendedorCoincide && clienteCoincide && metodoCoincide && estadoCoincide;
  }), [facturas, filtroVendedor, filtroCliente, filtroMetodoPago, filtroEstado]);

  const resumenActual = useMemo(() => {
    return facturasFiltradas.reduce(
      (acc, item) => {
        acc.cantidad += 1;
        acc.total += Number(item.Total || 0);
        return acc;
      },
      { cantidad: 0, total: 0 }
    );
  }, [facturasFiltradas]);

  const ventasPorMes = useMemo(() => {
    const ahora = new Date();
    const meses = Array.from({ length: 4 }, (_, index) => {
      const date = new Date(ahora.getFullYear(), ahora.getMonth() - 3 + index, 1);
      return { key: `${date.getFullYear()}-${date.getMonth()}`, label: date.toLocaleDateString("es-CO", { month: "short", year: "numeric" }), total: 0 };
    });
    const porMes = new Map(meses.map((mes) => [mes.key, mes]));
    facturasHistoricas.forEach((factura) => {
      if (filtroVendedor && String(factura.NombreVendedor || "") !== filtroVendedor) return;
      if (filtroCliente && String(factura.DocumentoCliente || "") !== filtroCliente) return;
      if (filtroEstado && factura.Estado !== filtroEstado) return;
      if (filtroMetodoPago && !(filtroMetodoPago === "Crédito pendiente"
        ? Number(factura.Saldo || 0) > 0
        : Number(factura[`Monto${filtroMetodoPago}`] || 0) > 0)) return;
      const date = new Date(factura.Fecha);
      const mes = porMes.get(`${date.getFullYear()}-${date.getMonth()}`);
      if (mes) mes.total += filtroMetodoPago
        ? Number(filtroMetodoPago === "Crédito pendiente" ? factura.Saldo : factura[`Monto${filtroMetodoPago}`] || 0)
        : Number(factura.Total || 0);
    });
    return meses;
  }, [facturasHistoricas, filtroVendedor, filtroCliente, filtroMetodoPago, filtroEstado]);

  const ventasPorMetodo = useMemo(() => {
    const totales = new Map();
    facturasFiltradas.forEach((factura) => {
      const metodos = filtroMetodoPago
        ? [[filtroMetodoPago, filtroMetodoPago === "Crédito pendiente" ? Number(factura.Saldo || 0) : Number(factura[`Monto${filtroMetodoPago}`] || 0)]]
        : [["Efectivo", Number(factura.MontoEfectivo || 0)], ["Transferencia", Number(factura.MontoTransferencia || 0)], ["Tarjeta", Number(factura.MontoTarjeta || 0)], ["Nequi", Number(factura.MontoNequi || 0)], ["Daviplata", Number(factura.MontoDaviplata || 0)], ["Crédito pendiente", Number(factura.Saldo || 0)]];
      metodos.forEach(([metodo, valor]) => {
        if (valor > 0) totales.set(metodo, (totales.get(metodo) || 0) + valor);
      });
    });
    return [...totales.entries()].map(([metodo, total]) => ({ metodo, total })).sort((a, b) => b.total - a.total);
  }, [facturasFiltradas, filtroMetodoPago]);

  const productosVendidos = useMemo(() => facturasFiltradas.reduce((sum, item) => sum + Number(item.CantidadProductos || 0), 0), [facturasFiltradas]);
  const clientesAtendidos = useMemo(() => new Set(facturasFiltradas.map((item) => String(item.DocumentoCliente || "")).filter(Boolean)).size, [facturasFiltradas]);
  const totalMetodos = ventasPorMetodo.reduce((sum, item) => sum + item.total, 0);
  const donutStops = (() => {
    const colors = ["#087bf5", "#07bd82", "#8b5cf6", "#f59e0b", "#ef5c78"];
    let accumulated = 0;
    const values = ventasPorMetodo.map((item, index) => {
      const start = accumulated;
      accumulated += totalMetodos ? item.total / totalMetodos * 100 : 0;
      return `${colors[index % colors.length]} ${start}% ${accumulated}%`;
    });
    return values.length ? `conic-gradient(${values.join(", ")})` : "conic-gradient(#e8eef5 0% 100%)";
  })();

  const exportarReporte = () => {
    if (!facturasFiltradas.length) {
      showInfoAlert("Sin resultados", "Aplica filtros que incluyan facturas para exportar.");
      return;
    }
    const encabezados = ["Factura", "Cliente", "Documento", "Vendedor", "Fecha", "Vencimiento", "Estado", "Métodos de pago", "Total facturado", "Abonado", "Saldo pendiente"];
    const filas = facturasFiltradas.map((factura) => [factura.IdFactura, factura.NombreCliente, factura.DocumentoCliente, factura.NombreVendedor || "", formatDate(factura.Fecha), formatDate(factura.FechaVencimiento), factura.Estado, ["Efectivo", "Transferencia", "Tarjeta", "Nequi", "Daviplata"].filter((metodo) => Number(factura[`Monto${metodo}`] || 0) > 0).join(" + ") || (Number(factura.Saldo || 0) > 0 ? "Crédito pendiente" : "—"), factura.Total, factura.MontoPagado, factura.Saldo]);
    const escaparCsv = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
    const contenido = [encabezados, ...filas].map((fila) => fila.map(escaparCsv).join(",")).join("\r\n");
    const blob = new Blob(["\ufeff", contenido], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `reporte_facturas_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const facturaEnVista = facturaDetalle || facturaSeleccionada;
  const resumenEditor = calcularTotales(editorForm.Detalle);

  return (
    <div className="reports-page">
      <ReportsDashboard
        periodo={periodo} setPeriodo={setPeriodo}
        desde={desde} setDesde={setDesde} hasta={hasta} setHasta={setHasta}
        filtroVendedor={filtroVendedor} setFiltroVendedor={setFiltroVendedor}
        filtroCliente={filtroCliente} setFiltroCliente={setFiltroCliente}
        filtroMetodoPago={filtroMetodoPago} setFiltroMetodoPago={setFiltroMetodoPago}
        filtroEstado={filtroEstado} setFiltroEstado={setFiltroEstado}
        vendedores={vendedores} clientes={clientes} busqueda={busqueda}
        setBusqueda={setBusqueda} handleBuscar={handleBuscar} loading={loading}
        facturas={facturasFiltradas} resumen={resumenActual}
        clientesAtendidos={clientesAtendidos} productosVendidos={productosVendidos}
        ventasPorMes={ventasPorMes} ventasPorMetodo={ventasPorMetodo}
        totalMetodos={totalMetodos} donutStops={donutStops}
        exportar={exportarReporte} formatCurrency={formatCurrency} formatDate={formatDate}
        verFactura={verFactura} descargarExcel={descargarExcel} abrirEditor={abrirEditor}
      />
      {showInvoiceModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onMouseDown={() => setShowInvoiceModal(false)}
        >
          <div
            className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl dark:bg-gray-900 md:p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="invoice-preview-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 id="invoice-preview-title" className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  Vista de factura
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Formato de impresión similar a la guía.
                </p>
              </div>
              <div className="flex items-center gap-3">
                {loadingDetalle && <span className="text-xs text-cyan-600">Cargando...</span>}
                <button
                  type="button"
                  onClick={() => setShowInvoiceModal(false)}
                  className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Cerrar
                </button>
              </div>
            </div>

            {!facturaEnVista ? (
              <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-8 text-center text-gray-500 dark:text-gray-400">
                Selecciona una factura para ver el detalle.
              </div>
            ) : (
              <div className="space-y-5">
                <div className="rounded-2xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-800 p-4">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-cyan-600 dark:text-cyan-400 mb-2">
                        {DATOS_EMPRESA.Nombre}
                      </p>
                      <h3 className="text-xl font-black text-gray-900 dark:text-gray-100">
                        Factura #{facturaEnVista.IdFactura}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(facturaEnVista.Fecha)} · {facturaEnVista.MetodoPago}
                      </p>
                    </div>
                    <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                      <p>{DATOS_EMPRESA.Nit}</p>
                      <p>{DATOS_EMPRESA.Ciudad}</p>
                      <p>{DATOS_EMPRESA.Telefono}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-3">
                      <p className="text-gray-500 dark:text-gray-400">Cliente</p>
                      <p className="font-semibold text-gray-800 dark:text-gray-100">{facturaEnVista.NombreCliente}</p>
                      <p className="text-gray-600 dark:text-gray-300">{facturaEnVista.DocumentoCliente}</p>
                      <p className="text-gray-600 dark:text-gray-300">{facturaEnVista.DireccionCliente}</p>
                    </div>
                    <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-3">
                      <p className="text-gray-500 dark:text-gray-400">Vendedor</p>
                      <p className="font-semibold text-gray-800 dark:text-gray-100">
                        {facturaEnVista.NombreVendedor || vendedor}
                      </p>
                      <p className="text-gray-600 dark:text-gray-300">Reporte de ventas</p>
                    </div>
                  </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="text-left px-3 py-2 text-gray-600 dark:text-gray-300">Código</th>
                        <th className="text-left px-3 py-2 text-gray-600 dark:text-gray-300">Descripción</th>
                        <th className="text-left px-3 py-2 text-gray-600 dark:text-gray-300">Talla</th>
                        <th className="text-right px-3 py-2 text-gray-600 dark:text-gray-300">Cant.</th>
                        <th className="text-right px-3 py-2 text-gray-600 dark:text-gray-300">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(facturaEnVista.Detalle || []).map((item) => (
                        <tr key={item.IdDetalleFactura} className="border-t border-gray-100 dark:border-gray-800">
                          <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{item.IdProductoFK}</td>
                          <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{item.Descripcion || item.Referencia}</td>
                          <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{item.Talla}</td>
                          <td className="px-3 py-2 text-right text-gray-700 dark:text-gray-300">{item.Cantidad}</td>
                          <td className="px-3 py-2 text-right text-gray-700 dark:text-gray-300">{formatCurrency(item.Subtotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="rounded-2xl bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-100 dark:border-cyan-900 p-4">
                    <p className="text-xs text-cyan-700 dark:text-cyan-300">Subtotal</p>
                    <p className="text-lg font-bold text-cyan-900 dark:text-cyan-100">{formatCurrency(facturaEnVista.Subtotal)}</p>
                  </div>
                  <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900 p-4">
                    <p className="text-xs text-amber-700 dark:text-amber-300">Impuesto</p>
                    <p className="text-lg font-bold text-amber-900 dark:text-amber-100">{formatCurrency(facturaEnVista.Impuesto)}</p>
                  </div>
                  <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900 p-4">
                    <p className="text-xs text-emerald-700 dark:text-emerald-300">Total</p>
                    <p className="text-lg font-bold text-emerald-900 dark:text-emerald-100">{formatCurrency(facturaEnVista.Total)}</p>
                  </div>
                  <div className="rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 p-4">
                    <p className="text-xs text-blue-700 dark:text-blue-300">Abonado · {facturaEnVista.Estado || "Pendiente"}</p>
                    <p className="text-lg font-bold text-blue-900 dark:text-blue-100">{formatCurrency(facturaEnVista.MontoPagado)}</p>
                    <p className="text-xs text-blue-700 dark:text-blue-300">Saldo: {formatCurrency(facturaEnVista.Saldo ?? facturaEnVista.Total)}</p>
                    <p className="text-xs text-blue-700 dark:text-blue-300">Vence: {formatDate(facturaEnVista.FechaVencimiento)}</p>
                  </div>
                </div>

                <section className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800">
                  <h4 className="border-b border-gray-100 px-4 py-3 text-sm font-bold text-gray-800 dark:border-gray-800 dark:text-gray-100">Historial de abonos</h4>
                  {(facturaEnVista.Pagos || []).length ? (
                    <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-gray-50 dark:bg-gray-800"><tr><th className="px-3 py-2 text-left">Fecha</th><th className="px-3 py-2 text-left">Método</th><th className="px-3 py-2 text-left">Pagador</th><th className="px-3 py-2 text-right">Monto</th></tr></thead><tbody>{facturaEnVista.Pagos.map((pago) => <tr key={pago.IdPago} className="border-t border-gray-100 dark:border-gray-800"><td className="px-3 py-2">{formatDate(pago.FechaPago)}</td><td className="px-3 py-2">{pago.MetodoPago}</td><td className="px-3 py-2">{pago.Pagador || "—"}</td><td className="px-3 py-2 text-right font-semibold">{formatCurrency(pago.Monto)}</td></tr>)}</tbody></table></div>
                  ) : <p className="px-4 py-4 text-sm text-gray-500">Todavía no se han registrado abonos.</p>}
                </section>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => abrirEditor(facturaEnVista)}
                    className="app-btn-primary px-5 py-3"
                  >
                    ✏️ Editar factura
                  </button>
                  <button
                    onClick={() => reimprimirFactura(facturaEnVista)}
                    className="app-btn-secondary px-5 py-3"
                  >
                    🖨️ Reimprimir factura
                  </button>
                  <button
                    onClick={() => descargarExcel(facturaEnVista.IdFactura)}
                    className="app-btn-secondary px-5 py-3"
                  >
                    ⬇️ Descargar Excel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showEditor && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="mx-auto my-6 w-full max-w-6xl rounded-3xl bg-white dark:bg-gray-900 shadow-2xl border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 px-6 py-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  Editar factura #{editorFacturaId}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Ajusta cliente, productos y totales antes de guardar.
                </p>
              </div>
              <button
                onClick={cerrarEditor}
                className="rounded-full border border-gray-200 dark:border-gray-700 px-4 py-2 text-gray-600 dark:text-gray-300"
              >
                Cerrar
              </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_1.2fr] gap-6 p-6">
              <div className="space-y-4">
                <div className="rounded-2xl border border-gray-200 dark:border-gray-800 p-4 space-y-3">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Documento del cliente
                  </label>
                  <input
                    type="text"
                    value={editorForm.DocumentoCliente}
                    onChange={(e) =>
                      setEditorForm((actual) => ({
                        ...actual,
                        DocumentoCliente: e.target.value,
                      }))
                    }
                    className="app-input"
                  />

                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mt-4">
                    Método de pago
                  </label>
                  <select
                    value={editorForm.MetodoPago}
                    onChange={(e) =>
                      setEditorForm((actual) => ({
                        ...actual,
                        MetodoPago: e.target.value,
                      }))
                    }
                    className="app-input"
                  >
                    <option value="Efectivo">Efectivo</option>
                    <option value="Transferencia">Transferencia</option>
                    <option value="Nequi">Nequi</option>
                    <option value="Tarjeta">Tarjeta</option>
                  </select>

                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mt-4">
                    Observaciones
                  </label>
                  <textarea
                    maxLength={500}
                    value={editorForm.Observaciones}
                    onChange={(e) =>
                      setEditorForm((actual) => ({
                        ...actual,
                        Observaciones: e.target.value,
                      }))
                    }
                    className="app-input min-h-24 resize-y"
                    placeholder="Observaciones de la factura"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-2xl bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-100 dark:border-cyan-900 p-4">
                    <p className="text-xs text-cyan-700 dark:text-cyan-300">Subtotal</p>
                    <p className="text-lg font-bold text-cyan-900 dark:text-cyan-100">{formatCurrency(resumenEditor.subtotal)}</p>
                  </div>
                  <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900 p-4">
                    <p className="text-xs text-amber-700 dark:text-amber-300">IVA</p>
                    <p className="text-lg font-bold text-amber-900 dark:text-amber-100">{formatCurrency(resumenEditor.iva)}</p>
                  </div>
                  <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900 p-4">
                    <p className="text-xs text-emerald-700 dark:text-emerald-300">Total</p>
                    <p className="text-lg font-bold text-emerald-900 dark:text-emerald-100">{formatCurrency(resumenEditor.total)}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xl font-bold text-gray-800 dark:text-gray-100">Detalle de productos</h4>
                  <button onClick={agregarDetalle} className="app-btn-secondary px-4 py-2">
                    + Agregar línea
                  </button>
                </div>

                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                  {editorForm.Detalle.map((item, index) => (
                    <div
                      key={`${index}-${item.IdProducto}`}
                      className="rounded-2xl border border-gray-200 dark:border-gray-800 p-4 space-y-3 bg-gray-50 dark:bg-gray-800/40"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                            Producto
                          </label>
                          <select
                            value={item.IdProducto}
                            onChange={(e) => actualizarDetalle(index, "IdProducto", e.target.value)}
                            className="app-input"
                          >
                            <option value="">Seleccionar producto</option>
                            {productos.map((producto) => (
                              <option key={producto.IdProducto} value={producto.IdProducto}>
                                {producto.Descripcion} {producto.Talla ? `- ${producto.Talla}` : ""}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                            Cantidad
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={item.Cantidad}
                            onChange={(e) =>
                              actualizarDetalle(index, "Cantidad", e.target.value)
                            }
                            className="app-input"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                            Descripción
                          </label>
                          <input
                            type="text"
                            value={item.Descripcion}
                            onChange={(e) =>
                              actualizarDetalle(index, "Descripcion", e.target.value)
                            }
                            className="app-input"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                            Talla
                          </label>
                          <input
                            type="text"
                            value={item.Talla}
                            onChange={(e) =>
                              actualizarDetalle(index, "Talla", e.target.value)
                            }
                            className="app-input"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                            Precio unitario
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={item.PrecioUnitario}
                            onChange={(e) =>
                              actualizarDetalle(index, "PrecioUnitario", e.target.value)
                            }
                            className="app-input"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Total línea: {formatCurrency(Number(item.Cantidad || 0) * Number(item.PrecioUnitario || 0))}
                        </p>
                        <button
                          onClick={() => eliminarDetalle(index)}
                          className="text-sm font-semibold text-red-600 hover:text-red-700"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap justify-end gap-3 pt-2">
                  <button onClick={cerrarEditor} className="app-btn-secondary px-5 py-3">
                    Cancelar
                  </button>
                  <button onClick={guardarEdicion} className="app-btn-primary px-5 py-3">
                    Guardar cambios
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Reportes;
