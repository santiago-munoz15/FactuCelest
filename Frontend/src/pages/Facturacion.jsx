import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  showSuccessAlert,
  showErrorAlert,
  showInfoAlert,
} from "../utils/sweetAlertHelper";
import ModalCliente from "../components/ModalCliente";
import { buildApiUrl } from "../config/api";

export default function Facturacion() {
  const [cedula, setCedula] = useState("");
  const [cliente, setCliente] = useState(null);
  const [vendedorNombre, setVendedorNombre] = useState("");
  const [vendedorTelefono, setVendedorTelefono] = useState("");
  const [vendedorId, setVendedorId] = useState(null);
  const [vendedores, setVendedores] = useState([]);
  const [mostrarModalVendedor, setMostrarModalVendedor] = useState(false);
  const [nuevoVendedor, setNuevoVendedor] = useState({
    Nombre: "",
    Telefono: "",
  });
  const [productos, setProductos] = useState([]);
  const [detalle, setDetalle] = useState([]);
  const [mostrarModalCliente, setMostrarModalCliente] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [resultadosBusqueda, setResultadosBusqueda] = useState([]);
  const [resultadosVendedor, setResultadosVendedor] = useState([]);
  const [metodoPago, setMetodoPago] = useState("Efectivo");

  const [totales, setTotales] = useState({
    subtotal: 0,
    iva: 0,
    total: 0,
  });

  // 🔹 Cargar productos al iniciar
  useEffect(() => {
    axios
      .get(buildApiUrl("/api/productos/listarp"))
      .then((res) => setProductos(res.data))
      .catch((err) => console.error("Error cargando productos:", err));
  }, []);

  // 🔹 Cargar vendedores desde la base de datos
  useEffect(() => {
    axios
      .get(buildApiUrl("/api/vendedores"))
      .then((res) => {
        if (res.data.success) {
          setVendedores(res.data.vendedores || []);
        }
      })
      .catch((error) => {
        console.error("Error cargando vendedores:", error);
      });
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

  const handleBuscarVendedor = (texto) => {
    setVendedorNombre(texto);
    setVendedorId(null);

    if (texto.trim() === "") {
      setResultadosVendedor([]);
      setVendedorTelefono("");
      return;
    }

    const coincidencias = vendedores.filter((vendedor) =>
      vendedor.Nombre.toLowerCase().includes(texto.toLowerCase())
    );

    setResultadosVendedor(coincidencias);

    if (coincidencias.length === 1 && coincidencias[0].Nombre.toLowerCase() === texto.toLowerCase()) {
      setVendedorTelefono(coincidencias[0].Telefono || "");
    }
  };

  const seleccionarVendedor = (vendedor) => {
    setVendedorNombre(vendedor.Nombre);
    setVendedorTelefono(vendedor.Telefono || "");
    setVendedorId(vendedor.IdVendedor || null);
    setResultadosVendedor([]);
  };

  const guardarVendedor = async () => {
    const nombre = nuevoVendedor.Nombre.trim();
    const telefono = nuevoVendedor.Telefono.trim();

    if (!nombre || !telefono) {
      showErrorAlert(
        "Campos incompletos",
        "Debes ingresar el nombre y el teléfono del vendedor"
      );
      return;
    }

    const existe = vendedores.some(
      (vendedor) => vendedor.Nombre.toLowerCase() === nombre.toLowerCase()
    );

    if (existe) {
      showInfoAlert(
        "Vendedor duplicado",
        "Ya existe un vendedor con ese nombre. Puedes buscarlo en el listado."
      );
      return;
    }

    try {
      const res = await axios.post(buildApiUrl("/api/vendedores"), {
        Nombre: nombre,
        Telefono: telefono,
      });

      if (res.data.success) {
        const vendedorCreado = res.data.vendedor;
        setVendedores((actual) => {
          const existe = actual.some(
            (item) =>
              String(item.IdVendedor ?? "") === String(vendedorCreado.IdVendedor ?? "") ||
              item.Nombre.toLowerCase() === vendedorCreado.Nombre.toLowerCase()
          );

          const siguienteLista = existe ? actual : [...actual, vendedorCreado];

          return siguienteLista.sort((a, b) => a.Nombre.localeCompare(b.Nombre));
        });
        setVendedorNombre(vendedorCreado.Nombre);
        setVendedorTelefono(vendedorCreado.Telefono || "");
        setVendedorId(vendedorCreado.IdVendedor || null);
        setResultadosVendedor([]);
        setMostrarModalVendedor(false);
        setNuevoVendedor({ Nombre: "", Telefono: "" });
        await showSuccessAlert(
          "Vendedor agregado",
          `${vendedorCreado.Nombre} quedó disponible para facturar`
        );
      } else {
        showErrorAlert("Error", res.data.error || "No se pudo registrar el vendedor");
      }
    } catch (error) {
      console.error("Error registrando vendedor:", error);
      showErrorAlert("Error", "No se pudo registrar el vendedor");
    }
  };

  // 🔹 Buscar cliente
  const handleBuscarCliente = async () => {
    if (!cedula.trim()) {
      showErrorAlert("Campo requerido", "Ingresa una cédula antes de buscar");
      return;
    }

    try {
      const res = await axios.get(buildApiUrl(`/api/clientes/buscar/${cedula}`));

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
        NombreVendedor: vendedorNombre,
        TelefonoVendedor: vendedorTelefono,
        IdVendedor: vendedorId,
        Detalle: detalle, // Enviar productos
      };

      console.log("📤 Enviando factura:", facturaData);

      const res = await axios.post(buildApiUrl("/api/facturas/crear"), facturaData);

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

    if (!vendedorNombre.trim()) {
      showErrorAlert(
        "Vendedor requerido",
        "Debes seleccionar o registrar un vendedor"
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
      setVendedorNombre("");
      setVendedorTelefono("");
      setVendedorId(null);
      setDetalle([]);
      setMetodoPago("Efectivo");
      setTotales({ subtotal: 0, iva: 0, total: 0 });
    }
  };

  return (
    <div className="app-page app-surface app-surface-inner space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          🧾 Facturación
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Registra nuevas facturas y gestiona clientes
        </p>
      </div>

      {/* Buscar vendedor */}
      <div className="rounded-2xl bg-white dark:bg-gray-800 p-4 md:p-5 shadow-sm border border-gray-100 dark:border-gray-700 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Nombre de vendedor"
              value={vendedorNombre}
              onChange={(e) => handleBuscarVendedor(e.target.value)}
              className="app-input w-full"
            />

            {resultadosVendedor.length > 0 && (
              <ul className="absolute bg-white dark:bg-gray-800 border-2 border-cyan-500 dark:border-cyan-400 rounded-2xl mt-2 w-full max-h-52 overflow-y-auto shadow-2xl z-20">
                {resultadosVendedor.map((vendedor, index) => (
                  <li
                    key={`${vendedor.Nombre}-${index}`}
                    className="px-4 py-3 hover:bg-cyan-50 dark:hover:bg-gray-700 cursor-pointer transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0 text-gray-800 dark:text-gray-200"
                    onClick={() => seleccionarVendedor(vendedor)}
                  >
                    <span className="font-semibold">{vendedor.Nombre}</span>
                    <span className="float-right text-cyan-600 dark:text-cyan-400 font-bold">
                      {vendedor.Telefono}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            onClick={() => setMostrarModalVendedor(true)}
            className="app-btn-secondary w-full md:w-auto px-6 py-3"
          >
            ➕ Agregar vendedor
          </button>
        </div>

        {vendedorNombre && !vendedores.some((item) => item.Nombre.toLowerCase() === vendedorNombre.toLowerCase()) && (
          <p className="text-sm text-amber-600 dark:text-amber-400">
            El vendedor no existe en el catálogo. Puedes registrarlo con el botón de agregar.
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-3">
            <p className="text-gray-500 dark:text-gray-400">Vendedor seleccionado</p>
            <p className="font-semibold text-gray-800 dark:text-gray-100">
              {vendedorNombre || "Sin seleccionar"}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-3">
            <p className="text-gray-500 dark:text-gray-400">Teléfono</p>
            <p className="font-semibold text-gray-800 dark:text-gray-100">
              {vendedorTelefono || "No registrado"}
            </p>
          </div>
        </div>
      </div>

      {/* Buscar cliente */}
      <div className="flex flex-col md:flex-row md:flex-wrap items-stretch md:items-center gap-3 mb-6">
        <input
          type="text"
          placeholder="Cédula del cliente"
          value={cedula}
          onChange={(e) => setCedula(e.target.value)}
          className="app-input flex-1 min-w-0 md:min-w-[200px]"
        />
        <button
          onClick={handleBuscarCliente}
          className="app-btn-primary w-full md:w-auto px-6 py-3"
        >
          🔍 Buscar
        </button>
        {!cliente && (
          <button
            onClick={() => setMostrarModalCliente(true)}
            className="app-btn-secondary w-full md:w-auto px-6 py-3"
          >
            ➕ Registrar cliente
          </button>
        )}
      </div>

      {/* Info cliente */}
      {cliente && (
        <div className="mb-6 p-5 bg-gradient-to-r from-cyan-50 to-cyan-100 dark:from-gray-700 dark:to-gray-600 rounded-2xl border-l-4 border-cyan-500 shadow-md">
          <div className="flex flex-col sm:flex-row items-start gap-3">
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
          className="app-input"
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
      <div className="app-desktop-table overflow-x-auto mb-6">
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

      <div className="app-mobile-list mb-6">
        {detalle.length === 0 ? (
          <div className="app-mobile-card text-center text-gray-500 dark:text-gray-400 py-8">
            <p className="text-4xl mb-2">📦</p>
            <p>No hay productos agregados</p>
          </div>
        ) : (
          detalle.map((item) => (
            <div
              key={item.IdProducto}
              className="app-mobile-card space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-100">
                    {item.Descripcion}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Precio: ${item.PrecioVenta.toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => handleEliminarProducto(item.IdProducto)}
                  className="text-red-500 hover:text-red-700 font-bold text-xl transition"
                >
                  🗑️
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 mb-1">
                    Cantidad
                  </p>
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
                    className="app-input py-2 text-center"
                  />
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400 mb-1">
                    Total
                  </p>
                  <p className="font-semibold text-gray-800 dark:text-gray-100 py-2">
                    ${item.Total.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Totales */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-2xl p-4 md:p-6 mb-6">
        <div className="space-y-3">
          {/* Método de pago */}
          <div className="mb-4 pb-4 border-b border-gray-300 dark:border-gray-500">
            <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">
              💳 Método de pago:
            </label>
            <select
              value={metodoPago}
              onChange={(e) => setMetodoPago(e.target.value)}
              className="app-input py-2"
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
            <div className="flex justify-between items-center gap-4">
              <span className="text-gray-600 dark:text-gray-300">
                Subtotal:
              </span>
              <span className="text-gray-800 dark:text-gray-100 font-semibold text-lg">
                ${totales.subtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center gap-4">
              <span className="text-gray-600 dark:text-gray-300">
                IVA (19%):
              </span>
              <span className="text-gray-800 dark:text-gray-100 font-semibold text-lg">
                ${totales.iva.toFixed(2)}
              </span>
            </div>
            <div className="border-t-2 border-gray-300 dark:border-gray-500 pt-2 mt-2">
              <div className="flex justify-between items-center gap-4">
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
        className="app-btn-primary w-full px-6 py-4 font-bold text-base md:text-lg"
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

      {/* Modal vendedor */}
      {mostrarModalVendedor && (
        <div
          className="fixed inset-0 flex justify-center items-center z-50 animate-fadeIn px-4"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div className="bg-white dark:bg-gray-800 p-5 md:p-8 rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl transform animate-slideIn">
            <h3 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-gray-100">
              👔 Registrar Vendedor
            </h3>

            <div className="space-y-4">
              <input
                name="Nombre"
                placeholder="Nombre del vendedor"
                value={nuevoVendedor.Nombre}
                onChange={(e) =>
                  setNuevoVendedor((actual) => ({
                    ...actual,
                    Nombre: e.target.value,
                  }))
                }
                className="border-2 border-gray-200 dark:border-gray-600 p-3 w-full rounded-xl focus:border-cyan-500 dark:focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200 dark:focus:ring-cyan-800 outline-none transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />

              <input
                name="Telefono"
                placeholder="Teléfono"
                value={nuevoVendedor.Telefono}
                onChange={(e) =>
                  setNuevoVendedor((actual) => ({
                    ...actual,
                    Telefono: e.target.value,
                  }))
                }
                className="border-2 border-gray-200 dark:border-gray-600 p-3 w-full rounded-xl focus:border-cyan-500 dark:focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200 dark:focus:ring-cyan-800 outline-none transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            <button
              onClick={guardarVendedor}
              className="mt-6 bg-gradient-to-r from-cyan-500 to-cyan-700 text-white p-3 w-full rounded-xl font-semibold hover:from-cyan-600 hover:to-cyan-800 transition-all shadow-lg"
            >
              Guardar Vendedor
            </button>

            <button
              onClick={() => {
                setMostrarModalVendedor(false);
                setNuevoVendedor({ Nombre: "", Telefono: "" });
              }}
              className="mt-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-sm font-medium w-full text-center transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
