import React, { useEffect, useState } from "react";
import axios from "axios";

const Productos = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

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
      const res = await axios.get(
        "http://localhost:3000/api/productos/listarp"
      );
      setProductos(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Error al obtener productos:", error);
      setLoading(false);
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
      await axios.post(
        "http://localhost:3000/api/productos/insertarp",
        nuevoProducto
      );
      alert("✅ Producto agregado correctamente");
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
      alert("❌ No se pudo agregar el producto");
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
        `http://localhost:3000/api/productos/actualizarp/${productoEdit.IdProducto}`,
        productoEdit
      );
      alert("✅ Producto actualizado correctamente");
      setShowEditModal(false);
      fetchProductos();
    } catch (error) {
      console.error("Error al actualizar producto:", error);
      alert("❌ No se pudo actualizar el producto");
    }
  };

  // 🔹 Eliminar producto
  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este producto?")) return;
    try {
      await axios.delete(`http://localhost:3000/api/productos/eliminarp/${id}`);
      setProductos((prev) => prev.filter((p) => p.IdProducto !== id));
      alert("✅ Producto eliminado correctamente");
    } catch (error) {
      console.error("Error eliminando producto:", error);
      alert("❌ No se pudo eliminar el producto");
    }
  };

  if (loading)
    return <p className="p-6 text-gray-600">⏳ Cargando productos...</p>;

  return (
    <div className="p-6">
      {/* 🔹 Título + Botón agregar */}
      <div className="flex justify-between mb-4 items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          📦 Gestión de Productos
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
        >
          ➕ Nuevo Producto
        </button>
      </div>

      {/* 🔹 Tabla de productos */}
      <table className="min-w-full bg-white rounded-lg shadow-md overflow-hidden">
        <thead>
          <tr className="bg-gray-200 text-left">
            <th className="p-3">Referencia</th>
            <th className="p-3">Descripción</th>
            <th className="p-3">Talla</th>
            <th className="p-3">Precio Venta</th>
            <th className="p-3">Precio Compra</th>
            <th className="p-3">Categoría</th>
            <th className="p-3">Proveedor</th>
            <th className="p-3 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((p) => (
            <tr
              key={p.IdProducto}
              className="border-b hover:bg-gray-50 transition"
            >
              <td className="p-3">{p.Referencia}</td>
              <td className="p-3">{p.Descripcion}</td>
              <td className="p-3">{p.Talla}</td>
              <td className="p-3">${p.PrecioVenta.toLocaleString()}</td>
              <td className="p-3">${p.PrecioCompra.toLocaleString()}</td>
              <td className="p-3">{p.NombreCategoria}</td>
              <td className="p-3">{p.NombreProveedor}</td>
              <td className="p-3 flex justify-center gap-2">
                <button
                  onClick={() => handleEdit(p)}
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
                >
                  ✏️ Editar
                </button>
                <button
                  onClick={() => handleDelete(p.IdProducto)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                >
                  🗑 Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 🔹 Modal para agregar producto */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-96 p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800 text-center">
              ➕ Nuevo Producto
            </h2>
            <form onSubmit={handleGuardar} className="space-y-3">
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
                  className="w-full border rounded px-3 py-2"
                  required={campo !== "Talla"}
                />
              ))}
              <div className="flex justify-between mt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-96 p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800 text-center">
              ✏️ Editar Producto
            </h2>
            <form onSubmit={handleActualizar} className="space-y-3">
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
                  className="w-full border rounded px-3 py-2"
                  required={campo !== "Talla"}
                />
              ))}
              <div className="flex justify-between mt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
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
