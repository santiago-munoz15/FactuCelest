import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useTheme } from "../context/useTheme";
import "../App.css";

const menu = [
  { to: "/menu", label: "Inicio", icon: "⌂" },
  { to: "/facturacion", label: "Facturación", icon: "▤" },
  { to: "/clientes", label: "Clientes", icon: "♧" },
  { to: "/productos", label: "Productos", icon: "⬡" },
  { to: "/proveedores", label: "Proveedores", icon: "▱" },
  { to: "/pagos", label: "Pagos", icon: "$" },
  { to: "/reportes", label: "Reportes", icon: "▥" },
];

export default function Sidebar({ isOpen = true, collapsed = false, onClose = () => {}, onToggleCollapse = () => {}, onLogout = () => {} }) {
  const { isDarkMode, toggleTheme } = useTheme();
  const [search, setSearch] = useState("");
  const [showConfig, setShowConfig] = useState(false);
  const filtered = menu.filter((item) => item.label.toLowerCase().includes(search.toLowerCase()));
  return <aside className={`app-sidebar ${isOpen ? "is-open" : ""} ${collapsed ? "is-collapsed" : ""}`}>
    <div className="sidebar-brand"><div className="brand-symbol">☁</div><div className="brand-copy"><strong>Factu<span>Celest</span></strong><small>Sistema de Facturación</small></div><button type="button" className="sidebar-toggle" onClick={onToggleCollapse} aria-label={collapsed ? "Expandir menú" : "Contraer menú"}>{collapsed ? "»" : "«"}</button></div>
    <label className="sidebar-search"><span aria-hidden="true">⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar en el menú…" aria-label="Buscar en el menú"/><kbd>Ctrl K</kbd></label>
    <nav className="sidebar-menu" aria-label="Navegación principal">{filtered.map((item) => <NavLink key={item.to} to={item.to} onClick={onClose} title={collapsed ? item.label : undefined} className={({ isActive }) => `sidebar-item ${isActive ? "active" : ""}`}><span className="sidebar-icon" aria-hidden="true">{item.icon}</span><span className="sidebar-label">{item.label}</span>{item.to === "/facturacion" && <span className="sidebar-chevron">⌄</span>}</NavLink>)}</nav>
    <div className="sidebar-bottom"><button type="button" className="sidebar-item sidebar-action" onClick={() => setShowConfig((value) => !value)}><span className="sidebar-icon">⚙</span><span className="sidebar-label">Configuración</span></button>{showConfig && !collapsed && <div className="sidebar-config"><span>Modo oscuro</span><button type="button" className={`theme-switch ${isDarkMode ? "enabled" : ""}`} onClick={toggleTheme} aria-label="Cambiar modo oscuro"><span/></button></div>}<button type="button" className="sidebar-profile" onClick={onLogout}><span className="profile-avatar">SM</span><span className="profile-copy"><strong>Santiago Muñoz</strong><small>Administrador</small></span><span className="profile-more">⋮</span></button></div>
  </aside>;
}
