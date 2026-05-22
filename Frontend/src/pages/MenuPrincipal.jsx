import { useState, useEffect } from "react";
import axios from "axios";
import "../App.css";
import { buildApiUrl } from "../config/api";

function MenuPrincipal() {
  const [facturas, setFacturas] = useState([]);
  const [ventasMensuales, setVentasMensuales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingVentas, setLoadingVentas] = useState(true);

  // Cargar últimas facturas y ventas mensuales al montar el componente
  useEffect(() => {
    fetchUltimasFacturas();
    fetchVentasMensuales();
  }, []);

  const fetchUltimasFacturas = async () => {
    try {
      const res = await axios.get(buildApiUrl("/api/facturas/ultimas?cantidad=6"));
      if (res.data.success) {
        setFacturas(res.data.facturas);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error al cargar facturas:", error);
      setLoading(false);
    }
  };

  const fetchVentasMensuales = async () => {
    try {
      const res = await axios.get(buildApiUrl("/api/facturas/ventas-mensuales"));
      if (res.data.success) {
        setVentasMensuales(res.data.ventas);
      }
      setLoadingVentas(false);
    } catch (error) {
      console.error("Error al cargar ventas mensuales:", error);
      setLoadingVentas(false);
    }
  };

  const formatearFecha = (fecha) => {
    const date = new Date(fecha);
    return date.toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Obtener el mes y año actual
  const obtenerMesActual = () => {
    const meses = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ];
    const fecha = new Date();
    return `${meses[fecha.getMonth()]} ${fecha.getFullYear()}`;
  };

  // Calcular el valor máximo para escalar las barras
  const maxVenta =
    ventasMensuales.length > 0
      ? Math.max(...ventasMensuales.map((v) => v.TotalVentas))
      : 0;

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header del Dashboard */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          📊 Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Resumen general del sistema de facturación
        </p>
      </div>

      {/* Tarjetas de Estadísticas - móvil */}
      <div className="grid grid-cols-2 gap-3 md:hidden">
        <div className="rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-700 p-4 text-white shadow-lg">
          <p className="text-xs text-cyan-100 mb-2">Hoy</p>
          <p className="text-xl font-bold">$0</p>
          <p className="text-xs text-cyan-100 mt-1">Ventas</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-orange-500 to-orange-700 p-4 text-white shadow-lg">
          <p className="text-xs text-orange-100 mb-2">Pendiente</p>
          <p className="text-xl font-bold">2</p>
          <p className="text-xs text-orange-100 mt-1">Facturas</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 p-4 text-white shadow-lg">
          <p className="text-xs text-purple-100 mb-2">Total</p>
          <p className="text-xl font-bold">0</p>
          <p className="text-xs text-purple-100 mt-1">Productos</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-green-500 to-green-700 p-4 text-white shadow-lg">
          <p className="text-xs text-green-100 mb-2">Activos</p>
          <p className="text-xl font-bold">0</p>
          <p className="text-xs text-green-100 mt-1">Clientes</p>
        </div>
      </div>

      {/* Tarjetas de Estadísticas - escritorio */}
      <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
        {/* Card 1 - Ventas de Hoy */}
        <div className="bg-gradient-to-br from-cyan-500 to-cyan-700 rounded-2xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white bg-opacity-20 rounded-full p-3">
              <p className="text-3xl">📈</p>
            </div>
            <span className="text-sm bg-black bg-opacity-20 px-3 py-1 rounded-full">
              Hoy
            </span>
          </div>
          <p className="text-3xl font-bold mb-1">$0</p>
          <p className="text-cyan-100 text-sm">Ventas de Hoy</p>
        </div>

        {/* Card 2 - Facturas Pendientes */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-700 rounded-2xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white bg-opacity-20 rounded-full p-3">
              <p className="text-3xl">🧾</p>
            </div>
            <span className="text-sm bg-black bg-opacity-20 px-3 py-1 rounded-full">
              Pendiente
            </span>
          </div>
          <p className="text-3xl font-bold mb-1">2</p>
          <p className="text-orange-100 text-sm">Facturas Pendientes</p>
        </div>

        {/* Card 3 - Productos Registrados */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white bg-opacity-20 rounded-full p-3">
              <p className="text-3xl">📦</p>
            </div>
            <span className="text-sm bg-black bg-opacity-20 px-3 py-1 rounded-full">
              Total
            </span>
          </div>
          <p className="text-3xl font-bold mb-1">0</p>
          <p className="text-purple-100 text-sm">Productos Registrados</p>
        </div>

        {/* Card 4 - Clientes Activos */}
        <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-2xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white bg-opacity-20 rounded-full p-3">
              <p className="text-3xl">👥</p>
            </div>
            <span className="text-sm bg-black bg-opacity-20 px-3 py-1 rounded-full">
              Activos
            </span>
          </div>
          <p className="text-3xl font-bold mb-1">0</p>
          <p className="text-green-100 text-sm">Clientes</p>
        </div>
      </div>

      {/* Resumen compacto móvil */}
      <div className="grid gap-4 md:hidden">
        <div className="app-mobile-card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-800 dark:text-gray-100">
              Ventas Mensuales
            </h3>
            <span className="text-xs text-cyan-600 dark:text-cyan-400 font-semibold">
              {obtenerMesActual()}
            </span>
          </div>
          {loadingVentas ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              ⏳ Cargando resumen...
            </p>
          ) : ventasMensuales.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No hay ventas este mes.
            </p>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  ${ventasMensuales.reduce((acc, venta) => acc + venta.TotalVentas, 0).toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {ventasMensuales.length} días con ventas
                </p>
              </div>
              <div className="text-4xl">📊</div>
            </div>
          )}
        </div>

        <div className="app-mobile-card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-800 dark:text-gray-100">
              Últimas Facturas
            </h3>
            <span className="text-xs text-cyan-600 dark:text-cyan-400 font-semibold">
              {facturas.length} recientes
            </span>
          </div>

          {loading ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              ⏳ Cargando facturas...
            </p>
          ) : facturas.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No hay facturas registradas.
            </p>
          ) : (
            <div className="space-y-3">
              {facturas.slice(0, 3).map((factura) => (
                <div
                  key={factura.IdFactura}
                  className="rounded-xl border border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-700/50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-gray-100">
                        #{factura.IdFactura}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {factura.NombreCliente}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatearFecha(factura.Fecha)}
                      </p>
                    </div>
                    <p className="font-bold text-cyan-600 dark:text-cyan-400 whitespace-nowrap">
                      ${factura.Total.toLocaleString("es-CO")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Gráfico y Tabla - escritorio */}
      <div className="hidden md:grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Resumen Ventas Mensuales */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 md:p-6 transition-colors duration-300 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
              Ventas Mensuales
            </h3>
            <span className="text-cyan-600 dark:text-cyan-400 text-sm font-semibold">
              {obtenerMesActual()}
            </span>
          </div>

          {loadingVentas ? (
            <div className="h-64 flex items-center justify-center">
              <p className="text-gray-500 dark:text-gray-400">
                ⏳ Cargando gráfico...
              </p>
            </div>
          ) : ventasMensuales.length === 0 ? (
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-900 rounded-xl h-64 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
              <div className="text-center">
                <p className="text-6xl mb-2">📊</p>
                <p className="text-gray-500 dark:text-gray-400 font-medium">
                  No hay ventas este mes
                </p>
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-end justify-around gap-2 px-2 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-900 rounded-xl p-4 overflow-x-auto">
              {ventasMensuales.map((venta) => {
                const altura =
                  maxVenta > 0 ? (venta.TotalVentas / maxVenta) * 100 : 0;
                const alturaMinima = Math.max(altura, 5); // Altura mínima del 5% para que se vea
                return (
                  <div
                    key={venta.Dia}
                    className="flex-1 flex flex-col items-center gap-2"
                  >
                    <div className="relative group cursor-pointer w-full h-full flex items-end">
                      <div
                        className="bg-gradient-to-t from-cyan-500 to-cyan-400 hover:from-cyan-600 hover:to-cyan-500 rounded-t-lg transition-all duration-300 w-full"
                        style={{ height: `${alturaMinima}%`, minHeight: "8px" }}
                      >
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-2 px-3 whitespace-nowrap shadow-lg z-10">
                          <p className="font-semibold">
                            ${venta.TotalVentas.toLocaleString()}
                          </p>
                          <p className="text-gray-300">
                            {venta.CantidadFacturas} facturas
                          </p>
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                      {venta.Dia}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Últimas Facturas */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 md:p-6 transition-colors duration-300 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
              Últimas Facturas
            </h3>
            <button className="text-cyan-600 dark:text-cyan-400 text-sm font-semibold hover:underline">
              Ver todas →
            </button>
          </div>
          <div className="overflow-x-auto -mx-4 md:mx-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-2 text-gray-600 dark:text-gray-300 font-semibold">
                    ID
                  </th>
                  <th className="text-left py-3 px-2 text-gray-600 dark:text-gray-300 font-semibold">
                    Cliente
                  </th>
                  <th className="text-left py-3 px-2 text-gray-600 dark:text-gray-300 font-semibold">
                    Fecha
                  </th>
                  <th className="text-right py-3 px-2 text-gray-600 dark:text-gray-300 font-semibold">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="text-gray-700 dark:text-gray-300">
                {loading ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="py-8 text-center text-gray-500 dark:text-gray-400"
                    >
                      ⏳ Cargando facturas...
                    </td>
                  </tr>
                ) : facturas.length === 0 ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="py-8 text-center text-gray-500 dark:text-gray-400"
                    >
                      <p className="text-4xl mb-2">📄</p>
                      <p>No hay facturas registradas</p>
                    </td>
                  </tr>
                ) : (
                  facturas.map((factura) => (
                    <tr
                      key={factura.IdFactura}
                      className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    >
                      <td className="py-3 px-2 font-medium">
                        #{factura.IdFactura}
                      </td>
                      <td className="py-3 px-2">{factura.NombreCliente}</td>
                      <td className="py-3 px-2 text-sm text-gray-500 dark:text-gray-400">
                        {formatearFecha(factura.Fecha)}
                      </td>
                      <td className="py-3 px-2 text-right font-semibold text-cyan-600 dark:text-cyan-400">
                        ${factura.Total.toLocaleString("es-CO")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MenuPrincipal;
