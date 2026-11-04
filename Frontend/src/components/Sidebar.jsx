import { useState } from "react";
import { NavLink } from "react-router-dom";
import "../App.css";

const menu = [
  { to: "/menu", label: "Inicio", icon: "dashboard" },
  { to: "/facturacion", label: "Facturación", icon: "facturacion" },
  { to: "/clientes", label: "Clientes", icon: "clientes" },
  { to: "/productos", label: "Productos", icon: "productos" },
  { to: "/proveedores", label: "Proveedores", icon: "▱" },
  { to: "/categorias", label: "Categorías", icon: "◇" },
  { to: "/pagos", label: "Pagos", icon: "pagos" },
  { to: "/reportes", label: "Reportes", icon: "reportes" },
  { to: "/comisiones", label: "Comisiones", icon: "comisiones" },
];

function ModuleIcon({ name }) {
  const icons = {
    dashboard: <><rect x="3" y="3" width="7" height="7" rx="1.2"/><rect x="14" y="3" width="7" height="7" rx="1.2"/><rect x="3" y="14" width="7" height="7" rx="1.2"/><rect x="14" y="14" width="7" height="7" rx="1.2"/></>,
    facturacion: <><path d="M6 3h12a2 2 0 0 1 2 2v16l-3-2-3 2-3-2-3 2-4-2V5a2 2 0 0 1 2-2Z"/><path d="M9 8h6M9 12h6M9 16h3"/></>,
    clientes: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="10" cy="7" r="4"/><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
    pagos: <><rect x="3" y="6" width="18" height="15" rx="2"/><path d="M3 10h18M7 6V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v2M16 15h2"/></>,
    productos: <><path d="m12 2 9 5-9 5-9-5 9-5Z"/><path d="M3 7v10l9 5 9-5V7M12 12v10"/></>,
    reportes: <><path d="M3 3v18h18"/><path d="M18 17V9M13 17V5M8 17v-3"/><path d="m5 11 5-5 4 3 6-6"/></>,
    comisiones: <><circle cx="7" cy="6" r="2.5"/><circle cx="17" cy="5" r="2.5"/><circle cx="19" cy="13" r="2.5"/><path d="M4 18.5 9.5 21a3 3 0 0 0 2.8-.4l7.2-5.3a2 2 0 0 0-2.2-3.3l-4 2.4h-4"/><path d="M2.5 14.5 6 12h3.5a2 2 0 0 1 0 4H8"/><path d="m10 8 2 1.5M16 8l1 2"/></>,
  };
  return <svg className="sidebar-module-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{icons[name]}</svg>;
}

export default function Sidebar({ isOpen = true, collapsed = false, onClose = () => {}, onToggleCollapse = () => {}, onLogout = () => {} }) {
  const [search, setSearch] = useState("");
  const filtered = menu.filter((item) => item.label.toLowerCase().includes(search.toLowerCase()));
  return <aside className={`app-sidebar ${isOpen ? "is-open" : ""} ${collapsed ? "is-collapsed" : ""}`}>
    <div className="sidebar-brand"><div className="brand-symbol">☁</div><div className="brand-copy"><strong>Factu<span>Celest</span></strong><small>Sistema de Facturación</small></div><button type="button" className="sidebar-toggle" onClick={onToggleCollapse} aria-label={collapsed ? "Expandir menú" : "Contraer menú"}>{collapsed ? "»" : "«"}</button></div>
    <label className="sidebar-search"><span aria-hidden="true">⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar en el menú…" aria-label="Buscar en el menú"/><kbd>Ctrl K</kbd></label>
    <nav className="sidebar-menu" aria-label="Navegación principal">{filtered.map((item) => <NavLink key={item.to} to={item.to} onClick={onClose} title={collapsed ? item.label : undefined} className={({ isActive }) => `sidebar-item ${isActive ? "active" : ""}`}><span className="sidebar-icon" aria-hidden="true">{["dashboard", "facturacion", "clientes", "pagos", "productos", "reportes", "comisiones"].includes(item.icon) ? <ModuleIcon name={item.icon}/> : item.icon}</span><span className="sidebar-label">{item.label}</span>{item.to === "/facturacion" && <span className="sidebar-chevron">⌄</span>}</NavLink>)}</nav>
    <div className="sidebar-bottom"><button type="button" className="sidebar-profile" onClick={onLogout}><span className="profile-avatar">SM</span><span className="profile-copy"><strong>Santiago Muñoz</strong><small>Administrador</small></span><span className="profile-more">⋮</span></button></div>
  </aside>;
}
