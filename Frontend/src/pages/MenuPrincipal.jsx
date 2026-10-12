import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { buildApiUrl } from "../config/api";
import "../App.css";

const money = (value) => `$${Number(value || 0).toLocaleString("es-CO")}`;
const shortDate = (value) => new Date(value).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
const initials = (name = "Santiago Muñoz") => name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();

function Icon({ name, size = 20 }) {
  const paths = {
    chart: <><path d="M4 19V5"/><path d="M4 19h17"/><path d="M8 15v-4M13 15V7M18 15v-7"/></>,
    invoice: <><path d="M7 3h8l4 4v14H7z"/><path d="M15 3v5h5M10 12h6M10 16h6"/></>,
    box: <><path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="M3 8v9l9 5 9-5V8M12 13v9"/></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="10" cy="7" r="4"/><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18M8 14h.01M12 14h.01M16 14h.01"/></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function SalesChart({ sales }) {
  const points = useMemo(() => {
    const grouped = new Map();
    sales.forEach((sale) => {
      const date = new Date(sale.Dia ?? sale.Fecha);
      if (Number.isNaN(date.getTime())) return;
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const current = grouped.get(key) || { date, total: 0 };
      current.total += Number(sale.TotalVentas ?? sale.Total ?? 0);
      grouped.set(key, current);
    });
    return [...grouped.values()].sort((a, b) => a.date - b.date).slice(-7);
  }, [sales]);
  if (!points.length) return <div className="dashboard-empty">No hay ventas para mostrar en este periodo.</div>;
  const max = Math.max(...points.map((item) => item.total), 1);
  const coords = points.map((item, i) => `${38 + i * (700 / Math.max(points.length - 1, 1))},${168 - item.total / max * 125}`).join(" ");
  const area = `38,168 ${coords} ${38 + (points.length - 1) * (700 / Math.max(points.length - 1, 1))},168`;
  return <div className="dashboard-chart-wrap"><div className="chart-labels"><span>{money(max)}</span><span>{money(max * .66)}</span><span>{money(max * .33)}</span><span>$0</span></div><svg className="dashboard-chart" viewBox="0 0 760 195" role="img" aria-label="Ventas mensuales"><defs><linearGradient id="salesFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#13c2dc" stopOpacity=".45"/><stop offset="100%" stopColor="#13c2dc" stopOpacity=".04"/></linearGradient></defs>{[43, 84, 126, 168].map((y) => <line key={y} x1="38" x2="738" y1={y} y2={y} className="chart-gridline"/>)}<polygon points={area} fill="url(#salesFill)"/><polyline points={coords} fill="none" stroke="#08b9d5" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>{points.map((item, i) => { const x = 38 + i * (700 / Math.max(points.length - 1, 1)); const y = 168 - item.total / max * 125; return <circle key={item.date.toISOString()} cx={x} cy={y} r="4.5" fill="#08b9d5"/>; })}<line x1="38" x2="738" y1="168" y2="168" className="chart-axis"/></svg><div className="chart-months">{points.map((item) => <span key={item.date.toISOString()}>{item.date.toLocaleDateString("es-CO", { month: "short" })}</span>)}</div></div>;
}

export default function MenuPrincipal() {
  const navigate = useNavigate();
  const [facturas, setFacturas] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [ventasHoy, setVentasHoy] = useState(0);
  const [facturasPendientes, setFacturasPendientes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({});

  useEffect(() => {
    try { setUser(JSON.parse(localStorage.getItem("usuario") || "{}")); } catch { setUser({}); }
    Promise.allSettled([
      axios.get(buildApiUrl("/api/facturas/ultimas?cantidad=5")),
      axios.get(buildApiUrl("/api/facturas/ventas-mensuales")),
      axios.get(buildApiUrl("/api/productos/listarp")),
      axios.get(buildApiUrl("/api/clientes/listar")),
      axios.get(buildApiUrl("/api/facturas/reporte?periodo=dia")),
      axios.get(buildApiUrl("/api/pagos")),
    ]).then(([invoices, sales, products, customers, today, payments]) => {
      if (invoices.status === "fulfilled" && invoices.value.data.success) setFacturas(invoices.value.data.facturas || []);
      if (sales.status === "fulfilled" && sales.value.data.success) setVentas(sales.value.data.ventas || []);
      if (products.status === "fulfilled" && Array.isArray(products.value.data)) setProductos(products.value.data);
      if (customers.status === "fulfilled" && customers.value.data.success) setClientes(customers.value.data.clientes || []);
      if (today.status === "fulfilled" && today.value.data.success) setVentasHoy((today.value.data.facturas || []).reduce((sum, invoice) => sum + Number(invoice.Total || 0), 0));
      if (payments.status === "fulfilled" && payments.value.data.success) setFacturasPendientes((payments.value.data.facturas || []).filter((invoice) => Number(invoice.Saldo) > 0).length);
    }).finally(() => setLoading(false));
  }, []);

  const displayName = user.Nombre || user.nombre || user.NombreUsuario || "Santiago Muñoz";
  const today = new Date();

  return <div className="dashboard-page">
    <header className="dashboard-header"><div className="dashboard-welcome"><span className="welcome-mark">✦</span><div><h1>Bienvenido, {displayName.split(" ")[0]}</h1><p>Aquí tienes un resumen general de tu sistema de facturación.</p></div></div><div className="dashboard-header-actions"><div className="dashboard-date"><span className="header-icon"><Icon name="calendar"/></span><div><strong>{today.toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</strong><span>{today.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}</span></div></div><button className="header-icon notification-button" aria-label="Notificaciones"><Icon name="bell"/><i /></button><button className="dashboard-avatar" aria-label="Perfil">{initials(displayName)}</button></div></header>

    <section className="dashboard-stats" aria-label="Resumen"><StatCard icon="chart" tone="cyan" label="Ventas de Hoy" value={loading ? "…" : money(ventasHoy)} note="Total facturado hoy"/><StatCard icon="invoice" tone="orange" label="Facturas Pendientes" value={loading ? "…" : facturasPendientes} note="Con saldo por cobrar"/><StatCard icon="box" tone="purple" label="Productos Registrados" value={loading ? "…" : productos.length} note="En inventario"/><StatCard icon="users" tone="green" label="Clientes Registrados" value={loading ? "…" : clientes.length} note="En tu sistema"/></section>

    <section className="dashboard-main-grid"><article className="dashboard-panel sales-panel"><div className="panel-heading"><div className="panel-title"><span className="panel-icon cyan"><Icon name="chart"/></span><div><h2>Ventas Mensuales</h2><p>Comparativo de ventas de los últimos meses</p></div></div><span className="period-pill">Últimos meses</span></div><SalesChart sales={ventas}/><div className="chart-legend"><i/>Ventas</div></article>
      <article className="dashboard-panel invoices-panel"><div className="panel-heading"><div className="panel-title"><span className="panel-icon purple"><Icon name="invoice"/></span><h2>Últimas Facturas</h2></div><button className="panel-link" onClick={() => navigate("/reportes")}>Ver todas →</button></div><div className="dashboard-table-scroll"><table className="dashboard-table"><thead><tr><th>#</th><th>Cliente</th><th>Fecha</th><th>Total</th></tr></thead><tbody>{!loading && facturas.length === 0 ? <tr><td colSpan="4" className="table-empty">No hay facturas registradas.</td></tr> : facturas.map((invoice) => <tr key={invoice.IdFactura}><td className="invoice-id">#{invoice.IdFactura}</td><td>{invoice.NombreCliente || "Cliente"}</td><td>{shortDate(invoice.Fecha)}</td><td className="invoice-total">{money(invoice.Total)}</td></tr>)}</tbody></table></div></article></section>

    <section className="dashboard-bottom-grid"><article className="dashboard-panel"><div className="panel-heading"><div className="panel-title"><span className="panel-icon purple"><Icon name="box"/></span><h2>Productos Registrados</h2></div><button className="panel-link" onClick={() => navigate("/productos")}>Ver todos →</button></div><div className="dashboard-table-scroll"><table className="dashboard-table product-table"><thead><tr><th>Referencia</th><th>Producto</th><th>Talla</th><th>Precio</th></tr></thead><tbody>{productos.slice(0, 4).map((product, i) => <tr key={product.IdProducto || product.Referencia || i}><td className="product-number">{product.Referencia || product.IdProducto || i + 1}</td><td>{product.Descripcion || "Producto"}</td><td>{product.Talla || "—"}</td><td className="invoice-total">{money(product.PrecioVenta)}</td></tr>)}{!loading && productos.length === 0 && <tr><td colSpan="4" className="table-empty">No hay productos registrados.</td></tr>}</tbody></table></div></article>
      <article className="dashboard-panel"><div className="panel-heading"><div className="panel-title"><span className="panel-icon green"><Icon name="users"/></span><h2>Clientes Recientes</h2></div><button className="panel-link" onClick={() => navigate("/clientes")}>Ver todos →</button></div><div className="dashboard-table-scroll"><table className="dashboard-table customers-table"><thead><tr><th>Cliente</th><th>Email</th><th>Ciudad</th></tr></thead><tbody>{clientes.slice(0, 4).map((client, i) => <tr key={client.Documento || client.IdCliente || i}><td>{client.Nombre || "Cliente"}</td><td>{client.Correo || "—"}</td><td>{client.Ciudad || "—"}</td></tr>)}{!loading && clientes.length === 0 && <tr><td colSpan="3" className="table-empty">No hay clientes registrados.</td></tr>}</tbody></table></div></article></section>
  </div>;
}

function StatCard({ icon, tone, label, value, note }) {
  return <article className={`stat-card ${tone}`}><span className="stat-icon"><Icon name={icon} size={25}/></span><div className="stat-copy"><span className="stat-label">{label}</span><strong>{value}</strong><span className="stat-note">{note}</span></div></article>;
}
