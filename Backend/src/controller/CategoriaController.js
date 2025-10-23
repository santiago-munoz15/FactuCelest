import { getAllCategorias } from "../model/CategoriaModel.js";

const getAllC = async (req, res) => {
  try {
    const categorias = await getAllCategorias();
    res.json(categorias);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export { getAllC };
