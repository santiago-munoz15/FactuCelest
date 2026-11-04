import ModuleHero from "../components/ModuleHero";
import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { buildApiUrl } from "../config/api";
import { showErrorAlert, showSuccessAlert } from "../utils/sweetAlertHelper";
import { printPaymentInvoice } from "../utils/printPaymentInvoice";

const money = (value) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(Number(value || 0));
const date = (value) => {
  if (!value) return "—";
  const text = String(value).slice(0, 10);
  const parts = text.split("-");
  if (parts.length !== 3) return new Date(value).toLocaleDateString("es-CO");
  return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
};

const emptyPayment = { monto: "", metodoPago: "Efectivo", pagador: "", observaciones: "" };
const MONTO_MINIMO_ABONO = 5000;

export default function Pagos() {
  const [facturas, setFacturas] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [estado, setEstado] = useState("");
  const [loading, setLoading] = useState(true);
  const [seleccionada, setSeleccionada] = useState(null);
  const [abonos, setAbonos] = useState([]);
  const [form, setForm] = useState(emptyPayment);
  const [guardando, setGuardando] = useState(false);
  const [imprimiendo, setImprimiendo] = useState(false);

  const cargarFacturas = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (estado) params.set("estado", estado);
      if (busqueda.trim()) params.set("busqueda", busqueda.trim());
      const response = await axios.get(buildApiUrl(`/api/pagos?${params.toString()}`));
      setFacturas(response.data.facturas || []);
    } catch (error) {
      showErrorAlert("Error", error.response?.data?.error || "No se pudieron cargar las facturas pendientes.");
    } finally {
      setLoading(false);
    }
  }, [busqueda, estado]);

  useEffect(() => { cargarFacturas(); }, [cargarFacturas]);

  const resumen = useMemo(() => facturas.reduce((total, invoice) => ({
    porCobrar: total.porCobrar + Number(invoice.Saldo || 0),
    vencido: total.vencido + (invoice.Estado === "Vencida" ? Number(invoice.Saldo || 0) : 0),
    abonado: total.abonado + Number(invoice.MontoPagado || 0),
  }), { porCobrar: 0, vencido: 0, abonado: 0 }), [facturas]);

  const abrirFactura = async (factura) => {
    setSeleccionada(factura);
    setForm({ ...emptyPayment, pagador: factura.NombreCliente || "" });
    try {
      const response = await axios.get(buildApiUrl(`/api/pagos/${factura.IdFactura}/abonos`));
      setAbonos(response.data.abonos || []);
    } catch (error) {
      setAbonos([]);
      showErrorAlert("Error", error.response?.data?.error || "No se pudo cargar el historial de pagos.");
    }
  };

  const registrarAbono = async (event) => {
    event.preventDefault();
    if (!seleccionada) return;
    const saldoPendiente = Number(seleccionada.Saldo || 0);
    const montoMinimo = Math.min(MONTO_MINIMO_ABONO, saldoPendiente);
    const montoIngresado = Number(form.monto);
    if (!Number.isFinite(montoIngresado) || montoIngresado < montoMinimo) {
      showErrorAlert(
        "Abono menor al mínimo",
        saldoPendiente < MONTO_MINIMO_ABONO
          ? `El saldo es menor a $5.000. Para cerrar la factura debes pagar el saldo completo de ${money(saldoPendiente)}.`
          : "El abono mínimo permitido es de $5.000 COP."
      );
      return;
    }
    if (montoIngresado > saldoPendiente) {
      showErrorAlert("Abono superior al saldo", `El abono no puede superar el saldo pendiente de ${money(saldoPendiente)}.`);
      return;
    }
    setGuardando(true);
    try {
      await axios.post(buildApiUrl(`/api/pagos/${seleccionada.IdFactura}/abonos`), form);
      await showSuccessAlert("Abono registrado", "El saldo y el estado de la factura se actualizaron.");
      setSeleccionada(null);
      await cargarFacturas();
    } catch (error) {
      showErrorAlert("No se pudo registrar el pago", error.response?.data?.error || "Inténtalo de nuevo.");
    } finally {
      setGuardando(false);
    }
  };

  const imprimirFactura = async () => {
    if (!seleccionada) return;
    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) {
      showErrorAlert("Ventana bloqueada", "Permite las ventanas emergentes para imprimir o guardar la factura como PDF.");
      return;
    }
    setImprimiendo(true);
    try {
      const [invoiceResponse, paymentResponse] = await Promise.all([
        axios.get(buildApiUrl(`/api/facturas/detalle/${seleccionada.IdFactura}`)),
        axios.get(buildApiUrl(`/api/pagos/${seleccionada.IdFactura}/abonos`)),
      ]);
      if (!invoiceResponse.data.success || !invoiceResponse.data.factura) throw new Error("No se pudo cargar el detalle de la factura.");
      printPaymentInvoice(printWindow, invoiceResponse.data.factura, paymentResponse.data.abonos || [], seleccionada);
    } catch (error) {
      printWindow.close();
      showErrorAlert("No se pudo preparar la factura", error.response?.data?.error || error.message || "Inténtalo de nuevo.");
    } finally {
      setImprimiendo(false);
    }
  };

  return <main className="payments-page">
    <ModuleHero eyebrow="Módulo de pagos" title="Pagos y cuentas por cobrar" description="Controla saldos, abonos y fechas límite de tus facturas." stats={[{ label: "Saldo por cobrar", value: money(resumen.porCobrar) }, { label: "Facturas vencidas", value: facturas.filter((item) => item.Estado === "Vencida").length }]} toolbar={<><label className="module-hero-search"><span>⌕</span><input value={busqueda} onChange={(event) => setBusqueda(event.target.value)} placeholder="Buscar por cliente, documento o factura..." aria-label="Buscar pagos"/></label><div className="module-hero-controls"><select value={estado} onChange={(event) => setEstado(event.target.value)} aria-label="Filtrar por estado"><option value="">Todos los estados</option><option>Pendiente</option><option>Abonada</option><option>Vencida</option><option>Pagada</option></select><button type="button" className="module-hero-secondary-action" onClick={cargarFacturas}>Actualizar</button></div></>}/>


    <section className="payments-list-card">
      <div className="payments-table-scroll"><table className="payments-table"><thead><tr><th>Factura</th><th>Cliente</th><th>Emisión</th><th>Vencimiento</th><th>Total</th><th>Abonado</th><th>Saldo</th><th>Estado</th><th>Acción</th></tr></thead><tbody>
        {loading ? <tr><td colSpan="9" className="payments-empty">Cargando cuentas por cobrar...</td></tr> : facturas.length === 0 ? <tr><td colSpan="9" className="payments-empty">No hay facturas para los filtros seleccionados.</td></tr> : facturas.map((factura) => <tr key={factura.IdFactura}><td><strong>#{factura.IdFactura}</strong></td><td>{factura.NombreCliente}<small className="payments-document">{factura.DocumentoCliente}</small></td><td>{date(factura.Fecha)}</td><td>{date(factura.FechaVencimiento)}</td><td>{money(factura.Total)}</td><td>{money(factura.MontoPagado)}</td><td className="payments-balance">{money(factura.Saldo)}</td><td><span className={`payments-status ${factura.Estado.toLowerCase()}`}>{factura.Estado}</span></td><td><button className="payments-action" type="button" onClick={() => abrirFactura(factura)}>{factura.Saldo > 0 ? "Ver / abonar" : "Ver pagos"}</button></td></tr>)}
      </tbody></table></div>
    </section>

    {seleccionada && <div className="payments-overlay" onMouseDown={(event) => event.target === event.currentTarget && setSeleccionada(null)}><section className="payments-modal" role="dialog" aria-modal="true" aria-labelledby="payments-modal-title"><header><div><h2 id="payments-modal-title">Factura #{seleccionada.IdFactura}</h2><p>{seleccionada.NombreCliente} · {seleccionada.CondicionPago === "Contado" ? "Contado" : seleccionada.CondicionPago === "Credito30Dias" ? "Crédito a 30 días" : "Condición no especificada"} · Vence {date(seleccionada.FechaVencimiento)}</p></div><div className="payments-modal-actions"><button type="button" className="payments-print" onClick={imprimirFactura} disabled={imprimiendo}>{imprimiendo ? "Preparando..." : "Imprimir / guardar PDF"}</button><button type="button" onClick={() => setSeleccionada(null)} aria-label="Cerrar">×</button></div></header>
      <div className="payments-modal-summary"><span>Total <strong>{money(seleccionada.Total)}</strong></span><span>Abonado <strong>{money(seleccionada.MontoPagado)}</strong></span><span>Saldo <strong>{money(seleccionada.Saldo)}</strong></span></div>
      {Number(seleccionada.Saldo) > 0 && <form className="payments-form" noValidate onSubmit={registrarAbono}><h3>Registrar abono</h3><div className="payments-form-grid"><label>Monto<input type="number" min={Math.min(MONTO_MINIMO_ABONO, Number(seleccionada.Saldo))} max={seleccionada.Saldo} step="0.01" required value={form.monto} onChange={(event) => setForm({ ...form, monto: event.target.value })} placeholder={`Mínimo ${money(Math.min(MONTO_MINIMO_ABONO, Number(seleccionada.Saldo)))}`}/><small className="payments-minimum-note">Mínimo $5.000 COP; si el saldo es menor, paga el saldo completo.</small></label><label>Medio de pago<select value={form.metodoPago} onChange={(event) => setForm({ ...form, metodoPago: event.target.value })}><option>Efectivo</option><option>Transferencia</option></select></label><label>Quién realizó el pago<input maxLength="150" value={form.pagador} onChange={(event) => setForm({ ...form, pagador: event.target.value })} placeholder="Nombre del pagador"/></label><label>Observaciones<input maxLength="500" value={form.observaciones} onChange={(event) => setForm({ ...form, observaciones: event.target.value })} placeholder="Opcional"/></label></div><button className="payments-save" disabled={guardando}>{guardando ? "Guardando..." : "Guardar abono"}</button></form>}
      <h3 className="payments-history-title">Historial de pagos</h3>{abonos.length ? <div className="payments-history">{abonos.map((abono) => <article key={abono.IdPago}><div><strong>{money(abono.Monto)}</strong><span>{date(abono.FechaPago)} · {abono.MetodoPago}</span></div><div><b>{abono.Pagador || seleccionada.NombreCliente}</b>{abono.Observaciones && <small>{abono.Observaciones}</small>}</div></article>)}</div> : <p className="payments-no-history">Esta factura todavía no tiene abonos registrados.</p>}
    </section></div>}
  </main>;
}
