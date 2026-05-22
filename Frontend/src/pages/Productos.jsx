import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  showSuccessAlert,
  showErrorAlert,
  showConfirmAlert,
} from "../utils/sweetAlertHelper";
import { buildApiUrl } from "../config/api";

const Productos = () => {
  const [productos, setProductos] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  // Modal de agregar
  const [showModal, setShowModal] = useState(false);
  const [nuevoProducto, setNuevoProducto] = useState({
    Referencia: "",
    Descripcion: "",
    Talla: "",
    PrecioVenta: "",
    PrecioCompra: "",
    IdCategoriaFK: "",
    TaxIdFK: "",
  });

  // Modal de edición
  const [productoEdit, setProductoEdit] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // 🔹 Cargar productos
  useEffect(() => {
    fetchProductos();
  }, []);

  const fetchProductos = async () => {
    try {
      const res = await axios.get(buildApiUrl("/api/productos/listarp"));
      setProductos(res.data);
      setProductosFiltrados(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Error al obtener productos:", error);
      showErrorAlert("Error", "No se pudieron cargar los productos");
      setLoading(false);
    }
  };

  // 🔹 Filtrar productos por Referencia o Descripción usando stored procedure
  const handleBusqueda = async (texto) => {
    setBusqueda(texto);

    try {
      const res = await axios.get(
        buildApiUrl(`/api/productos/buscar?busqueda=${encodeURIComponent(texto)}`)
      );
      setProductosFiltrados(res.data);
    } catch (error) {
      console.error("Error al buscar productos:", error);
      showErrorAlert("Error", "No se pudieron buscar los productos");
    }
  };

  // 🔹 Controlar los cambios del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNuevoProducto({ ...nuevoProducto, [name]: value });
  };

  // 🔹 Insertar producto sin recargar la página
  const handleGuardar = async (e) => {
    e.preventDefault();
    try {
      await axios.post(buildApiUrl("/api/productos/insertarp"), nuevoProducto);
      await showSuccessAlert("¡Éxito!", "Producto agregado correctamente");
      setShowModal(false);
      setNuevoProducto({
        Referencia: "",
        Descripcion: "",
        Talla: "",
        PrecioVenta: "",
        PrecioCompra: "",
        IdCategoriaFK: "",
        TaxIdFK: "",
      });
      fetchProductos();
    } catch (error) {
      console.error("Error al insertar producto:", error);
      showErrorAlert("Error", "No se pudo agregar el producto");
    }
  };

  // 🔹 Abrir modal de edición
  const handleEdit = (producto) => {
    setProductoEdit({ ...producto });
    setShowEditModal(true);
  };

  // 🔹 Controlar los cambios en el modal de edición
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setProductoEdit({ ...productoEdit, [name]: value });
  };

  // 🔹 Guardar cambios (Actualizar producto)
  const handleActualizar = async (e) => {
    e.preventDefault();
    try {
      console.log("ID del producto:", productoEdit.IdProducto);
      await axios.put(
        buildApiUrl(`/api/productos/actualizarp/${productoEdit.IdProducto}`),
        productoEdit
      );
      await showSuccessAlert(
        "¡Actualizado!",
        "Producto actualizado correctamente"
      );
      setShowEditModal(false);
      fetchProductos();
    } catch (error) {
      console.error("Error al actualizar producto:", error);
      showErrorAlert("Error", "No se pudo actualizar el producto");
    }
  };

  // 🔹 Eliminar producto
  const handleDelete = async (id) => {
    const result = await showConfirmAlert(
      "¿Eliminar producto?",
      "Esta acción no se puede deshacer"
    );

    if (!result.isConfirmed) return;

    try {
      await axios.delete(buildApiUrl(`/api/productos/eliminarp/${id}`));
      setProductos((prev) => prev.filter((p) => p.IdProducto !== id));
      showSuccessAlert("¡Eliminado!", "Producto eliminado correctamente");
    } catch (error) {
      console.error("Error eliminando producto:", error);
      showErrorAlert("Error", "No se pudo eliminar el producto");
    }
  };

  if (loading)
    return (
      <p className="p-6 text-gray-600 dark:text-gray-300">
        ⏳ Cargando productos...
      </p>
    );

  return (
    <div className="app-page">
      {/* 🔹 Título + Botón agregar */}
      <div className="flex flex-col sm:flex-row sm:justify-between mb-4 items-stretch sm:items-center gap-3">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">
          📦 Gestión de Productos
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="app-btn-primary w-full sm:w-auto px-4 py-2"
        >
          ➕ Nuevo Producto
        </button>
      </div>

      {/* 🔹 Buscador */}
      <div className="mb-6">
        <input
          type="text"
          value={busqueda}
          onChange={(e) => handleBusqueda(e.target.value)}
          placeholder="🔍 Buscar por Referencia o Descripción..."
          className="app-input"
        />
        {busqueda && (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            📊 Mostrando {productosFiltrados.length} de {productos.length}{" "}
            productos
          </p>
        )}
      </div>

      {/* 🔹 Tabla de productos */}
      <div className="app-desktop-table overflow-x-auto -mx-4 md:mx-0">
        <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <thead>
            <tr className="bg-gray-200 dark:bg-gray-700 text-left">
              <th className="p-3 text-gray-700 dark:text-gray-200">
                Referencia
              </th>
              <th className="p-3 text-gray-700 dark:text-gray-200">
                Descripción
              </th>
              <th className="p-3 text-gray-700 dark:text-gray-200">Talla</th>
              <th className="p-3 text-gray-700 dark:text-gray-200">
                Precio Venta
              </th>
              <th className="p-3 text-gray-700 dark:text-gray-200">
                Precio Compra
              </th>
              <th className="p-3 text-gray-700 dark:text-gray-200">
                Categoría
              </th>
              <th className="p-3 text-gray-700 dark:text-gray-200">
                Proveedor
              </th>
              <th className="p-3 text-center text-gray-700 dark:text-gray-200">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {productosFiltrados.length === 0 ? (
              <tr>
                <td
                  colSpan="8"
                  className="p-8 text-center text-gray-500 dark:text-gray-400"
                >
                  <p className="text-4xl mb-2">🔍</p>
                  <p>No se encontraron productos</p>
                </td>
              </tr>
            ) : (
              productosFiltrados.map((p) => (
                <tr
                  key={p.IdProducto}
                  className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  <td className="p-3 text-gray-800 dark:text-gray-200">
                    {p.Referencia}
                  </td>
                  <td className="p-3 text-gray-800 dark:text-gray-200">
                    {p.Descripcion}
                  </td>
                  <td className="p-3 text-gray-800 dark:text-gray-200">
                    {p.Talla}
                  </td>
                  <td className="p-3 text-gray-800 dark:text-gray-200">
                    ${p.PrecioVenta.toLocaleString()}
                  </td>
                  <td className="p-3 text-gray-800 dark:text-gray-200">
                    ${p.PrecioCompra.toLocaleString()}
                  </td>
                  <td className="p-3 text-gray-800 dark:text-gray-200">
                    {p.NombreCategoria}
                  </td>
                  <td className="p-3 text-gray-800 dark:text-gray-200">
                    {p.NombreProveedor}
                  </td>
                  <td className="p-3 flex justify-center gap-2">
                    <button
                      onClick={() => handleEdit(p)}
                      className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => handleDelete(p.IdProducto)}
                      className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition"
                    >
                      🗑 Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="app-mobile-list">
        {productosFiltrados.length === 0 ? (
          <div className="app-mobile-card text-center text-gray-500 dark:text-gray-400 py-8">
            <p className="text-4xl mb-2">🔍</p>
            <p>No se encontraron productos</p>
          </div>
        ) : (
          productosFiltrados.map((p) => (
            <div key={p.IdProducto} className="app-mobile-card space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-100">
                    {p.Referencia}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">
                    {p.Descripcion}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Talla: {p.Talla}
                  </p>
                </div>
                <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                  <p>{p.NombreCategoria}</p>
                  <p>{p.NombreProveedor}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Precio venta</p>
                  <p className="font-semibold text-gray-800 dark:text-gray-100">
                    ${p.PrecioVenta.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Precio compra</p>
                  <p className="font-semibold text-gray-800 dark:text-gray-100">
                    ${p.PrecioCompra.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => handleEdit(p)}
                  className="app-btn-primary w-full sm:flex-1 px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800"
                >
                  ✏️ Editar
                </button>
                <button
                  onClick={() => handleDelete(p.IdProducto)}
                  className="w-full sm:flex-1 bg-red-500 text-white px-3 py-2 rounded-xl hover:bg-red-600 transition shadow-lg font-semibold"
                >
                  🗑 Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 🔹 Modal para agregar producto */}
      {showModal && (
        <div
          className="fixed inset-0 flex justify-center items-center z-50 animate-fadeIn px-4"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div className="app-modal-shell bg-white dark:bg-gray-800 transform animate-slideIn">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100 text-center">
              ➕ Nuevo Producto
            </h2>
            <form onSubmit={handleGuardar} className="space-y-4">
              {[
                "Referencia",
                "Descripcion",
                "Talla",
                "PrecioVenta",
                "PrecioCompra",
                "IdCategoriaFK",
                "TaxIdFK",
              ].map((campo) => (
                <input
                  key={campo}
                  type={
                    campo.includes("Precio") || campo.includes("Id")
                      ? "number"
                      : "text"
                  }
                  name={campo}
                  placeholder={campo}
                  value={nuevoProducto[campo]}
                  onChange={handleChange}
                  className="app-input"
                  required={campo !== "Talla"}
                />
              ))}
              <div className="flex flex-col sm:flex-row justify-between mt-6 gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-400 dark:bg-gray-600 text-white px-4 py-3 rounded-xl hover:bg-gray-500 dark:hover:bg-gray-700 transition font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-cyan-700 text-white px-4 py-3 rounded-xl hover:from-cyan-600 hover:to-cyan-800 transition shadow-lg font-semibold"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🔹 Modal para editar producto */}
      {showEditModal && productoEdit && (
        <div
          className="fixed inset-0 flex justify-center items-center z-50 animate-fadeIn px-4"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div className="app-modal-shell bg-white dark:bg-gray-800 transform animate-slideIn">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100 text-center">
              ✏️ Editar Producto
            </h2>
            <form onSubmit={handleActualizar} className="space-y-4">
              {[
                "Referencia",
                "Descripcion",
                "Talla",
                "PrecioVenta",
                "PrecioCompra",
                "IdCategoriaFK",
                "TaxIdFK",
              ].map((campo) => (
                <input
                  key={campo}
                  type={
                    campo.includes("Precio") || campo.includes("Id")
                      ? "number"
                      : "text"
                  }
                  name={campo}
                  placeholder={campo}
                  value={productoEdit[campo]}
                  onChange={handleEditChange}
                  className="app-input"
                  required={campo !== "Talla"}
                />
              ))}
              <div className="flex flex-col sm:flex-row justify-between mt-6 gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-gray-400 dark:bg-gray-600 text-white px-4 py-3 rounded-xl hover:bg-gray-500 dark:hover:bg-gray-700 transition font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-700 text-white px-4 py-3 rounded-xl hover:from-blue-600 hover:to-blue-800 transition shadow-lg font-semibold"
                >
                  Actualizar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Productos;
