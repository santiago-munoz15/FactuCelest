import ClienteModel from "../model/ClienteModel.js";

const ClienteController = {
  // 🔹 Buscar cliente por documento o nombre
  buscarCliente: async (req, res) => {
    try {
      const { documento } = req.params;
      const { nombre } = req.query;

      if (nombre && nombre.trim()) {
        const clientes = await ClienteModel.buscarPorNombre(nombre);

        if (!clientes || clientes.length === 0) {
          return res
            .status(404)
            .json({ success: false, message: "⚠️ Cliente no encontrado" });
        }

        return res.status(200).json({ success: true, data: clientes });
      }

      const cliente = await ClienteModel.buscarPorDocumento(documento);

      if (!cliente) {
        return res
          .status(404)
          .json({ success: false, message: "⚠️ Cliente no encontrado" });
      }

      res.status(200).json({ success: true, data: cliente });
    } catch (err) {
      console.error("❌ Error al buscar cliente:", err);
      res.status(500).json({ success: false, error: "Error en el servidor" });
    }
  },

  // 🔹 Registrar cliente nuevo
  crearCliente: async (req, res) => {
    try {
      const { Nombre, Documento, Telefono, Correo, Direccion, Ciudad } = req.body;

      if (!Nombre || !Documento || !Telefono || !Correo || !Direccion || !Ciudad) {
        return res
          .status(400)
          .json({ error: "⚠️ Todos los campos son obligatorios" });
      }

      const nuevoCliente = { Nombre, Documento, Telefono, Correo, Direccion, Ciudad };

      const resultado = await ClienteModel.crear(nuevoCliente);

      if (resultado.success) {
        res.status(201).json({
          success: true,
          message: resultado.message,
          data: resultado.cliente, // Devuelve el cliente con IdCliente
        });
      } else {
        res.status(400).json({
          success: false,
          message: resultado.message,
        });
      }
    } catch (err) {
      console.error("❌ Error al registrar cliente:", err);
      res.status(500).json({ error: "❌ Error al registrar cliente" });
    }
  },
};

export default ClienteController;
