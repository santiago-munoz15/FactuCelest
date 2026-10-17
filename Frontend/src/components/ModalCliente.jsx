import { useState } from "react";
import axios from "axios";
import { showSuccessAlert, showErrorAlert } from "../utils/sweetAlertHelper";
import { buildApiUrl } from "../config/api";

const inputClass = "app-input";
const initialCliente = { TipoDocumento: "CC", Documento: "", Nombre: "", Telefono: "", Correo: "", Direccion: "", Departamento: "", Ciudad: "" };

export default function ModalCliente({ onClose, onClienteCreado }) {
  const [cliente, setCliente] = useState(initialCliente);
  const [loading, setLoading] = useState(false);
  const handleChange = (event) => {
    const { name, value } = event.target;
    setCliente((actual) => ({ ...actual, [name]: value }));
  };
  const handleGuardar = async () => {
    const documentoValido = cliente.TipoDocumento === "CC" ? /^\d+$/.test(cliente.Documento) : /^\d+-\d$/.test(cliente.Documento);
    if (!cliente.Nombre.trim() || !documentoValido) {
      showErrorAlert("Revisa los datos", cliente.TipoDocumento === "CC" ? "La cédula debe contener solo números" : "Ingresa el NIT con guion y dígito de verificación, por ejemplo 890117288-7");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(buildApiUrl("/api/clientes/crear"), { ...cliente, Documento: cliente.Documento.trim(), Telefono: cliente.Telefono.trim(), Correo: cliente.Correo.trim() });
      await showSuccessAlert("¡Éxito!", "Cliente registrado correctamente");
      onClienteCreado(res.data.data);
      onClose();
    } catch (error) {
      showErrorAlert("Error", error.response?.data?.message || "No se pudo registrar el cliente. Intenta nuevamente.");
    } finally { setLoading(false); }
  };
  return <div className="fixed inset-0 flex justify-center items-center z-50 px-4" style={{ backgroundColor: "rgba(0,0,0,.5)", backdropFilter: "blur(8px)" }}>
    <div className="bg-white dark:bg-gray-800 p-5 md:p-8 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
      <h3 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-gray-100">Registrar cliente</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Tipo de documento<select name="TipoDocumento" value={cliente.TipoDocumento} onChange={(e) => setCliente((actual) => ({ ...actual, TipoDocumento: e.target.value, Documento: "" }))} className={`${inputClass} mt-2`}><option value="CC">Cédula de ciudadanía</option><option value="NIT">NIT</option></select></label>
        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">{cliente.TipoDocumento === "CC" ? "Número de cédula" : "NIT"}<input required maxLength="30" name="Documento" inputMode={cliente.TipoDocumento === "CC" ? "numeric" : "text"} pattern={cliente.TipoDocumento === "CC" ? "[0-9]+" : "[0-9]+-[0-9]"} placeholder={cliente.TipoDocumento === "CC" ? "Solo números" : "890117288-7"} value={cliente.Documento} onChange={handleChange} className={`${inputClass} mt-2`} /></label>
        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Nombre completo<input required maxLength="50" name="Nombre" value={cliente.Nombre} onChange={handleChange} className={`${inputClass} mt-2`} /></label>
        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Teléfono (opcional)<input name="Telefono" inputMode="numeric" pattern="[0-9]*" value={cliente.Telefono} onChange={handleChange} className={`${inputClass} mt-2`} /></label>
        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Correo (opcional)<input type="email" maxLength="100" name="Correo" value={cliente.Correo} onChange={handleChange} className={`${inputClass} mt-2`} /></label>
        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Dirección<input maxLength="150" name="Direccion" value={cliente.Direccion} onChange={handleChange} className={`${inputClass} mt-2`} /></label>
        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Departamento<input maxLength="100" name="Departamento" value={cliente.Departamento} onChange={handleChange} className={`${inputClass} mt-2`} /></label>
        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Ciudad<input maxLength="100" name="Ciudad" value={cliente.Ciudad} onChange={handleChange} className={`${inputClass} mt-2`} /></label>
      </div>
      <button onClick={handleGuardar} disabled={loading} className="mt-6 app-btn-primary p-3 w-full disabled:opacity-60">{loading ? "Guardando..." : "Guardar cliente"}</button>
      <button onClick={onClose} className="mt-4 text-gray-500 dark:text-gray-400 text-sm font-medium w-full">Cancelar</button>
    </div>
  </div>;
}
