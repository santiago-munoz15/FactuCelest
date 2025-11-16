import { useState, useEffect } from "react";
import axios from "axios";
import "../App.css";

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
      const res = await axios.get(
        "http://localhost:3000/api/facturas/ultimas?cantidad=6"
      );
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
      const res = await axios.get(
        "http://localhost:3000/api/facturas/ventas-mensuales"
      );
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
    <div className="p-6 space-y-6">
      {/* Header del Dashboard */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          📊 Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Resumen general del sistema de facturación
        </p>
      </div>

      {/* Tarjetas de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      {/* Gráfico y Tabla */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resumen Ventas Mensuales */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 transition-colors duration-300">
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
            <div className="h-64 flex items-end justify-around gap-2 px-2 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-900 rounded-xl p-4">
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
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 transition-colors duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
              Últimas Facturas
            </h3>
            <button className="text-cyan-600 dark:text-cyan-400 text-sm font-semibold hover:underline">
              Ver todas →
            </button>
          </div>
          <div className="overflow-x-auto">
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
