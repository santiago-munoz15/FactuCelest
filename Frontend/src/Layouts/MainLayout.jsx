import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { showConfirmAlert, showSuccessAlert } from "../utils/sweetAlertHelper";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";

const MainLayout = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const sidebarOpen = true;
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((value) => !value)}
        onLogout={handleLogout}
        onClose={() => {
          setMobileMenuOpen(false);
        }}
      />

      {/* Contenido principal */}
      <div className={`app-layout-content flex flex-col min-w-0 w-full transition-all duration-300 ${sidebarOpen ? (sidebarCollapsed ? "sidebar-is-collapsed" : "sidebar-is-expanded") : "sidebar-is-hidden"}`}>
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
