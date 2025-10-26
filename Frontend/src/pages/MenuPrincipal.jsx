import { useState } from "react";
import "../App.css"; // importa tus estilos generales

function MenuPrincipal() {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Contenido principal */}
      <main className="flex-1 flex flex-col">
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
      </main>
    </div>
  );
}

export default MenuPrincipal;
