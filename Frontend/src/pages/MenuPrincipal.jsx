import { useState } from "react";
import "../App.css"; // importa tus estilos generales

function MenuPrincipal() {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Menú lateral */}
      <aside className="w-56 bg-white p-4 shadow-lg flex flex-col justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-700 mb-4">FactuCelest</h2>
          <ul className="space-y-2 text-gray-700">
            <li>📊 Dashboard</li>
            <li>🧾 Facturas</li>
            <li>👥 Clientes</li>
            <li>💰 Pagos</li>
            <li>📦 Productos</li>
            <li>📈 Reportes</li>
          </ul>
        </div>
        <div className="text-gray-500 border-t pt-2">⚙️ Configuración</div>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 flex flex-col">
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

        {/* Contenido */}
        <div className="p-6 grid grid-cols-2 lg:grid-cols-4 gap-4 flex-1 overflow-auto">
          {/* Tarjetas */}
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-2xl">📈</p>
            <p className="font-semibold">Ventas de Hoy</p>
          </div>

          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-2xl">🧾</p>
            <p className="font-semibold">Facturas Pendientes</p>
          </div>

          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-2xl">📦</p>
            <p className="font-semibold">Productos Registrados</p>
          </div>

          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-2xl">👥</p>
            <p className="font-semibold">Clientes Activos</p>
          </div>

          {/* Resumen Ventas Mensuales */}
          <div className="col-span-2 bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold mb-2 text-gray-700">
              Resumen Ventas Mensuales
            </h3>
            <div className="bg-gray-100 rounded-lg h-40 flex items-center justify-center text-gray-400">
              📊 Aquí irá el gráfico
            </div>
          </div>

          {/* Últimas Facturas */}
          <div className="col-span-2 bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold mb-2 text-gray-700">
              Últimas Facturas
            </h3>
            <table className="w-full text-sm text-left border">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-2 border">ID</th>
                  <th className="p-2 border">Cliente</th>
                  <th className="p-2 border">Estado</th>
                  <th className="p-2 border">Valor</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2 border">1001</td>
                  <td className="p-2 border">Santiago Muñoz</td>
                  <td className="p-2 border">Pagada</td>
                  <td className="p-2 border">80.000</td>
                </tr>
                <tr>
                  <td className="p-2 border">1002</td>
                  <td className="p-2 border">Manuela Gómez</td>
                  <td className="p-2 border">Pagada</td>
                  <td className="p-2 border">70.000</td>
                </tr>
                <tr>
                  <td className="p-2 border">1003</td>
                  <td className="p-2 border">Mateo González</td>
                  <td className="p-2 border">Pagada</td>
                  <td className="p-2 border">10.000</td>
                </tr>
                <tr>
                  <td className="p-2 border">1004</td>
                  <td className="p-2 border">Juan Castaño</td>
                  <td className="p-2 border">Pendiente</td>
                  <td className="p-2 border">100.000</td>
                </tr>
                <tr>
                  <td className="p-2 border">1005</td>
                  <td className="p-2 border">Jessica Parra</td>
                  <td className="p-2 border">Pendiente</td>
                  <td className="p-2 border">70.000</td>
                </tr>
                <tr>
                  <td className="p-2 border">1006</td>
                  <td className="p-2 border">Yesion Restrepo</td>
                  <td className="p-2 border">Pagada</td>
                  <td className="p-2 border">50.000</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-gray-500 text-sm py-2 border-t">
          © 2025 FactuCelest — v1.0.0
        </footer>
      </main>
    </div>
  );
}

export default MenuPrincipal;
