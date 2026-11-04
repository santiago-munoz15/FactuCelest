import NotificacionModel from "../model/NotificacionModel.js";

const NotificacionController = {
  listar: async (_req, res) => {
    try {
      res.json({ success: true, ...(await NotificacionModel.listar()) });
    } catch (error) {
      console.error("Error al consultar notificaciones:", error);
      res.status(500).json({ success: false, error: "No se pudieron cargar las notificaciones." });
    }
  },

  marcarLeida: async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id <= 0) return res.status(400).json({ success: false, error: "Notificación inválida." });
    try {
      const actualizada = await NotificacionModel.marcarLeida(id);
      if (!actualizada) return res.status(404).json({ success: false, error: "No se encontró la notificación." });
      res.json({ success: true });
    } catch (error) {
      console.error("Error al marcar notificación:", error);
      res.status(500).json({ success: false, error: "No se pudo actualizar la notificación." });
    }
  },

  marcarTodasLeidas: async (_req, res) => {
    try {
      await NotificacionModel.marcarTodasLeidas();
      res.json({ success: true });
    } catch (error) {
      console.error("Error al marcar notificaciones:", error);
      res.status(500).json({ success: false, error: "No se pudieron actualizar las notificaciones." });
    }
  },
};

export default NotificacionController;
