import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  showSuccessAlert,
  showErrorAlert,
  showInfoAlert,
} from "../utils/sweetAlertHelper";
import ModalCliente from "../components/ModalCliente";

export default function Facturacion() {
  const [cedula, setCedula] = useState("");
  const [cliente, setCliente] = useState(null);
  const [productos, setProductos] = useState([]);
  const [detalle, setDetalle] = useState([]);
  const [mostrarModalCliente, setMostrarModalCliente] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [resultadosBusqueda, setResultadosBusqueda] = useState([]);
  const [metodoPago, setMetodoPago] = useState("Efectivo");

  const [totales, setTotales] = useState({
    subtotal: 0,
    iva: 0,
    total: 0,
  });

  // 🔹 Cargar productos al iniciar
  useEffect(() => {
    axios
      .get("http://localhost:3000/api/productos/listarp")
      .then((res) => setProductos(res.data))
      .catch((err) => console.error("Error cargando productos:", err));
  }, []);

  const handleBuscarProducto = (texto) => {
    setBusqueda(texto);
    if (texto.trim() === "") {
      setResultadosBusqueda([]);
      return;
    }

    const resultados = productos.filter((p) =>
      p.Descripcion.toLowerCase().includes(texto.toLowerCase())
    );
    setResultadosBusqueda(resultados);
  };

  // 🔹 Buscar cliente
  const handleBuscarCliente = async () => {
    if (!cedula.trim()) {
      showErrorAlert("Campo requerido", "Ingresa una cédula antes de buscar");
      return;
    }

    try {
      const res = await axios.get(
        `http://localhost:3000/api/clientes/buscar/${cedula}`
      );

      if (res.data.success) {
        setCliente(res.data.data);
        showSuccessAlert(
          "Cliente encontrado",
          `Bienvenido ${res.data.data.Nombre}`
        );
      } else {
        showErrorAlert(
          "No encontrado",
          res.data.message || "Cliente no encontrado"
        );
        setCliente(null);
      }
    } catch (error) {
      console.error("Error buscando cliente:", error);
      showErrorAlert("Error", "Cliente no encontrado o error de conexión");
      setCliente(null);
    }
  };

  // 🔹 Agregar producto al detalle
  const handleAgregarProducto = (id) => {
    const prod = productos.find((p) => p.IdProducto === parseInt(id));
    if (!prod) return;

    const existe = detalle.find((d) => d.IdProducto === prod.IdProducto);
    if (existe) {
      showInfoAlert("Producto duplicado", "Este producto ya está agregado");
      return;
    }

    setDetalle([
      ...detalle,
      {
        IdProducto: prod.IdProducto,
        Descripcion: prod.Descripcion,
        PrecioVenta: prod.PrecioVenta,
        Cantidad: 1,
        Total: prod.PrecioVenta,
      },
    ]);
  };

  // 🔹 Cambiar cantidad
  const handleCantidadChange = (id, cantidad) => {
    const actualizado = detalle.map((item) =>
      item.IdProducto === id
        ? {
            ...item,
            Cantidad: cantidad,
            Total: cantidad * item.PrecioVenta,
          }
        : item
    );
    setDetalle(actualizado);
  };

  // 🔹 Calcular totales
  useEffect(() => {
    const subtotal = detalle.reduce((acc, p) => acc + p.Total, 0);
    const iva = subtotal * 0.19;
    const total = subtotal + iva;
    setTotales({ subtotal, iva, total });
  }, [detalle]);

  // 🔹 Eliminar producto del detalle
  const handleEliminarProducto = (id) => {
    setDetalle(detalle.filter((item) => item.IdProducto !== id));
  };

  // 🔹 Guardar factura en el backend
  const guardarFactura = async () => {
    try {
      const facturaData = {
        DocumentoCliente: cliente.Documento,
        Subtotal: totales.subtotal,
        Iva: totales.iva,
        Total: totales.total,
        MetodoPago: metodoPago,
        Detalle: detalle, // Enviar productos
      };

      console.log("📤 Enviando factura:", facturaData);

      const res = await axios.post(
        "http://localhost:3000/api/facturas/crear",
        facturaData
      );

      console.log("📥 Respuesta del servidor:", res.data);

      if (res.data.success) {
        await showSuccessAlert(
          "¡Factura creada!",
          `Factura #${res.data.IdFactura} registrada correctamente`
        );
        return true;
      } else {
        showErrorAlert(
          "Error",
          res.data.error || "No se pudo guardar la factura"
        );
        return false;
      }
    } catch (error) {
      console.error("❌ Error guardando factura:", error);
      showErrorAlert(
        "Error",
        error.response?.data?.error || "No se pudo guardar la factura"
      );
      return false;
    }
  };

  // 🔹 Generar factura (verifica y llama guardarFactura)
  const handleGenerarFactura = async () => {
    if (!cliente) {
      showErrorAlert(
        "Cliente requerido",
        "Debes seleccionar o registrar un cliente"
      );
      return;
    }

    if (detalle.length === 0) {
      showErrorAlert("Sin productos", "Debes agregar al menos un producto");
      return;
    }

    const guardada = await guardarFactura();

    if (guardada) {
      // Reinicia el formulario
      setCedula("");
      setCliente(null);
      setDetalle([]);
      setMetodoPago("Efectivo");
      setTotales({ subtotal: 0, iva: 0, total: 0 });
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 shadow-lg rounded-3xl transition-colors duration-300">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          🧾 Módulo de Facturación
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Registra nuevas facturas y gestiona clientes
        </p>
      </div>

      {/* Buscar cliente */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <input
          type="text"
          placeholder="Cédula del cliente"
          value={cedula}
          onChange={(e) => setCedula(e.target.value)}
          className="flex-1 min-w-[200px] border-2 border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 focus:border-cyan-500 dark:focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200 dark:focus:ring-cyan-800 outline-none transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        />
        <button
          onClick={handleBuscarCliente}
          className="bg-gradient-to-r from-cyan-500 to-cyan-700 text-white px-6 py-3 rounded-xl hover:from-cyan-600 hover:to-cyan-800 transition-all shadow-lg font-semibold"
        >
          🔍 Buscar
        </button>
        {!cliente && (
          <button
            onClick={() => setMostrarModalCliente(true)}
            className="bg-gradient-to-r from-green-500 to-green-700 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-green-800 transition-all shadow-lg font-semibold"
          >
            ➕ Registrar cliente
          </button>
        )}
      </div>

      {/* Info cliente */}
      {cliente && (
        <div className="mb-6 p-5 bg-gradient-to-r from-cyan-50 to-cyan-100 dark:from-gray-700 dark:to-gray-600 rounded-2xl border-l-4 border-cyan-500 shadow-md">
          <div className="flex items-start gap-3">
            <div className="bg-cyan-500 text-white rounded-full p-3 text-2xl">
              👤
            </div>
            <div className="flex-1">
              <p className="text-gray-800 dark:text-gray-100 font-semibold text-lg mb-1">
                {cliente.Nombre}
              </p>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                📧 {cliente.Correo}
              </p>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                📱 {cliente.Telefono || "No registrado"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Agregar productos */}
      <div className="mb-6 relative">
        <input
          type="text"
          value={busqueda}
          onChange={(e) => handleBuscarProducto(e.target.value)}
          placeholder="🔍 Buscar producto por nombre..."
          className="border-2 border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 w-full focus:border-cyan-500 dark:focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200 dark:focus:ring-cyan-800 outline-none transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        />

        {resultadosBusqueda.length > 0 && (
          <ul className="absolute bg-white dark:bg-gray-800 border-2 border-cyan-500 dark:border-cyan-400 rounded-2xl mt-2 w-full max-h-60 overflow-y-auto shadow-2xl z-10">
            {resultadosBusqueda.map((p) => (
              <li
                key={p.IdProducto}
                className="px-4 py-3 hover:bg-cyan-50 dark:hover:bg-gray-700 cursor-pointer transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0 text-gray-800 dark:text-gray-200"
                onClick={() => {
                  handleAgregarProducto(p.IdProducto);
                  setBusqueda("");
                  setResultadosBusqueda([]);
                }}
              >
                <span className="font-semibold">{p.Descripcion}</span>
                <span className="float-right text-cyan-600 dark:text-cyan-400 font-bold">
                  💲{p.PrecioVenta.toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Tabla detalle */}
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-sm rounded-2xl overflow-hidden">
          <thead className="bg-gradient-to-r from-cyan-500 to-cyan-700 text-white">
            <tr>
              <th className="py-4 px-4 text-left font-semibold">Producto</th>
              <th className="py-4 px-4 text-center font-semibold">Precio</th>
              <th className="py-4 px-4 text-center font-semibold">Cantidad</th>
              <th className="py-4 px-4 text-center font-semibold">Total</th>
              <th className="py-4 px-4 text-center font-semibold">Acción</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-700">
            {detalle.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="py-8 text-center text-gray-400 dark:text-gray-500"
                >
                  <p className="text-4xl mb-2">📦</p>
                  <p>No hay productos agregados</p>
                </td>
              </tr>
            ) : (
              detalle.map((item) => (
                <tr
                  key={item.IdProducto}
                  className="border-b dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition"
                >
                  <td className="py-4 px-4 text-gray-800 dark:text-gray-200 font-medium">
                    {item.Descripcion}
                  </td>
                  <td className="py-4 px-4 text-center text-gray-800 dark:text-gray-200">
                    ${item.PrecioVenta.toLocaleString()}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <input
                      type="number"
                      min="1"
                      value={item.Cantidad}
                      onChange={(e) =>
                        handleCantidadChange(
                          item.IdProducto,
                          parseInt(e.target.value)
                        )
                      }
                      className="border-2 border-gray-300 dark:border-gray-600 rounded-lg w-20 text-center py-1 focus:border-cyan-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    />
                  </td>
                  <td className="py-4 px-4 text-center text-gray-800 dark:text-gray-200 font-semibold">
                    ${item.Total.toLocaleString()}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <button
                      onClick={() => handleEliminarProducto(item.IdProducto)}
                      className="text-red-500 hover:text-red-700 font-bold text-xl transition"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Totales */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-2xl p-6 mb-6">
        <div className="space-y-3">
          {/* Método de pago */}
          <div className="mb-4 pb-4 border-b border-gray-300 dark:border-gray-500">
            <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">
              💳 Método de pago:
            </label>
            <select
              value={metodoPago}
              onChange={(e) => setMetodoPago(e.target.value)}
              className="w-full border-2 border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2 focus:border-cyan-500 dark:focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200 dark:focus:ring-cyan-800 outline-none transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="Efectivo">Efectivo</option>
              <option value="Tarjeta">Tarjeta</option>
              <option value="Transferencia">Transferencia</option>
              <option value="Nequi">Nequi</option>
              <option value="Daviplata">Daviplata</option>
            </select>
          </div>

          {/* Subtotal, IVA, Total */}
          <div className="text-right">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-300">
                Subtotal:
              </span>
              <span className="text-gray-800 dark:text-gray-100 font-semibold text-lg">
                ${totales.subtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-300">
                IVA (19%):
              </span>
              <span className="text-gray-800 dark:text-gray-100 font-semibold text-lg">
                ${totales.iva.toFixed(2)}
              </span>
            </div>
            <div className="border-t-2 border-gray-300 dark:border-gray-500 pt-2 mt-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-800 dark:text-gray-100 font-bold text-xl">
                  Total:
                </span>
                <span className="text-cyan-600 dark:text-cyan-400 font-bold text-2xl">
                  ${totales.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleGenerarFactura}
        className="w-full bg-gradient-to-r from-cyan-500 to-cyan-700 text-white px-6 py-4 rounded-xl hover:from-cyan-600 hover:to-cyan-800 transition-all shadow-lg font-bold text-lg"
      >
        ✨ Generar Factura
      </button>

      {/* Modal registro cliente */}
      {mostrarModalCliente && (
        <ModalCliente
          onClose={() => setMostrarModalCliente(false)}
          onClienteCreado={setCliente}
        />
      )}
    </div>
  );
}
