import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { showConfirmAlert, showErrorAlert, showSuccessAlert } from "../utils/sweetAlertHelper";
import { buildApiUrl } from "../config/api";

const PAGE_SIZE = 10;
const EMPTY_PRODUCT = { Referencia: "", Descripcion: "", Talla: "", PrecioVenta: "", PrecioCompra: "", IdCategoriaFK: "", TaxIdFK: "" };
const currency = (value) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(Number(value || 0));

function ProductIcon({ size = 22 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true"><path d="m12 2 9 5-9 5-9-5 9-5Z"/><path d="M3 7v10l9 5 9-5V7M12 12v10"/></svg>;
}

function ProductModal({ product, categories, suppliers, saving, onChange, onClose, onSubmit }) {
  const editing = Boolean(product.IdProducto);
  return <div className="product-overlay" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><form className="product-form-modal" onSubmit={onSubmit}>
    <header><span className="product-modal-icon"><ProductIcon/></span><div><h2>{editing ? "Editar producto" : "Nuevo producto"}</h2><p>Completa la información de inventario.</p></div><button type="button" className="products-close" onClick={onClose} aria-label="Cerrar">×</button></header>
    <div className="product-form-grid"><label>Referencia<input required name="Referencia" value={product.Referencia || ""} onChange={onChange} placeholder="Ej. REF-001"/></label><label className="product-form-wide">Descripción<input required name="Descripcion" value={product.Descripcion || ""} onChange={onChange} placeholder="Nombre o descripción del producto"/></label><label>Talla<input name="Talla" value={product.Talla || ""} onChange={onChange} placeholder="Ej. M"/></label><label>Precio de venta<input required min="0" step="100" type="number" name="PrecioVenta" value={product.PrecioVenta ?? ""} onChange={onChange} placeholder="$ 0"/></label><label>Precio de compra<input required min="0" step="100" type="number" name="PrecioCompra" value={product.PrecioCompra ?? ""} onChange={onChange} placeholder="$ 0"/></label><label>Categoría<select required name="IdCategoriaFK" value={product.IdCategoriaFK ?? ""} onChange={onChange}><option value="">Seleccionar categoría</option>{categories.map((category) => <option key={category.IdCategoria} value={category.IdCategoria}>{category.NombreCategoria}</option>)}</select></label><label>Proveedor<select required name="TaxIdFK" value={product.TaxIdFK ?? ""} onChange={onChange}><option value="">Seleccionar proveedor</option>{suppliers.map((supplier) => <option key={supplier.TaxId} value={supplier.TaxId}>{supplier.NombreEmpresa}</option>)}</select></label></div>
    <footer><button type="button" className="products-cancel" onClick={onClose}>Cancelar</button><button type="submit" className="products-primary" disabled={saving}>{saving ? "Guardando…" : editing ? "Guardar cambios" : "Crear producto"}</button></footer>
  </form></div>;
}

export default function Productos() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("");
  const [sizeFilter, setSizeFilter] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState([]);
  const [productForm, setProductForm] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);

  const loadProducts = async () => {
    try {
      const response = await axios.get(buildApiUrl("/api/productos/listarp"));
      setProducts(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error al obtener productos:", error);
      showErrorAlert("Error", "No se pudieron cargar los productos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
    Promise.allSettled([
      axios.get(buildApiUrl("/api/categorias/listarcategorias")),
      axios.get(buildApiUrl("/api/proveedores/listarproveedor")),
    ]).then(([categoryResult, supplierResult]) => {
      if (categoryResult.status === "fulfilled" && Array.isArray(categoryResult.value.data)) setCategories(categoryResult.value.data);
      if (supplierResult.status === "fulfilled" && Array.isArray(supplierResult.value.data)) setSuppliers(supplierResult.value.data);
    });
  }, []);

  const filteredProducts = useMemo(() => products.filter((product) => {
    const needle = search.trim().toLocaleLowerCase("es");
    const matchesSearch = !needle || [product.Referencia, product.Descripcion, product.NombreProveedor].some((value) => String(value || "").toLocaleLowerCase("es").includes(needle));
    const matchesCategory = !categoryFilter || String(product.IdCategoriaFK) === categoryFilter;
    const matchesSupplier = !supplierFilter || String(product.TaxIdFK) === supplierFilter;
    const matchesSize = !sizeFilter || String(product.Talla || "") === sizeFilter;
    return matchesSearch && matchesCategory && matchesSupplier && matchesSize;
  }), [products, search, categoryFilter, supplierFilter, sizeFilter]);

  const pageCount = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const visibleProducts = filteredProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPurchaseValue = products.reduce((sum, product) => sum + Number(product.PrecioCompra || 0), 0);
  const totalSaleValue = products.reduce((sum, product) => sum + Number(product.PrecioVenta || 0), 0);
  const sizes = [...new Set(products.map((product) => product.Talla).filter(Boolean))].sort();
  const visibleIds = visibleProducts.map((product) => product.IdProducto);
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selected.includes(id));

  useEffect(() => { setPage(1); }, [search, categoryFilter, supplierFilter, sizeFilter]);
  useEffect(() => { if (page > pageCount) setPage(pageCount); }, [page, pageCount]);

  const openCreate = () => setProductForm({ ...EMPTY_PRODUCT });
  const openEdit = (product) => setProductForm({ ...product });
  const changeForm = (event) => setProductForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const saveProduct = async (event) => {
    event.preventDefault();
    setSaving(true);
    const payload = { ...productForm, PrecioVenta: Number(productForm.PrecioVenta), PrecioCompra: Number(productForm.PrecioCompra), IdCategoriaFK: Number(productForm.IdCategoriaFK), TaxIdFK: Number(productForm.TaxIdFK) };
    try {
      if (productForm.IdProducto) {
        await axios.put(buildApiUrl(`/api/productos/actualizarp/${productForm.IdProducto}`), payload);
        await showSuccessAlert("Producto actualizado", "Los cambios se guardaron correctamente.");
      } else {
        await axios.post(buildApiUrl("/api/productos/insertarp"), payload);
        await showSuccessAlert("Producto creado", "El producto se agregó al catálogo.");
      }
      setProductForm(null);
      await loadProducts();
    } catch (error) {
      console.error("Error guardando producto:", error);
      showErrorAlert("Error", error.response?.data?.message || error.response?.data?.error || "No se pudo guardar el producto");
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (product) => {
    const confirmation = await showConfirmAlert("¿Eliminar producto?", `Se eliminará ${product.Descripcion || product.Referencia}.`);
    if (!confirmation.isConfirmed) return;
    try {
      await axios.delete(buildApiUrl(`/api/productos/eliminarp/${product.IdProducto}`));
      setProducts((current) => current.filter((item) => item.IdProducto !== product.IdProducto));
      setSelected((current) => current.filter((id) => id !== product.IdProducto));
      await showSuccessAlert("Producto eliminado", "El producto se eliminó del catálogo.");
    } catch (error) {
      console.error("Error eliminando producto:", error);
      showErrorAlert("Error", error.response?.data?.message || "No se pudo eliminar el producto");
    }
  };

  const deleteSelected = async () => {
    const confirmation = await showConfirmAlert("¿Eliminar productos seleccionados?", `Se eliminarán ${selected.length} productos del catálogo.`);
    if (!confirmation.isConfirmed) return;
    const results = await Promise.allSettled(selected.map((id) => axios.delete(buildApiUrl(`/api/productos/eliminarp/${id}`))));
    const deleted = selected.filter((_, index) => results[index].status === "fulfilled");
    setProducts((current) => current.filter((product) => !deleted.includes(product.IdProducto)));
    setSelected([]);
    if (deleted.length) await showSuccessAlert("Productos eliminados", `Se eliminaron ${deleted.length} productos.`);
    if (deleted.length !== results.length) showErrorAlert("Algunos productos no se eliminaron", "Actualiza la lista y revisa si están asociados a facturas.");
  };

  const clearFilters = () => { setSearch(""); setCategoryFilter(""); setSupplierFilter(""); setSizeFilter(""); setSelected([]); };
  const toggleAllVisible = () => setSelected((current) => allVisibleSelected ? current.filter((id) => !visibleIds.includes(id)) : [...new Set([...current, ...visibleIds])]);

  if (loading) return <div className="products-loading">Cargando productos…</div>;

  return <div className="products-page">
    <nav className="products-breadcrumb"><span>⌂</span><span>Inicio</span><b>›</b><strong>Productos</strong></nav>
    <header className="products-heading"><div className="products-title"><span className="products-title-icon"><ProductIcon size={31}/></span><div><h1>Gestión de Productos</h1><p>Administra tu inventario, precios y categorías.</p></div></div><div className="products-header-actions"><div className="products-date"><span>▦</span><div><b>{new Date().toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</b><small>{new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}</small></div></div><button className="products-new-button" onClick={openCreate}>＋ <span>Nuevo Producto</span></button></div></header>

    <section className="products-stats"><Stat icon="▦" tone="orange" label="Total Productos" value={products.length} note="en catálogo"/><Stat icon="◇" tone="purple" label="Categorías" value={categories.length || new Set(products.map((item) => item.IdCategoriaFK)).size} note="registradas"/><Stat icon="⬡" tone="blue" label="Costo unitario acumulado" value={currency(totalPurchaseValue)} note="una unidad por producto"/><Stat icon="🛒" tone="green" label="Venta unitaria estimada" value={currency(totalSaleValue)} note="suma de precios de venta"/></section>

    <section className="products-list-card"><div className="products-filters"><label className="products-search"><span>⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por referencia, descripción o proveedor..." aria-label="Buscar productos"/></label><label className="products-filter"><span>◇</span><select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} aria-label="Filtrar por categoría"><option value="">Todas las categorías</option>{categories.map((category) => <option key={category.IdCategoria} value={category.IdCategoria}>{category.NombreCategoria}</option>)}</select></label><label className="products-filter"><span>▣</span><select value={supplierFilter} onChange={(event) => setSupplierFilter(event.target.value)} aria-label="Filtrar por proveedor"><option value="">Todos los proveedores</option>{suppliers.map((supplier) => <option key={supplier.TaxId} value={supplier.TaxId}>{supplier.NombreEmpresa}</option>)}</select></label><label className="products-filter"><span>↕</span><select value={sizeFilter} onChange={(event) => setSizeFilter(event.target.value)} aria-label="Filtrar por talla"><option value="">Todas las tallas</option>{sizes.map((size) => <option key={size} value={size}>{size}</option>)}</select></label><button className="products-clear" onClick={clearFilters}>↻ <span>Limpiar</span></button></div>

    {selected.length > 0 && <div className="products-selection-bar"><strong>{selected.length} seleccionado{selected.length === 1 ? "" : "s"}</strong><button onClick={deleteSelected}>Eliminar seleccionados</button></div>}
    <div className="products-table-scroll"><table className="products-table"><thead><tr><th><input type="checkbox" checked={allVisibleSelected} onChange={toggleAllVisible} aria-label="Seleccionar todos los productos visibles"/></th><th>Imagen</th><th>Referencia</th><th>Descripción</th><th>Talla</th><th>Precio Venta</th><th>Precio Compra</th><th>Categoría</th><th>Proveedor</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>{visibleProducts.length === 0 ? <tr><td colSpan="11"><div className="products-empty"><span>⌕</span><strong>No se encontraron productos</strong><small>Ajusta los filtros o registra un producto nuevo.</small></div></td></tr> : visibleProducts.map((product) => <tr key={product.IdProducto}><td><input type="checkbox" checked={selected.includes(product.IdProducto)} onChange={() => setSelected((current) => current.includes(product.IdProducto) ? current.filter((id) => id !== product.IdProducto) : [...current, product.IdProducto])} aria-label={`Seleccionar ${product.Descripcion}`}/></td><td><span className="product-thumbnail"><ProductIcon size={22}/></span></td><td className="product-ref">{product.Referencia}</td><td className="product-description">{product.Descripcion}</td><td><span className="product-size">{product.Talla || "—"}</span></td><td className="product-sale-price">{currency(product.PrecioVenta)}</td><td className="product-cost-price">{currency(product.PrecioCompra)}</td><td><span className="product-category-pill">{product.NombreCategoria || "Sin categoría"}</span></td><td>{product.NombreProveedor || "—"}</td><td><span className="product-status"><i/>En catálogo</span></td><td><div className="product-actions"><button className="product-edit-button" onClick={() => openEdit(product)} aria-label={`Editar ${product.Descripcion}`}>✎</button><button className="product-delete-button" onClick={() => deleteProduct(product)} aria-label={`Eliminar ${product.Descripcion}`}>▤</button><div className="product-more-wrap"><button className="product-more-button" onClick={() => setOpenMenu((current) => current === product.IdProducto ? null : product.IdProducto)} aria-label="Más acciones">⋮</button>{openMenu === product.IdProducto && <div className="product-more-menu"><button onClick={() => { navigator.clipboard?.writeText(String(product.Referencia || "")); setOpenMenu(null); }}>Copiar referencia</button><button onClick={() => { openEdit(product); setOpenMenu(null); }}>Ver detalles</button></div>}</div></div></td></tr>)}</tbody></table></div>
    <div className="products-list-footer"><span>Mostrando {filteredProducts.length ? (page - 1) * PAGE_SIZE + 1 : 0} a {Math.min(page * PAGE_SIZE, filteredProducts.length)} de {filteredProducts.length} productos</span><nav className="products-pagination" aria-label="Paginación de productos"><button onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page <= 1} aria-label="Página anterior">‹</button>{Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => <button key={number} className={number === page ? "current" : ""} onClick={() => setPage(number)}>{number}</button>)}<button onClick={() => setPage((current) => Math.min(pageCount, current + 1))} disabled={page >= pageCount} aria-label="Página siguiente">›</button></nav></div>
    </section>
    {productForm && <ProductModal product={productForm} categories={categories} suppliers={suppliers} saving={saving} onChange={changeForm} onClose={() => setProductForm(null)} onSubmit={saveProduct}/>}
  </div>;
}

function Stat({ icon, tone, label, value, note }) {
  return <article className={`products-stat ${tone}`}><span className="products-stat-icon">{icon === "⬡" ? <ProductIcon size={23}/> : icon}</span><div><span>{label}</span><strong>{value}</strong><small><i>↑ +0%</i>{note}</small></div></article>;
}
