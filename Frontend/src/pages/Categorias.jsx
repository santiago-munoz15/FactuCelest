import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { buildApiUrl } from "../config/api";
import { showConfirmAlert, showErrorAlert, showSuccessAlert } from "../utils/sweetAlertHelper";

const empty = { NombreCategoria: "", Descripcion: "" };

export default function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [form, setForm] = useState(empty);
  const [editando, setEditando] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const cargar = async () => { setCargando(true); try { const { data } = await axios.get(buildApiUrl("/api/categorias/listarcategorias")); setCategorias(Array.isArray(data) ? data : []); } catch { showErrorAlert("Error", "No se pudieron cargar las categorías"); } finally { setCargando(false); } };
  useEffect(() => { cargar(); }, []);
  const limpiar = () => { setForm(empty); setEditando(null); setModalAbierto(false); };
  const abrirEdicion = (categoria) => { setEditando(categoria.IdCategoria); setForm({ NombreCategoria: categoria.NombreCategoria, Descripcion: categoria.Descripcion || "" }); setModalAbierto(true); };
  const categoriasFiltradas = useMemo(() => {
    const termino = busqueda.trim().toLocaleLowerCase("es");
    return categorias.filter((categoria) => `${categoria.NombreCategoria || ""} ${categoria.Descripcion || ""}`.toLocaleLowerCase("es").includes(termino));
  }, [busqueda, categorias]);
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
    <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-slate-900 to-violet-900 text-white shadow-2xl">
      <div className="flex flex-col gap-4 border-b border-white/10 p-6 md:flex-row md:items-end md:justify-between md:p-8">
        <div><p className="mb-3 text-xs uppercase tracking-[0.3em] text-violet-200">Catalogo de productos</p><h1 className="mb-3 text-3xl font-black md:text-4xl">Categorias</h1><p className="text-slate-200">Organiza las categorias que apareceran al registrar productos.</p></div>
        <div className="min-w-36 rounded-2xl border border-white/10 bg-white/10 p-4"><p className="text-xs text-violet-100">Registradas</p><p className="text-2xl font-bold">{categorias.length}</p></div>
      </div>
    </section>

    <section className="flex flex-col gap-4 rounded-3xl border border-gray-100 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800 sm:flex-row sm:items-center sm:justify-between md:p-5">
      <label className="flex h-12 min-w-0 flex-1 items-center gap-3 rounded-2xl border border-gray-200 px-4 text-gray-400 dark:border-gray-700 dark:text-gray-400">
        <svg aria-hidden="true" className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg><input type="search" value={busqueda} onChange={(event) => setBusqueda(event.target.value)} placeholder="Buscar por nombre o descripcion..." aria-label="Buscar categorias" className="w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400 dark:text-gray-100" />
      </label>
      <button type="button" onClick={() => { setEditando(null); setForm(empty); setModalAbierto(true); }} className="app-btn-primary inline-flex min-h-12 items-center justify-center gap-2 px-6 py-3 font-bold"><span aria-hidden="true" className="text-xl">+</span>Crear categoria</button>
    </section>

    {cargando ? <div className="app-mobile-card text-center">Cargando categorias...</div> : categorias.length === 0 ? <div className="app-mobile-card text-center">Aun no hay categorias. Crea la primera para poder asignarla a un producto.</div> : categoriasFiltradas.length === 0 ? <div className="app-mobile-card text-center">No se encontraron categorias para esta busqueda.</div> : <div className="overflow-x-auto rounded-3xl border border-gray-100 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"><table className="w-full text-sm"><thead className="bg-slate-950 text-white"><tr><th className="px-5 py-4 text-left">Categoria</th><th className="px-5 py-4 text-left">Descripcion</th><th className="px-5 py-4 text-right">Acciones</th></tr></thead><tbody>{categoriasFiltradas.map((item) => <tr key={item.IdCategoria} className="border-b border-gray-100 dark:border-gray-700"><td className="px-5 py-4 font-semibold text-gray-800 dark:text-gray-100">{item.NombreCategoria}</td><td className="px-5 py-4 text-gray-600 dark:text-gray-300">{item.Descripcion || "-"}</td><td className="px-5 py-4"><div className="flex justify-end gap-2"><button type="button" onClick={() => abrirEdicion(item)} className="rounded-xl bg-amber-500 px-3 py-2 text-white">Editar</button><button type="button" onClick={() => eliminar(item)} className="rounded-xl bg-red-500 px-3 py-2 text-white">Eliminar</button></div></td></tr>)}</tbody></table></div>}

    {modalAbierto && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && !guardando && limpiar()}>
      <section role="dialog" aria-modal="true" aria-labelledby="categoria-modal-title" className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl dark:bg-gray-800 md:p-8" onMouseDown={(event) => event.stopPropagation()}>
        <div className="mb-6 flex items-start justify-between gap-4"><div><p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-violet-600 dark:text-violet-300">Catalogo de productos</p><h2 id="categoria-modal-title" className="text-2xl font-black text-gray-900 dark:text-white">{editando === null ? "Crear categoria" : "Editar categoria"}</h2><p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Completa los datos para organizar tus productos.</p></div><button type="button" onClick={limpiar} disabled={guardando} aria-label="Cerrar ventana" className="grid h-9 w-9 place-items-center rounded-full bg-gray-100 text-xl text-gray-600 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-200"><svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m18 6-12 12M6 6l12 12"/></svg></button></div>
        <form onSubmit={guardar} className="space-y-4">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Nombre de la categoria<input required maxLength="50" value={form.NombreCategoria} onChange={(event) => setForm({ ...form, NombreCategoria: event.target.value })} className="app-input mt-2" placeholder="Ej. Accesorios" /></label>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Descripcion (opcional)<textarea maxLength="200" rows="3" value={form.Descripcion} onChange={(event) => setForm({ ...form, Descripcion: event.target.value })} className="app-input mt-2 resize-y" placeholder="Describe los productos de esta categoria" /></label>
          <div className="flex flex-col-reverse justify-end gap-3 pt-2 sm:flex-row"><button type="button" onClick={limpiar} disabled={guardando} className="rounded-2xl border border-gray-200 px-5 py-3 font-semibold text-gray-700 disabled:opacity-50 dark:border-gray-600 dark:text-gray-200">Cancelar</button><button disabled={guardando} className="app-btn-primary px-6 py-3 font-bold disabled:opacity-60">{guardando ? "Guardando..." : editando === null ? "Crear categoria" : "Guardar cambios"}</button></div>
        </form>
      </section>
    </div>}
  </div>;
}
