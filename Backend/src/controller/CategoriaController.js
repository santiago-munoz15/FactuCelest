import { actualizarCategoria as actualizarCategoriaModel, crearCategoria as crearCategoriaModel, eliminarCategoria as eliminarCategoriaModel, getAllCategorias } from "../model/CategoriaModel.js";

const getAllC = async (req, res) => {
  try {
    const categorias = await getAllCategorias();
    res.json(categorias);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const validarCategoria = (body) => String(body.NombreCategoria ?? "").trim().length > 0 && String(body.NombreCategoria).trim().length <= 50 && String(body.Descripcion ?? "").trim().length <= 200;

const crearCategoria = async (req, res) => {
  if (!validarCategoria(req.body)) return res.status(400).json({ success: false, message: "El nombre es obligatorio (máximo 50 caracteres) y la descripción admite hasta 200" });
  try { return res.status(201).json({ success: true, data: await crearCategoriaModel(req.body) }); }
  catch (error) { console.error("Error creando categoría:", error); return res.status(500).json({ success: false, message: "No se pudo crear la categoría" }); }
};

const actualizarCategoria = async (req, res) => {
  if (!validarCategoria(req.body)) return res.status(400).json({ success: false, message: "El nombre es obligatorio (máximo 50 caracteres) y la descripción admite hasta 200" });
  try {
    const data = await actualizarCategoriaModel(req.params.id, req.body);
    if (!data) return res.status(404).json({ success: false, message: "Categoría no encontrada" });
    return res.json({ success: true, data });
  } catch (error) { console.error("Error actualizando categoría:", error); return res.status(500).json({ success: false, message: "No se pudo actualizar la categoría" }); }
};

const eliminarCategoria = async (req, res) => {
  try {
    const eliminada = await eliminarCategoriaModel(req.params.id);
    if (!eliminada) return res.status(404).json({ success: false, message: "Categoría no encontrada" });
    return res.json({ success: true });
  } catch (error) {
    console.error("Error eliminando categoría:", error);
    return res.status(409).json({ success: false, message: "No se puede eliminar: la categoría puede estar asignada a productos" });
  }
};

export { actualizarCategoria, crearCategoria, eliminarCategoria, getAllC };
