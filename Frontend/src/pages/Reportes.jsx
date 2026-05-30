import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  showErrorAlert,
  showInfoAlert,
  showSuccessAlert,
} from "../utils/sweetAlertHelper";
import { buildApiUrl } from "../config/api";

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

const formatDate = (value) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
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
  const [loading, setLoading] = useState(false);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [periodo, setPeriodo] = useState("mes");
  const [busqueda, setBusqueda] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [showEditor, setShowEditor] = useState(false);
  const [editorFacturaId, setEditorFacturaId] = useState(null);
  const [editorForm, setEditorForm] = useState({
    DocumentoCliente: "",
    MetodoPago: "Efectivo",
    Detalle: [initialDetalleItem()],
  });
  const vendedor = useMemo(() => getUsuarioLocal(), []);

  const cargarProductos = async () => {
    try {
      const res = await axios.get(buildApiUrl("/api/productos/listarp"));
      if (Array.isArray(res.data)) {
        setProductos(res.data);
      }
    } catch (error) {
      console.error("Error al cargar productos:", error);
    }
  };

  const cargarFacturas = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("periodo", periodo);

      if (busqueda.trim()) {
        params.set("busqueda", busqueda.trim());
      }

      if (periodo === "rango") {
        if (desde) {
          params.set("desde", desde);
        }
        if (hasta) {
          params.set("hasta", hasta);
        }
      }

      const res = await axios.get(
        buildApiUrl(`/api/facturas/reporte?${params.toString()}`)
      );

      if (res.data.success) {
        setFacturas(res.data.facturas || []);

        if (res.data.facturas?.length > 0) {
          const primera = res.data.facturas[0];
          setFacturaSeleccionada(primera);
          await cargarDetalleFactura(primera.IdFactura, false);
        } else {
          setFacturaSeleccionada(null);
          setFacturaDetalle(null);
        }
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
  };

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

  useEffect(() => {
    cargarProductos();
    cargarFacturas();
  }, []);

  const handleBuscar = async () => {
    await cargarFacturas();
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
        buildApiUrl(
          `/api/facturas/excel/${idFactura}?vendedor=${encodeURIComponent(vendedor)}`
        ),
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

  const resumenActual = useMemo(() => {
    return facturas.reduce(
      (acc, item) => {
        acc.cantidad += 1;
        acc.total += Number(item.Total || 0);
        return acc;
      },
      { cantidad: 0, total: 0 }
    );
  }, [facturas]);

  const ventasDiarias = useMemo(() => {
    const porDia = new Map();

    facturas.forEach((factura) => {
      const dia = formatDate(factura.Fecha);
      const actual = porDia.get(dia) || { cantidad: 0, total: 0 };
      actual.cantidad += 1;
      actual.total += Number(factura.Total || 0);
      porDia.set(dia, actual);
    });

    return Array.from(porDia.entries()).map(([dia, data]) => ({ dia, ...data }));
  }, [facturas]);

  const facturaEnVista = facturaDetalle || facturaSeleccionada;
  const resumenEditor = calcularTotales(editorForm.Detalle);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="rounded-[2rem] bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-900 text-white shadow-2xl overflow-hidden">
        <div className="p-6 md:p-8 border-b border-white/10">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <p className="text-cyan-200 uppercase tracking-[0.3em] text-xs mb-3">
                Reportería FactuCelest
              </p>
              <h1 className="text-3xl md:text-4xl font-black mb-3">
                Control de facturas, ventas y exportación
              </h1>
              <p className="text-slate-200 max-w-3xl">
                Consulta facturas almacenadas, revisa ventas del día o del mes,
                edítalas si hubo un error de digitación y descarga cada factura
                en Excel con el formato de la empresa.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 min-w-[260px]">
              <div className="rounded-2xl bg-white/10 backdrop-blur border border-white/10 p-4">
                <p className="text-xs text-cyan-100">Facturas</p>
                <p className="text-2xl font-bold">{resumenActual.cantidad}</p>
              </div>
              <div className="rounded-2xl bg-white/10 backdrop-blur border border-white/10 p-4">
                <p className="text-xs text-cyan-100">Ventas</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(resumenActual.total)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 p-6">
          <div className="rounded-2xl bg-white/10 backdrop-blur border border-white/10 p-4">
            <p className="text-sm text-cyan-100 mb-1">Vendedor activo</p>
            <p className="text-xl font-semibold">{vendedor}</p>
          </div>
          <div className="rounded-2xl bg-white/10 backdrop-blur border border-white/10 p-4">
            <p className="text-sm text-cyan-100 mb-1">Periodo actual</p>
            <p className="text-xl font-semibold capitalize">
              {periodo === "rango" ? "Rango personalizado" : periodo}
            </p>
          </div>
          <div className="rounded-2xl bg-white/10 backdrop-blur border border-white/10 p-4">
            <p className="text-sm text-cyan-100 mb-1">Ventas diarias</p>
            <p className="text-xl font-semibold">{ventasDiarias.length}</p>
          </div>
          <div className="rounded-2xl bg-white/10 backdrop-blur border border-white/10 p-4">
            <p className="text-sm text-cyan-100 mb-1">Estado</p>
            <p className="text-xl font-semibold">{loading ? "Cargando" : "Listo"}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_0.9fr] gap-6">
        <section className="space-y-6">
          <div className="rounded-3xl bg-white dark:bg-gray-900 shadow-xl border border-gray-100 dark:border-gray-800 p-5 md:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  Filtros de consulta
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Filtra por hoy, mes actual, rango o texto libre.
                </p>
              </div>
              <button
                onClick={handleBuscar}
                className="app-btn-primary px-5 py-3"
              >
                🔎 Buscar
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 mb-4">
              {[
                ["todos", "Todas"],
                ["dia", "Hoy"],
                ["mes", "Mes actual"],
                ["rango", "Rango"],
              ].map(([valor, etiqueta]) => (
                <button
                  key={valor}
                  onClick={() => setPeriodo(valor)}
                  className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition-all ${
                    periodo === valor
                      ? "border-cyan-500 bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300"
                      : "border-gray-200 bg-gray-50 text-gray-600 hover:border-cyan-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  }`}
                >
                  {etiqueta}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por factura, documento o nombre"
                className="app-input"
              />
              <input
                type="date"
                value={desde}
                onChange={(e) => setDesde(e.target.value)}
                className="app-input"
                disabled={periodo !== "rango"}
              />
              <input
                type="date"
                value={hasta}
                onChange={(e) => setHasta(e.target.value)}
                className="app-input"
                disabled={periodo !== "rango"}
              />
            </div>
          </div>

          <div className="rounded-3xl bg-white dark:bg-gray-900 shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="p-5 md:p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  Facturas consultadas
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Selecciona una fila para ver el detalle completo.
                </p>
              </div>
              <span className="text-sm text-cyan-600 dark:text-cyan-400 font-semibold">
                {facturas.length} resultados
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">Factura</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">Cliente</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">Documento</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">Fecha</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">Método</th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">Total</th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="px-4 py-10 text-center text-gray-500 dark:text-gray-400">
                        ⏳ Cargando facturas...
                      </td>
                    </tr>
                  ) : facturas.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-4 py-10 text-center text-gray-500 dark:text-gray-400">
                        No hay facturas para el filtro seleccionado.
                      </td>
                    </tr>
                  ) : (
                    facturas.map((factura) => {
                      const activo = facturaSeleccionada?.IdFactura === factura.IdFactura;

                      return (
                        <tr
                          key={factura.IdFactura}
                          onClick={() => cargarDetalleFactura(factura.IdFactura)}
                          className={`cursor-pointer border-t border-gray-100 dark:border-gray-800 transition-colors ${
                            activo
                              ? "bg-cyan-50 dark:bg-cyan-950/30"
                              : "hover:bg-gray-50 dark:hover:bg-gray-800/70"
                          }`}
                        >
                          <td className="px-4 py-3 font-semibold text-gray-800 dark:text-gray-100">#{factura.IdFactura}</td>
                          <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{factura.NombreCliente}</td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{factura.DocumentoCliente}</td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{formatDate(factura.Fecha)}</td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{factura.MetodoPago}</td>
                          <td className="px-4 py-3 text-right font-bold text-cyan-700 dark:text-cyan-400">
                            {formatCurrency(factura.Total)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={(event) => {
                                  event.stopPropagation();
                                  abrirEditor(factura);
                                }}
                                className="rounded-xl border border-cyan-200 px-3 py-2 text-cyan-700 hover:bg-cyan-50 dark:border-cyan-900 dark:text-cyan-300 dark:hover:bg-cyan-950/40"
                              >
                                Editar
                              </button>
                              <button
                                onClick={(event) => {
                                  event.stopPropagation();
                                  descargarExcel(factura.IdFactura);
                                }}
                                className="rounded-xl border border-gray-200 px-3 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                              >
                                Excel
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-3xl bg-white dark:bg-gray-900 shadow-xl border border-gray-100 dark:border-gray-800 p-5 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  Vista de factura
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Formato de impresión similar a la guía.
                </p>
              </div>
              {loadingDetalle && <span className="text-xs text-cyan-600">Cargando...</span>}
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
                      <p className="font-semibold text-gray-800 dark:text-gray-100">{vendedor}</p>
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

                <div className="grid grid-cols-3 gap-3">
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
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => abrirEditor(facturaEnVista)}
                    className="app-btn-primary px-5 py-3"
                  >
                    ✏️ Editar factura
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
        </aside>
      </div>

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
