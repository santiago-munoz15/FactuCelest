import { useState } from "react";
import CalculatorModal from "./CalculatorModal";

const initials = (name = "Santiago Muñoz") => name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();

function Icon({ name, size = 20 }) {
  const paths = {
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18M8 14h.01M12 14h.01M16 14h.01"/></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></>,
    calculator: <><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8M8 11h2M14 11h2M8 15h2M14 15h2M8 19h2M14 19h2"/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

export default function AppHeader({ onLogout }) {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  let user = {};
  try { user = JSON.parse(localStorage.getItem("usuario") || "{}"); } catch { /* Use the fallback account label. */ }
  const displayName = user.Nombre || user.nombre || user.NombreUsuario || "Santiago Muñoz";
  const today = new Date();

  return <>
  <header className="dashboard-header app-shared-header">
    <div className="dashboard-welcome"><span className="welcome-mark">✦</span><div><h1>Bienvenido, {displayName.split(" ")[0]}</h1><p>Aquí tienes un resumen general de tu sistema de facturación.</p></div></div>
    <div className="dashboard-header-actions">
      <div className="dashboard-date"><span className="header-icon"><Icon name="calendar"/></span><div><strong>{today.toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</strong><span>{today.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}</span></div></div>
      <button type="button" className="header-icon calculator-open-button" aria-label="Abrir calculadora" title="Calculadora" onClick={() => setCalculatorOpen(true)}><Icon name="calculator"/></button>
      <button type="button" className="header-icon notification-button" aria-label="Notificaciones"><Icon name="bell"/><i/></button>
      <div className="dashboard-profile-wrap"><button type="button" className="dashboard-avatar" aria-label="Abrir menú de perfil" aria-expanded={profileMenuOpen} onClick={() => setProfileMenuOpen((open) => !open)}>{initials(displayName)}</button>{profileMenuOpen && <div className="dashboard-profile-menu"><strong>{displayName}</strong><span>{user.Rol || user.rol || "Administrador"}</span><button type="button" onClick={() => { setProfileMenuOpen(false); onLogout(); }}>Cerrar sesión</button></div>}</div>
    </div>
  </header>
  {calculatorOpen && <CalculatorModal onClose={() => setCalculatorOpen(false)}/>}
  </>;
}
