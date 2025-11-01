import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";

const MainLayout = ({ children }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    // Aquí puedes limpiar datos de sesión si los estás guardando
    localStorage.removeItem("usuario");
    localStorage.removeItem("token");
    navigate("/"); // 👈 Redirige al login
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Menú lateral */}
      <Sidebar />

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Barra superior */}
        <header className="bg-white shadow p-4 flex justify-between items-center relative">
          {/* Buscador */}
          <input
            type="text"
            placeholder="🔍 Buscador"
            className="border rounded-lg px-4 py-1 w-64 focus:outline-none"
          />

          {/* Sección derecha (Notificaciones + Perfil) */}
          <div className="flex gap-6 text-gray-700 items-center">
            <span>🔔 Notificaciones</span>

            {/* Perfil con menú desplegable */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-md hover:bg-gray-200"
              >
                👤 Perfil
                <span className="text-sm text-gray-500">▼</span>
              </button>

              {/* Menú desplegable */}
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-lg z-50">
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    🚪 Salir
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Contenido dinámico */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>

        {/* Footer global */}
        <Footer />
      </div>
    </div>
  );
};

export default MainLayout;
