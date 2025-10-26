import React from "react";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";

const MainLayout = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Menú lateral */}
      <Sidebar />

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Barra superior */}
        <header className="bg-white shadow p-4 flex justify-between items-center">
          <input
            type="text"
            placeholder="🔍 Buscador"
            className="border rounded-lg px-4 py-1 w-64"
          />
          <div className="flex gap-6 text-gray-700">
            <span>🔔 Notificaciones</span>
            <span>👤 Perfil</span>
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
