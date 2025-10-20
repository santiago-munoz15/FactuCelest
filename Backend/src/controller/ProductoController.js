import { getAllProductos } from "../model/productoModel.js";

const getAllP = async (req, res) => {
  try {
    const productos = await getAllProductos();
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export { getAllP };
