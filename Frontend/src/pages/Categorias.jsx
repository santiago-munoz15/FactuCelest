import { useEffect, useState } from "react";
import axios from "axios";
import { buildApiUrl } from "../config/api";
import { showConfirmAlert, showErrorAlert, showSuccessAlert } from "../utils/sweetAlertHelper";

const empty = { NombreCategoria: "", Descripcion: "" };

export default function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [form, setForm] = useState(empty);
  const [editando, setEditando] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const cargar = async () => { setCargando(true); try { const { data } = await axios.get(buildApiUrl("/api/categorias/listarcategorias")); setCategorias(Array.isArray(data) ? data : []); } catch { showErrorAlert("Error", "No se pudieron cargar las categorías"); } finally { setCargando(false); } };
  useEffect(() => { cargar(); }, []);
  const limpiar = () => { setForm(empty); setEditando(null); };
  const guardar = async (event) => {
    event.preventDefault(); setGuardando(true);
    try {
      const edit = editando !== null;
      const { data } = await axios({ method: edit ? "put" : "post", url: buildApiUrl(edit ? `/api/categorias/actualizar/${editando}` : "/api/categorias/crear"), data: form });
      setCategorias((actuales) => edit ? actuales.map((item) => String(item.IdCategoria) === String(editando) ? data.data : item) : [...actuales, data.data]);
      limpiar(); await showSuccessAlert("Categoría guardada", "Ya puedes asignarla a tus productos.");
    } catch (error) { showErrorAlert("Error", error.response?.data?.message || "No se pudo guardar la categoría"); }
    finally { setGuardando(false); }
  };
  const eliminar = async (categoria) => {
    const confirmacion = await showConfirmAlert("¿Eliminar categoría?", `Vas a eliminar “${categoria.NombreCategoria}”.`);
    if (!confirmacion.isConfirmed) return;
    try { await axios.delete(buildApiUrl(`/api/categorias/eliminar/${categoria.IdCategoria}`)); setCategorias((actuales) => actuales.filter((item) => String(item.IdCategoria) !== String(categoria.IdCategoria))); if (String(editando) === String(categoria.IdCategoria)) limpiar(); await showSuccessAlert("Categoría eliminada", "La categoría fue eliminada correctamente."); }
    catch (error) { showErrorAlert("No se pudo eliminar", error.response?.data?.message || "Intenta nuevamente."); }
  };
  return <div className="app-page space-y-6">
    <section className="rounded-[2rem] bg-gradient-to-br from-slate-950 via-slate-900 to-violet-900 text-white shadow-2xl overflow-hidden"><div className="p-6 md:p-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div><p className="text-violet-200 uppercase tracking-[0.3em] text-xs mb-3">Catálogo de productos</p><h1 className="text-3xl md:text-4xl font-black mb-3">Categorías</h1><p className="text-slate-200">Crea y organiza las categorías que aparecerán al registrar productos.</p></div><div className="rounded-2xl bg-white/10 border border-white/10 p-4 min-w-36"><p className="text-xs text-violet-100">Registradas</p><p className="text-2xl font-bold">{categorias.length}</p></div></div></section>
    <form onSubmit={guardar} className="rounded-3xl bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700 p-5 md:p-7"><h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">{editando === null ? "Nueva categoría" : "Editar categoría"}</h2><div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_auto] gap-4 items-end"><label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Nombre<input required maxLength="50" value={form.NombreCategoria} onChange={(e) => setForm({ ...form, NombreCategoria: e.target.value })} className="app-input mt-2" placeholder="Ej. Accesorios" /></label><label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Descripción (opcional)<input maxLength="200" value={form.Descripcion} onChange={(e) => setForm({ ...form, Descripcion: e.target.value })} className="app-input mt-2" placeholder="Describe los productos de esta categoría" /></label><div className="flex gap-2"><button disabled={guardando} className="app-btn-primary px-5 py-3 disabled:opacity-60">{guardando ? "Guardando..." : editando === null ? "Crear" : "Guardar"}</button>{editando !== null && <button type="button" onClick={limpiar} className="px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">Cancelar</button>}</div></div></form>
    {cargando ? <div className="app-mobile-card text-center">Cargando categorías...</div> : categorias.length === 0 ? <div className="app-mobile-card text-center">Aún no hay categorías. Crea la primera para poder asignarla a un producto.</div> : <div className="overflow-x-auto rounded-3xl bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700"><table className="w-full text-sm"><thead className="bg-slate-950 text-white"><tr><th className="px-5 py-4 text-left">Categoría</th><th className="px-5 py-4 text-left">Descripción</th><th className="px-5 py-4 text-right">Acciones</th></tr></thead><tbody>{categorias.map((item) => <tr key={item.IdCategoria} className="border-b border-gray-100 dark:border-gray-700"><td className="px-5 py-4 font-semibold text-gray-800 dark:text-gray-100">{item.NombreCategoria}</td><td className="px-5 py-4 text-gray-600 dark:text-gray-300">{item.Descripcion || "—"}</td><td className="px-5 py-4"><div className="flex justify-end gap-2"><button type="button" onClick={() => { setEditando(item.IdCategoria); setForm({ NombreCategoria: item.NombreCategoria, Descripcion: item.Descripcion || "" }); }} className="px-3 py-2 rounded-xl bg-amber-500 text-white">Editar</button><button type="button" onClick={() => eliminar(item)} className="px-3 py-2 rounded-xl bg-red-500 text-white">Eliminar</button></div></td></tr>)}</tbody></table></div>}
  </div>;
}
