import { getAllProveedor } from "../model/ProveedorModel.js";

const getAllProv = async (req, res) => {
  try {
    const proveedores = await getAllProveedor();
    res.json(proveedores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export { getAllProv };
