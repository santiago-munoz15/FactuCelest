import {
  getAllProductos,
  getUpdateProducto,
  getInsertarProducto,
  getDeleteProducto,
} from "../model/ProductoModel.js";

// 🔹 Listar productos
const getAllP = async (req, res) => {
  try {
    const productos = await getAllProductos();
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔹 Insertar producto
const insertarP = async (req, res) => {
  try {
    const {
      Referencia,
      Descripcion,
      Talla,
      PrecioVenta,
      PrecioCompra,
      IdCategoriaFK,
      TaxIdFK,
    } = req.body;

    if (!Referencia || !PrecioVenta || !IdCategoriaFK || !TaxIdFK) {
      return res
        .status(400)
        .json({ message: "Faltan campos obligatorios para el producto." });
    }

    const nuevoProducto = {
      Referencia,
      Descripcion,
      Talla,
      PrecioVenta,
      PrecioCompra,
      IdCategoriaFK,
      TaxIdFK,
    };

    const resultado = await getInsertarProducto(nuevoProducto);
    res.status(201).json({
      message: "✅ Producto insertado correctamente",
      data: resultado,
    });
  } catch (error) {
    console.error("❌ Error al insertar producto:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// 🔹 Actualizar producto
const updateP = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    console.log("📦 Actualizando producto con ID:", id);
    console.log("🧩 Datos recibidos:", data);

    const result = await getUpdateProducto(id, data);

    res.json({
      message: "✅ Producto actualizado correctamente",
      result,
    });
  } catch (error) {
    console.error("❌ Error al actualizar producto:", error.message);
    res.status(500).json({ error: error.message });
  }
};

//Eliminar Producto
const deleteP = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Falta el ID del producto." });
    }

    const result = await getDeleteProducto(id);

    if (result[0] > 0) {
      res.json({ message: "✅ Producto eliminado correctamente" });
    } else {
      res.status(404).json({ message: "❌ Producto no encontrado" });
    }
  } catch (error) {
    console.error("❌ Error al eliminar producto:", error);
    res.status(500).json({ message: "Error al eliminar producto" });
  }
};

export { getAllP, insertarP as getInsertarProducto, updateP, deleteP };
