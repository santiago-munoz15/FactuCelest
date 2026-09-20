import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { buildApiUrl } from "../config/api";
import {
  showConfirmAlert,
  showErrorAlert,
  showSuccessAlert,
} from "../utils/sweetAlertHelper";

const emptyProveedor = {
  TaxId: "",
  NombreEmpresa: "",
  NombreContacto: "",
  Telefono: "",
  Correo: "",
  Direccion: "",
  CondicionesPago: "",
};

const campos = [
  ["NombreEmpresa", "Nombre de la empresa", "text", true],
  ["NombreContacto", "Persona de contacto", "text", false],
  ["Telefono", "Teléfono", "tel", false],
  ["Correo", "Correo electrónico", "email", false],
  ["Direccion", "Dirección", "text", false],
  ["CondicionesPago", "Condiciones de pago", "text", false],
];

function Proveedores() {
  const [proveedores, setProveedores] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [proveedorEdit, setProveedorEdit] = useState(emptyProveedor);

  const cargarProveedores = async () => {
    setLoading(true);
    try {
      const response = await axios.get(buildApiUrl("/api/proveedores/listarproveedor"));
      setProveedores(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error cargando proveedores:", error);
      showErrorAlert("Error", "No se pudieron cargar los proveedores");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarProveedores();
  }, []);

  const proveedoresFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    if (!termino) return proveedores;

    return proveedores.filter((proveedor) =>
      Object.values(proveedor).some((valor) =>
        String(valor ?? "").toLowerCase().includes(termino)
      )
    );
  }, [busqueda, proveedores]);

  const abrirCrear = () => {
    setProveedorEdit(emptyProveedor);
    setModalAbierto(true);
  };

  const abrirEditar = (proveedor) => {
    setProveedorEdit({ ...emptyProveedor, ...proveedor });
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    if (!guardando) setModalAbierto(false);
  };

  const guardarProveedor = async (event) => {
    event.preventDefault();
    if (!proveedorEdit.TaxId || !proveedorEdit.NombreEmpresa.trim()) {
      showErrorAlert("Campos incompletos", "El Tax ID y el nombre de empresa son obligatorios");
      return;
    }

    setGuardando(true);
    try {
      const esEdicion = Boolean(proveedorEdit.__editando);
      const payload = { ...proveedorEdit };
      delete payload.__editando;
      const url = esEdicion
        ? `/api/proveedores/actualizar/${proveedorEdit.TaxId}`
        : "/api/proveedores/crear";
      const response = await axios({ method: esEdicion ? "put" : "post", url: buildApiUrl(url), data: payload });
      const proveedorGuardado = response.data.data;

      setProveedores((actuales) => esEdicion
        ? actuales.map((item) => String(item.TaxId) === String(proveedorEdit.TaxId) ? proveedorGuardado : item)
        : [proveedorGuardado, ...actuales]
      );
      await showSuccessAlert("Proveedor guardado", "La información se guardó correctamente");
      setModalAbierto(false);
    } catch (error) {
      console.error("Error guardando proveedor:", error);
      showErrorAlert("Error", error.response?.data?.message || "No se pudo guardar el proveedor");
    } finally {
      setGuardando(false);
    }
  };

  const eliminarProveedor = async (proveedor) => {
    const result = await showConfirmAlert(
      "¿Eliminar proveedor?",
      `Vas a eliminar a ${proveedor.NombreEmpresa}. Esta acción no se puede deshacer.`
    );
    if (!result.isConfirmed) return;

    try {
      await axios.delete(buildApiUrl(`/api/proveedores/eliminar/${proveedor.TaxId}`));
      setProveedores((actuales) => actuales.filter((item) => String(item.TaxId) !== String(proveedor.TaxId)));
      await showSuccessAlert("Proveedor eliminado", "El proveedor fue eliminado correctamente");
    } catch (error) {
      console.error("Error eliminando proveedor:", error);
      showErrorAlert("Error", error.response?.data?.message || "No se pudo eliminar el proveedor");
    }
  };

  return (
    <div className="app-page space-y-6">
      <section className="rounded-[2rem] bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-900 text-white shadow-2xl overflow-hidden">
        <div className="p-6 md:p-8 border-b border-white/10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-emerald-200 uppercase tracking-[0.3em] text-xs mb-3">Módulo de proveedores</p>
            <h1 className="text-3xl md:text-4xl font-black mb-3">Proveedores registrados</h1>
            <p className="text-slate-200 max-w-3xl">Administra los datos de las empresas que abastecen tu negocio desde un solo lugar.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 min-w-[240px]">
            <div className="rounded-2xl bg-white/10 border border-white/10 p-4"><p className="text-xs text-emerald-100">Proveedores</p><p className="text-2xl font-bold">{proveedores.length}</p></div>
            <div className="rounded-2xl bg-white/10 border border-white/10 p-4"><p className="text-xs text-emerald-100">Filtrados</p><p className="text-2xl font-bold">{proveedoresFiltrados.length}</p></div>
          </div>
        </div>
        <div className="p-6 md:p-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <input value={busqueda} onChange={(event) => setBusqueda(event.target.value)} placeholder="Buscar por empresa, contacto, Tax ID o correo" className="app-input md:max-w-xl" />
          <button type="button" onClick={abrirCrear} className="app-btn-primary w-full md:w-auto px-6 py-3">➕ Nuevo proveedor</button>
        </div>
      </section>

      {loading ? <div className="app-mobile-card text-center">⏳ Cargando proveedores...</div> : proveedoresFiltrados.length === 0 ? <div className="app-mobile-card text-center"><p className="text-4xl mb-2">🏢</p><p className="font-semibold">No hay proveedores para mostrar</p></div> : (
        <div className="overflow-x-auto rounded-3xl bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700">
          <table className="w-full text-sm min-w-[900px]">
            <thead className="bg-slate-950 text-white"><tr>{["Tax ID", "Empresa", "Contacto", "Teléfono", "Correo", "Condiciones", "Acciones"].map((titulo) => <th key={titulo} className="px-4 py-4 text-left font-semibold">{titulo}</th>)}</tr></thead>
            <tbody>{proveedoresFiltrados.map((proveedor) => <tr key={proveedor.TaxId} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/60">
              <td className="px-4 py-4 font-medium text-gray-800 dark:text-gray-100">{proveedor.TaxId}</td>
              <td className="px-4 py-4 font-semibold text-gray-800 dark:text-gray-100">{proveedor.NombreEmpresa}</td>
              <td className="px-4 py-4 text-gray-700 dark:text-gray-200">{proveedor.NombreContacto || "-"}</td>
              <td className="px-4 py-4 text-gray-700 dark:text-gray-200">{proveedor.Telefono || "-"}</td>
              <td className="px-4 py-4 text-gray-700 dark:text-gray-200">{proveedor.Correo || "-"}</td>
              <td className="px-4 py-4 text-gray-700 dark:text-gray-200">{proveedor.CondicionesPago || "-"}</td>
              <td className="px-4 py-4"><div className="flex gap-2"><button type="button" onClick={() => abrirEditar({ ...proveedor, __editando: true })} className="px-3 py-2 rounded-xl bg-amber-500 text-white font-semibold">✏️</button><button type="button" onClick={() => eliminarProveedor(proveedor)} className="px-3 py-2 rounded-xl bg-red-500 text-white font-semibold">🗑️</button></div></td>
            </tr>)}</tbody>
          </table>
        </div>
      )}

      {modalAbierto && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={cerrarModal}>
        <form onSubmit={guardarProveedor} onClick={(event) => event.stopPropagation()} className="w-full max-w-2xl rounded-3xl bg-white dark:bg-gray-900 shadow-2xl p-6 md:p-8">
          <div className="flex items-start justify-between gap-4 mb-6"><div><h2 className="text-2xl font-black text-gray-800 dark:text-gray-100">{proveedorEdit.__editando ? "Editar proveedor" : "Nuevo proveedor"}</h2><p className="text-sm text-gray-500 dark:text-gray-400">Completa la información comercial del proveedor.</p></div><button type="button" onClick={cerrarModal} className="text-gray-500 text-xl" aria-label="Cerrar">×</button></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Tax ID<input required type="number" value={proveedorEdit.TaxId} disabled={proveedorEdit.__editando} onChange={(event) => setProveedorEdit({ ...proveedorEdit, TaxId: event.target.value })} className="app-input mt-2 disabled:opacity-60" /></label>
            {campos.map(([nombre, etiqueta, tipo, requerido]) => <label key={nombre} className="text-sm font-semibold text-gray-700 dark:text-gray-300">{etiqueta}<input required={requerido} type={tipo} value={proveedorEdit[nombre] || ""} onChange={(event) => setProveedorEdit({ ...proveedorEdit, [nombre]: event.target.value })} className="app-input mt-2" /></label>)}
          </div>
          <div className="flex flex-col md:flex-row justify-end gap-3 mt-6"><button type="button" onClick={cerrarModal} className="px-5 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">Cancelar</button><button type="submit" disabled={guardando} className="app-btn-primary px-5 py-3 disabled:opacity-60">{guardando ? "Guardando..." : "Guardar proveedor"}</button></div>
        </form>
      </div>}
    </div>
  );
}

export default Proveedores;
