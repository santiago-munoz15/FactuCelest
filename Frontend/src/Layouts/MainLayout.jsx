import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { showConfirmAlert } from "../utils/sweetAlertHelper";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";

const MainLayout = ({ children }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    const result = await showConfirmAlert(
      "¿Cerrar sesión?",
      "¿Estás seguro que deseas salir del sistema?"
    );

    if (result.isConfirmed) {
      //limpiar datos de sesión
      localStorage.removeItem("usuario");
      localStorage.removeItem("token");
      navigate("/"); //Redirige al login
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-800 overflow-hidden transition-colors duration-300">
      {/* Menú lateral */}
      <Sidebar />

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Barra superior */}
        <header className="bg-white dark:bg-gray-900 shadow p-4 flex justify-between items-center relative transition-colors duration-300">
          {/* Buscador */}
          <input
            type="text"
            placeholder="🔍 Buscador"
            className="border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-1 w-64 focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-cyan-500 dark:focus:border-cyan-400 transition-colors"
          />

          {/* Sección derecha (Notificaciones + Perfil) */}
          <div className="flex gap-6 text-gray-700 dark:text-gray-300 items-center">
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

        <main className="flex-1 overflow-y-auto p-6 bg-gray-100 dark:bg-gray-800 transition-colors duration-300">
          {children}
        </main>

        {/* Footer global */}
        <Footer />
      </div>
    </div>
  );
};

export default MainLayout;
