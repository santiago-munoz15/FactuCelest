import {
  actualizarProveedor as actualizarProveedorModel,
  crearProveedor as crearProveedorModel,
  eliminarProveedor as eliminarProveedorModel,
  getAllProveedor,
} from "../model/ProveedorModel.js";

const getAllProv = async (req, res) => {
  try {
    const proveedores = await getAllProveedor();
    res.json(proveedores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const validarProveedor = (body) => {
  const camposObligatorios = ["TaxId", "NombreEmpresa"];
  return camposObligatorios.every((campo) => String(body[campo] ?? "").trim());
};

const crearProveedor = async (req, res) => {
  try {
    if (!validarProveedor(req.body)) {
      return res.status(400).json({ success: false, message: "Tax ID y nombre de empresa son obligatorios" });
    }

    const proveedor = await crearProveedorModel(req.body);
    return res.status(201).json({ success: true, data: proveedor });
  } catch (error) {
    console.error("Error creando proveedor:", error);
    return res.status(500).json({ success: false, message: "No se pudo crear el proveedor" });
  }
};

const actualizarProveedor = async (req, res) => {
  try {
    if (!String(req.body.NombreEmpresa ?? "").trim()) {
      return res.status(400).json({ success: false, message: "El nombre de empresa es obligatorio" });
    }

    const proveedor = await actualizarProveedorModel(req.params.taxId, req.body);
    return res.status(200).json({ success: true, data: proveedor });
  } catch (error) {
    console.error("Error actualizando proveedor:", error);
    return res.status(500).json({ success: false, message: "No se pudo actualizar el proveedor" });
  }
};

const eliminarProveedor = async (req, res) => {
  try {
    await eliminarProveedorModel(req.params.taxId);
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error eliminando proveedor:", error);
    return res.status(500).json({ success: false, message: "No se pudo eliminar el proveedor" });
  }
};

export { actualizarProveedor, crearProveedor, eliminarProveedor, getAllProv };
