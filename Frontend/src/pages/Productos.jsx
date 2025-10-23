import React, { useEffect, useState } from "react";

const Productos = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Cargar productos desde el backend
  useEffect(() => {
    fetch("http://localhost:3000/listarp")
      .then((res) => {
        if (!res.ok) throw new Error("Error al obtener productos");
        return res.json();
      })
      .then((data) => {
        setProductos(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error:", error);
        setLoading(false);
      });
  }, []);

  // 🔹 Navegar al formulario para agregar un nuevo producto
  const handleAdd = () => {
    window.location.href = "/productos/nuevo";
  };

  // 🔹 Navegar al formulario para editar un producto
  const handleEdit = (producto) => {
    window.location.href = `/productos/editar/${producto.IdProducto}`;
  };

  // 🔹 Eliminar producto
  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este producto?")) return;

    try {
      const res = await fetch(`http://localhost:3000/eliminarp/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Error al eliminar producto");

      // Actualizar el estado local sin recargar
      setProductos((prev) => prev.filter((p) => p.IdProducto !== id));
      alert("✅ Producto eliminado correctamente");
    } catch (error) {
      console.error("Error eliminando producto:", error);
      alert("❌ No se pudo eliminar el producto");
    }
  };

  // 🔹 Mostrar mensajes según el estado
  if (loading)
    return <p className="p-6 text-gray-600">⏳ Cargando productos...</p>;

  if (!productos.length)
    return (
      <p className="p-6 text-gray-600">⚠️ No hay productos registrados.</p>
    );

  // 🔹 Render principal
  return (
    <div className="p-6">
      {/* Título + Botón agregar */}
      <div className="flex justify-between mb-4 items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          📦 Gestión de Productos
        </h1>
        <button
          onClick={handleAdd}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
        >
          ➕ Nuevo Producto
        </button>
      </div>

      {/* Tabla de productos */}
      <table className="min-w-full bg-white rounded-lg shadow-md overflow-hidden">
        <thead>
          <tr className="bg-gray-200 text-left">
            <th className="p-3">ID Producto</th>
            <th className="p-3">Nombre</th>
            <th className="p-3">Descripción</th>
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
              <td className="p-3">{p.IdProducto}</td>
              <td className="p-3">{p.NombreProducto}</td>
              <td className="p-3">{p.Descripcion}</td>
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
    </div>
  );
};

export default Productos;
