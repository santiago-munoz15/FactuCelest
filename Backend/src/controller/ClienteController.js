import ClienteModel from "../model/ClienteModel.js";

const documentoValido = (tipo, documento) => tipo === "CC"
  ? /^\d+$/.test(documento)
  : tipo === "NIT" && /^\d+-\d$/.test(documento);

const ClienteController = {
  listarClientes: async (_req, res) => {
    try { return res.status(200).json({ success: true, clientes: await ClienteModel.listar() }); }
    catch (err) { console.error("Error al listar clientes:", err); return res.status(500).json({ success: false, error: "Error en el servidor" }); }
  },
  buscarCliente: async (req, res) => {
    try {
      const { documento } = req.params;
      const { nombre } = req.query;
      if (nombre?.trim()) {
        const clientes = await ClienteModel.buscarPorNombre(nombre);
        return clientes.length ? res.json({ success: true, data: clientes }) : res.status(404).json({ success: false, message: "Cliente no encontrado" });
      }
      const cliente = await ClienteModel.buscarPorDocumento(documento);
      return cliente ? res.json({ success: true, data: cliente }) : res.status(404).json({ success: false, message: "Cliente no encontrado" });
    } catch (err) { console.error("Error al buscar cliente:", err); return res.status(500).json({ success: false, error: "Error en el servidor" }); }
  },
  actualizarCliente: async (req, res) => {
    try {
      const { Nombre, Telefono, Correo, Direccion, Departamento, Ciudad } = req.body;
      if (!String(Nombre ?? "").trim()) return res.status(400).json({ success: false, message: "El nombre es obligatorio" });
      if (Telefono && !/^\d+$/.test(String(Telefono))) return res.status(400).json({ success: false, message: "El teléfono solo puede contener números" });
      if (Correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(Correo))) return res.status(400).json({ success: false, message: "El correo no tiene un formato válido" });
      const resultado = await ClienteModel.actualizar(req.params.documento, { Nombre, Telefono, Correo, Direccion, Departamento, Ciudad });
      return resultado.success ? res.json({ success: true, message: resultado.message, data: resultado.cliente }) : res.status(404).json({ success: false, message: resultado.message });
    } catch (err) { console.error("Error al actualizar cliente:", err); return res.status(500).json({ success: false, error: "Error en el servidor" }); }
  },
  eliminarCliente: async (req, res) => {
    try {
      const resultado = await ClienteModel.eliminar(req.params.documento);
      return resultado.success ? res.json({ success: true, message: resultado.message }) : res.status(404).json({ success: false, message: resultado.message });
    } catch (err) { console.error("Error al eliminar cliente:", err); return res.status(500).json({ success: false, error: "Error en el servidor" }); }
  },
  crearCliente: async (req, res) => {
    try {
      const { Nombre, Telefono, Correo, Direccion, Departamento, Ciudad } = req.body;
      const TipoDocumento = String(req.body.TipoDocumento ?? "").toUpperCase();
      const Documento = String(req.body.Documento ?? "").trim();
      if (!String(Nombre ?? "").trim() || String(Nombre).trim().length > 50 || Documento.length > 30 || !documentoValido(TipoDocumento, Documento)) {
        return res.status(400).json({ success: false, message: "Indica un nombre y un documento válido: cédula numérica o NIT con guion y dígito de verificación" });
      }
      if (Telefono && !/^\d+$/.test(String(Telefono))) return res.status(400).json({ success: false, message: "El teléfono solo puede contener números" });
      if (Correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(Correo))) return res.status(400).json({ success: false, message: "El correo no tiene un formato válido" });
      const resultado = await ClienteModel.crear({ Nombre, TipoDocumento, Documento, Telefono, Correo, Direccion, Departamento, Ciudad });
      return res.status(201).json({ success: true, message: resultado.message, data: resultado.cliente });
    } catch (err) { console.error("Error al registrar cliente:", err); return res.status(500).json({ success: false, error: "Error al registrar cliente" }); }
  },
};

export default ClienteController;
