import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { showConfirmAlert, showSuccessAlert } from "../utils/sweetAlertHelper";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";

const MainLayout = ({ children }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const handleLogout = async () => {
    const result = await showConfirmAlert(
      "¿Cerrar sesión?",
      "¿Estás seguro que deseas salir del sistema?"
    );

    if (result.isConfirmed) {
      // Limpiar datos de sesión
      localStorage.removeItem("usuario");
      localStorage.removeItem("token");
      setMenuOpen(false);

      await showSuccessAlert(
        "Sesión cerrada",
        "Has cerrado sesión correctamente."
      );

      navigate("/"); // Redirige al login
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-800 transition-colors duration-300 pb-12">
      {mobileMenuOpen && (
        <button
          type="button"
          aria-label="Cerrar menú lateral"
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
        />
      )}

      {/* Menú lateral */}
      <Sidebar
        isOpen={sidebarOpen || mobileMenuOpen}
        onClose={() => {
          setSidebarOpen(false);
          setMobileMenuOpen(false);
        }}
      />

      {/* Contenido principal */}
      <div className={`flex flex-col min-w-0 w-full transition-all duration-300 ${sidebarOpen ? "md:pl-72" : "md:pl-0"}`}>
        {/* Barra superior */}
        <header className="bg-white dark:bg-gray-900 shadow px-4 py-3 flex flex-col gap-3 md:flex-row md:justify-between md:items-center relative transition-colors duration-300">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              type="button"
              onClick={() => {
                if (window.innerWidth < 768) {
                  setMobileMenuOpen(true);
                } else {
                  setSidebarOpen((value) => !value);
                }
              }}
              className="md:hidden inline-flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-gray-700 dark:text-gray-200"
              aria-label="Abrir menú lateral"
            >
              ☰
            </button>

            <button
              type="button"
              onClick={() => setSidebarOpen((value) => !value)}
              className="hidden md:inline-flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Mostrar u ocultar menú lateral"
            >
              {sidebarOpen ? "✕ Menú" : "☰ Menú"}
            </button>

            {/* Buscador */}
            <input
              type="text"
              placeholder="🔍 Buscador"
              className="w-full md:w-64 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-cyan-500 dark:focus:border-cyan-400 transition-colors"
            />
          </div>

          {/* Sección derecha (Notificaciones + Perfil) */}
          <div className="flex flex-wrap gap-3 md:gap-6 text-gray-700 dark:text-gray-300 items-center justify-between md:justify-end w-full md:w-auto">
            <span className="hover:text-cyan-600 dark:hover:text-cyan-400 cursor-pointer transition-colors">
              🔔 Notificaciones
            </span>

            {/* Perfil con menú desplegable */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                👤 Perfil
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  ▼
                </span>
              </button>

              {/* Menú desplegable */}
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    🚪 Salir
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-100 dark:bg-gray-800 transition-colors duration-300">
          {children}
        </main>

        {/* Footer global */}
        <div className="fixed bottom-0 left-0 right-0 z-20 md:left-auto md:right-0 md:pl-72">
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
