import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import "../App.css";

const menuGroups = [
  [{ to: "/menu", label: "MenuPrincipal", icon: "⌂" }, { to: "/clientes", label: "Clientes", icon: "♙" }],
  [{ to: "/facturacion", label: "Facturación", icon: "▣" }, { to: "/productos", label: "Productos", icon: "▤" }, { to: "/pagos", label: "Pagos", icon: "$" }, { to: "/reportes", label: "Reportes", icon: "⌁" }],
];

function Sidebar({ isOpen = true, collapsed = false, onClose = () => {}, onToggleCollapse = () => {}, onLogout = () => {} }) {
  const { isDarkMode, toggleTheme } = useTheme();
  const [showConfig, setShowConfig] = useState(false);
  const [search, setSearch] = useState("");
  const normalizedSearch = search.trim().toLowerCase();

  return (
    <aside className={`app-sidebar ${isOpen ? "is-open" : ""} ${collapsed ? "is-collapsed" : ""}`}>
      <div className="sidebar-header">
        <h2>FactuCelest</h2>
        <button type="button" className="sidebar-toggle" onClick={onToggleCollapse} aria-label={collapsed ? "Expandir menú" : "Contraer menú"}>{collapsed ? "☰" : "×"}</button>
      </div>
      <label className="sidebar-search">
        <span aria-hidden="true">⌕</span>
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar" aria-label="Buscar en el menú" />
      </label>
      <nav className="sidebar-menu" aria-label="Navegación principal">
        {menuGroups.map((group, groupIndex) => (
          <div className="sidebar-group" key={groupIndex}>
            {group.filter((item) => item.label.toLowerCase().includes(normalizedSearch)).map((item) => (
              <NavLink key={item.to} to={item.to} onClick={onClose} className={({ isActive }) => `sidebar-item ${isActive ? "active" : ""}`} title={collapsed ? item.label : undefined}>
                <span className="sidebar-icon" aria-hidden="true">{item.icon}</span><span className="sidebar-label">{item.label}</span>
              </NavLink>
            ))}
            {groupIndex < menuGroups.length - 1 && <div className="sidebar-divider" />}
          </div>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <button type="button" className="sidebar-item sidebar-action" onClick={() => setShowConfig((value) => !value)} title={collapsed ? "Configuración" : undefined}><span className="sidebar-icon" aria-hidden="true">⚙</span><span className="sidebar-label">Configuración</span></button>
        {showConfig && !collapsed && <div className="sidebar-config"><span>Modo oscuro</span><button type="button" className={`theme-switch ${isDarkMode ? "enabled" : ""}`} onClick={toggleTheme} aria-label="Cambiar modo oscuro"><span /></button></div>}
        <button type="button" className="sidebar-item sidebar-action" onClick={onLogout} title={collapsed ? "Cerrar sesión" : undefined}><span className="sidebar-icon" aria-hidden="true">↪</span><span className="sidebar-label">Cerrar sesión</span></button>
      </div>
    </aside>
  );
}

export default Sidebar;
