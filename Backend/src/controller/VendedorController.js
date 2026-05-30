import VendedorModel from "../model/VendedorModel.js";

const VendedorController = {
  listar: async (req, res) => {
    try {
      const { nombre = "" } = req.query;
      const result = await VendedorModel.listar(nombre);

      if (!result.success) {
        return res.status(500).json({ success: false, error: result.error });
      }

      res.status(200).json({ success: true, vendedores: result.vendedores });
    } catch (error) {
      console.error("❌ Error en listar vendedores:", error);
      res.status(500).json({ success: false, error: "Error al listar vendedores" });
    }
  },

  crear: async (req, res) => {
    try {
      const { Nombre, Telefono } = req.body;

      if (!Nombre || !Telefono) {
        return res.status(400).json({
          success: false,
          error: "Nombre y teléfono son obligatorios",
        });
      }

      const result = await VendedorModel.crear({ Nombre, Telefono });

      if (!result.success) {
        return res.status(400).json({ success: false, error: result.error });
      }

      res.status(201).json({
        success: true,
        message: "✅ Vendedor registrado correctamente",
        vendedor: result.vendedor,
      });
    } catch (error) {
      console.error("❌ Error en crear vendedor:", error);
      res.status(500).json({ success: false, error: "Error al crear vendedor" });
    }
  },
};

export default VendedorController;