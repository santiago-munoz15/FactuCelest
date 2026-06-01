import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import ModalCliente from "../components/ModalCliente";
import {
  showConfirmAlert,
  showErrorAlert,
  showSuccessAlert,
} from "../utils/sweetAlertHelper";
import { buildApiUrl } from "../config/api";

const emptyClienteEdit = {
  Documento: "",
  Nombre: "",
  Telefono: "",
  Correo: "",
  Direccion: "",
  Ciudad: "",
};

function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarModalCrear, setMostrarModalCrear] = useState(false);
  const [mostrarModalEditar, setMostrarModalEditar] = useState(false);
  const [clienteEdit, setClienteEdit] = useState(emptyClienteEdit);
  const [guardando, setGuardando] = useState(false);

  const cargarClientes = async () => {
    setLoading(true);
    try {
      const res = await axios.get(buildApiUrl("/api/clientes/listar"));
      if (res.data.success) {
        setClientes(res.data.clientes || []);
      } else {
        showErrorAlert("Error", "No se pudieron cargar los clientes");
      }
    } catch (error) {
      console.error("Error cargando clientes:", error);
      showErrorAlert("Error", "No se pudieron cargar los clientes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarClientes();
  }, []);

  const clientesFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();

    if (!termino) {
      return clientes;
    }

    return clientes.filter((cliente) => {
      return (
        String(cliente.Documento || "").toLowerCase().includes(termino) ||
        String(cliente.Nombre || "").toLowerCase().includes(termino) ||
        String(cliente.Telefono || "").toLowerCase().includes(termino) ||
        String(cliente.Correo || "").toLowerCase().includes(termino) ||
        String(cliente.Direccion || "").toLowerCase().includes(termino) ||
        String(cliente.Ciudad || "").toLowerCase().includes(termino)
      );
    });
  }, [busqueda, clientes]);

  const abrirEdicion = (cliente) => {
    setClienteEdit({
      Documento: cliente.Documento || "",
      Nombre: cliente.Nombre || "",
      Telefono: cliente.Telefono || "",
      Correo: cliente.Correo || "",
      Direccion: cliente.Direccion || "",
      Ciudad: cliente.Ciudad || "",
    });
    setMostrarModalEditar(true);
  };

  const cerrarEdicion = () => {
    setMostrarModalEditar(false);
    setClienteEdit(emptyClienteEdit);
  };

  const guardarEdicion = async () => {
    const { Documento, Nombre, Telefono, Correo, Direccion, Ciudad } = clienteEdit;

    if (!Nombre || !Telefono || !Correo || !Direccion || !Ciudad) {
      showErrorAlert("Campos incompletos", "Todos los campos son obligatorios");
      return;
    }

    setGuardando(true);
    try {
      const res = await axios.put(
        buildApiUrl(`/api/clientes/actualizar/${Documento}`),
        {
          Nombre,
          Telefono,
          Correo,
          Direccion,
          Ciudad,
        }
      );

      if (res.data.success) {
        setClientes((actual) =>
          actual.map((cliente) =>
            String(cliente.Documento) === String(Documento) ? res.data.data : cliente
          )
        );
        await showSuccessAlert("Cliente actualizado", "La información se guardó correctamente");
        cerrarEdicion();
      } else {
        showErrorAlert("Error", res.data.message || "No se pudo actualizar el cliente");
      }
    } catch (error) {
      console.error("Error actualizando cliente:", error);
      showErrorAlert("Error", error.response?.data?.message || "No se pudo actualizar el cliente");
    } finally {
      setGuardando(false);
    }
  };

  const eliminarCliente = async (cliente) => {
    const result = await showConfirmAlert(
      "¿Eliminar cliente?",
      `Vas a eliminar a ${cliente.Nombre}. Esta acción no se puede deshacer.`
    );

    if (!result.isConfirmed) {
      return;
    }

    try {
      const res = await axios.delete(buildApiUrl(`/api/clientes/eliminar/${cliente.Documento}`));

      if (res.data.success) {
        setClientes((actual) =>
          actual.filter((item) => String(item.Documento) !== String(cliente.Documento))
        );
        await showSuccessAlert("Cliente eliminado", "El cliente fue eliminado correctamente");
      } else {
        showErrorAlert("Error", res.data.message || "No se pudo eliminar el cliente");
      }
    } catch (error) {
      console.error("Error eliminando cliente:", error);
      showErrorAlert("Error", error.response?.data?.message || "No se pudo eliminar el cliente");
    }
  };

  return (
    <div className="app-page space-y-6">
      <div className="rounded-[2rem] bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-900 text-white shadow-2xl overflow-hidden">
        <div className="p-6 md:p-8 border-b border-white/10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-cyan-200 uppercase tracking-[0.3em] text-xs mb-3">
              Módulo de clientes
            </p>
            <h1 className="text-3xl md:text-4xl font-black mb-3">
              Clientes registrados
            </h1>
            <p className="text-slate-200 max-w-3xl">
              Consulta todos los clientes ingresados, revisa sus datos completos,
              edítalos o elimínalos desde esta pantalla.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 min-w-[260px]">
            <div className="rounded-2xl bg-white/10 backdrop-blur border border-white/10 p-4">
              <p className="text-xs text-cyan-100">Clientes</p>
              <p className="text-2xl font-bold">{clientes.length}</p>
            </div>
            <div className="rounded-2xl bg-white/10 backdrop-blur border border-white/10 p-4">
              <p className="text-xs text-cyan-100">Filtrados</p>
              <p className="text-2xl font-bold">{clientesFiltrados.length}</p>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, documento, teléfono, correo o ciudad"
            className="app-input md:max-w-xl"
          />

          <button
            onClick={() => setMostrarModalCrear(true)}
            className="w-full md:w-auto px-6 py-3 rounded-2xl font-black text-base text-white shadow-2xl transition-all duration-300 bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-600 hover:from-cyan-600 hover:via-teal-600 hover:to-emerald-700 hover:-translate-y-0.5 hover:shadow-cyan-500/30 border border-white/10"
          >
            <span className="inline-flex items-center justify-center gap-2">
              <span className="text-xl">➕</span>
              <span>Nuevo cliente</span>
            </span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="rounded-3xl bg-white dark:bg-gray-800 p-8 shadow-lg text-center text-gray-600 dark:text-gray-300">
          ⏳ Cargando clientes...
        </div>
      ) : clientesFiltrados.length === 0 ? (
        <div className="rounded-3xl bg-white dark:bg-gray-800 p-8 shadow-lg text-center text-gray-600 dark:text-gray-300">
          <p className="text-5xl mb-3">👤</p>
          <p className="font-semibold text-lg mb-1">No hay clientes para mostrar</p>
          <p className="text-sm">Prueba con otro criterio de búsqueda o crea un nuevo cliente.</p>
        </div>
      ) : (
        <>
          <div className="hidden md:block overflow-x-auto rounded-3xl bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700">
            <table className="w-full text-sm">
              <thead className="bg-slate-950 text-white">
                <tr>
                  <th className="px-4 py-4 text-left font-semibold">Documento</th>
                  <th className="px-4 py-4 text-left font-semibold">Nombre</th>
                  <th className="px-4 py-4 text-left font-semibold">Teléfono</th>
                  <th className="px-4 py-4 text-left font-semibold">Correo</th>
                  <th className="px-4 py-4 text-left font-semibold">Dirección</th>
                  <th className="px-4 py-4 text-left font-semibold">Ciudad</th>
                  <th className="px-4 py-4 text-center font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {clientesFiltrados.map((cliente) => (
                  <tr
                    key={cliente.Documento}
                    className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-colors"
                  >
                    <td className="px-4 py-4 text-gray-800 dark:text-gray-100 font-medium">{cliente.Documento}</td>
                    <td className="px-4 py-4 text-gray-700 dark:text-gray-200">{cliente.Nombre}</td>
                    <td className="px-4 py-4 text-gray-700 dark:text-gray-200">{cliente.Telefono || "-"}</td>
                    <td className="px-4 py-4 text-gray-700 dark:text-gray-200">{cliente.Correo || "-"}</td>
                    <td className="px-4 py-4 text-gray-700 dark:text-gray-200">{cliente.Direccion || "-"}</td>
                    <td className="px-4 py-4 text-gray-700 dark:text-gray-200">{cliente.Ciudad || "-"}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => abrirEdicion(cliente)}
                          className="px-4 py-2 rounded-xl bg-amber-500 text-white font-semibold hover:bg-amber-600 transition-colors"
                        >
                          ✏️ Editar
                        </button>
                        <button
                          onClick={() => eliminarCliente(cliente)}
                          className="px-4 py-2 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors"
                        >
                          🗑️ Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-4 md:hidden">
            {clientesFiltrados.map((cliente) => (
              <div key={cliente.Documento} className="app-mobile-card space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-gray-800 dark:text-gray-100">{cliente.Nombre}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{cliente.Documento}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => abrirEdicion(cliente)}
                      className="px-3 py-2 rounded-xl bg-amber-500 text-white text-sm font-semibold"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => eliminarCliente(cliente)}
                      className="px-3 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <p><span className="font-semibold">Teléfono:</span> {cliente.Telefono || "-"}</p>
                  <p><span className="font-semibold">Correo:</span> {cliente.Correo || "-"}</p>
                  <p><span className="font-semibold">Dirección:</span> {cliente.Direccion || "-"}</p>
                  <p><span className="font-semibold">Ciudad:</span> {cliente.Ciudad || "-"}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {mostrarModalCrear && (
        <ModalCliente
          onClose={() => setMostrarModalCrear(false)}
          onClienteCreado={(nuevoCliente) => {
            setClientes((actual) => [nuevoCliente, ...actual]);
            setMostrarModalCrear(false);
          }}
        />
      )}

      {mostrarModalEditar && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={cerrarEdicion}
        >
          <div
            className="w-full max-w-2xl rounded-3xl bg-white dark:bg-gray-900 shadow-2xl border border-gray-100 dark:border-gray-800 p-6 md:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-black text-gray-800 dark:text-gray-100">
                  Editar cliente
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Actualiza los datos del cliente seleccionado.
                </p>
              </div>
              <button
                onClick={cerrarEdicion}
                className="rounded-full border border-gray-200 dark:border-gray-700 px-4 py-2 text-gray-600 dark:text-gray-300"
              >
                Cerrar
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Documento
                </label>
                <input
                  type="text"
                  value={clienteEdit.Documento}
                  readOnly
                  className="app-input bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  value={clienteEdit.Nombre}
                  onChange={(e) =>
                    setClienteEdit((actual) => ({ ...actual, Nombre: e.target.value }))
                  }
                  className="app-input"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Teléfono
                </label>
                <input
                  type="text"
                  value={clienteEdit.Telefono}
                  onChange={(e) =>
                    setClienteEdit((actual) => ({ ...actual, Telefono: e.target.value }))
                  }
                  className="app-input"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Correo
                </label>
                <input
                  type="email"
                  value={clienteEdit.Correo}
                  onChange={(e) =>
                    setClienteEdit((actual) => ({ ...actual, Correo: e.target.value }))
                  }
                  className="app-input"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Dirección
                </label>
                <input
                  type="text"
                  value={clienteEdit.Direccion}
                  onChange={(e) =>
                    setClienteEdit((actual) => ({ ...actual, Direccion: e.target.value }))
                  }
                  className="app-input"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Ciudad
                </label>
                <input
                  type="text"
                  value={clienteEdit.Ciudad}
                  onChange={(e) =>
                    setClienteEdit((actual) => ({ ...actual, Ciudad: e.target.value }))
                  }
                  className="app-input"
                />
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-end gap-3 mt-6">
              <button
                onClick={cerrarEdicion}
                className="px-5 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={guardarEdicion}
                disabled={guardando}
                className="px-5 py-3 rounded-2xl font-black text-white shadow-2xl transition-all duration-300 bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-600 hover:from-cyan-600 hover:via-teal-600 hover:to-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {guardando ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Clientes;
