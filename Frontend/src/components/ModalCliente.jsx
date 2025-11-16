import React, { useState } from "react";
import axios from "axios";
import { showSuccessAlert, showErrorAlert } from "../utils/sweetAlertHelper";

export default function ModalCliente({ onClose, onClienteCreado }) {
  const [cliente, setCliente] = useState({
    Documento: "",
    Nombre: "",
    Telefono: "",
    Correo: "",
    Direccion: "",
  });

  const [loading, setLoading] = useState(false);

  // Manejo de inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCliente({ ...cliente, [name]: value });
  };

  // Guardar cliente en la base de datos
  const handleGuardar = async () => {
    const { Documento, Nombre, Telefono, Correo, Direccion } = cliente;

    // Validar campos vacíos
    if (!Documento || !Nombre || !Telefono || !Correo || !Direccion) {
      showErrorAlert("Campos incompletos", "Todos los campos son obligatorios");
      return;
    }

    setLoading(true);

    try {
      // Llamada al backend
      const res = await axios.post(
        "http://localhost:3000/api/clientes/crear",
        cliente
      );

      if (res.status === 200 || res.status === 201) {
        await showSuccessAlert("¡Éxito!", "Cliente registrado correctamente");
        onClienteCreado(res.data.data); // Envía el cliente con IdCliente
        onClose(); // Cierra el modal
      } else {
        showErrorAlert("Error", "No se pudo registrar el cliente");
      }
    } catch (error) {
      console.error("❌ Error al registrar cliente:", error);
      showErrorAlert(
        "Error",
        "No se pudo registrar el cliente. Intenta nuevamente."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 flex justify-center items-center z-50 animate-fadeIn"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        backdropFilter: "blur(8px)",
      }}
    >
      <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl w-full max-w-md shadow-2xl transform animate-slideIn">
        <h3 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-gray-100">
          🧍 Registrar Cliente
        </h3>

        <div className="space-y-4">
          <input
            name="Documento"
            placeholder="Documento"
            value={cliente.Documento}
            onChange={handleChange}
            className="border-2 border-gray-200 dark:border-gray-600 p-3 w-full rounded-xl focus:border-cyan-500 dark:focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200 dark:focus:ring-cyan-800 outline-none transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />

          <input
            name="Nombre"
            placeholder="Nombre completo"
            value={cliente.Nombre}
            onChange={handleChange}
            className="border-2 border-gray-200 dark:border-gray-600 p-3 w-full rounded-xl focus:border-cyan-500 dark:focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200 dark:focus:ring-cyan-800 outline-none transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />

          <input
            name="Telefono"
            placeholder="Teléfono"
            value={cliente.Telefono}
            onChange={handleChange}
            className="border-2 border-gray-200 dark:border-gray-600 p-3 w-full rounded-xl focus:border-cyan-500 dark:focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200 dark:focus:ring-cyan-800 outline-none transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />

          <input
            name="Correo"
            placeholder="Correo electrónico"
            type="email"
            value={cliente.Correo}
            onChange={handleChange}
            className="border-2 border-gray-200 dark:border-gray-600 p-3 w-full rounded-xl focus:border-cyan-500 dark:focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200 dark:focus:ring-cyan-800 outline-none transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />

          <input
            name="Direccion"
            placeholder="Dirección"
            value={cliente.Direccion}
            onChange={handleChange}
            className="border-2 border-gray-200 dark:border-gray-600 p-3 w-full rounded-xl focus:border-cyan-500 dark:focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200 dark:focus:ring-cyan-800 outline-none transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>

        <button
          onClick={handleGuardar}
          disabled={loading}
          className={`mt-6 ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-cyan-500 to-cyan-700 hover:from-cyan-600 hover:to-cyan-800"
          } text-white p-3 w-full rounded-xl font-semibold transition-all shadow-lg`}
        >
          {loading ? "Guardando..." : "Guardar Cliente"}
        </button>

        <button
          onClick={onClose}
          className="mt-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-sm font-medium w-full text-center transition-colors"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
