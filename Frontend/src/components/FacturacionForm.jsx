import { useEffect, useRef, useState } from "react";
import ModalCliente from "./ModalCliente";

const currency = (value) => new Intl.NumberFormat("es-CO", {
  style: "currency", currency: "COP", maximumFractionDigits: 0,
}).format(Number(value || 0));

export default function FacturacionForm(props) {
  const [mostrarTodosProductos, setMostrarTodosProductos] = useState(false);
  const [mostrarProductos, setMostrarProductos] = useState(false);
  const [mostrarClientes, setMostrarClientes] = useState(false);
  const [mostrarVendedores, setMostrarVendedores] = useState(false);
  const productoSearchRef = useRef(null);
  const clienteSearchRef = useRef(null);
  const vendedorSearchRef = useRef(null);
  const {
    cliente, nombreClienteBusqueda, setNombreClienteBusqueda, resultadosCliente,
    setResultadosCliente,
    handleBuscarCliente, seleccionarCliente, mostrarModalCliente, setMostrarModalCliente,
    vendedorNombre, vendedorTelefono, vendedores, resultadosVendedor, setResultadosVendedor,
    handleBuscarVendedor, seleccionarVendedor, mostrarModalVendedor, setMostrarModalVendedor,
    nuevoVendedor, setNuevoVendedor, guardarVendedor, busqueda, handleBuscarProducto,
    productos, handleAgregarProducto, detalle, handleCantidadChange,
    handleEliminarProducto,
    observaciones, setObservaciones, totales, handleGenerarFactura,
    condicionPago, setCondicionPago, abonoInicial, setAbonoInicial, metodoPago, setMetodoPago,
  } = props;
  const vendedorSeleccionado = vendedores.find((item) => item.Nombre === vendedorNombre);

  useEffect(() => {
    const cerrarAlHacerClickFuera = (event) => {
      if (!vendedorSearchRef.current?.contains(event.target)) {
        setMostrarVendedores(false);
        setResultadosVendedor([]);
      }
      if (!clienteSearchRef.current?.contains(event.target)) {
        setMostrarClientes(false);
        setResultadosCliente([]);
      }
      if (!productoSearchRef.current?.contains(event.target)) {
        setMostrarProductos(false);
        setMostrarTodosProductos(false);
      }
    };
    const cerrarConEscape = (event) => {
      if (event.key !== "Escape") return;
      setMostrarVendedores(false);
      setResultadosVendedor([]);
      setMostrarClientes(false);
      setResultadosCliente([]);
      setMostrarProductos(false);
      setMostrarTodosProductos(false);
    };

    document.addEventListener("pointerdown", cerrarAlHacerClickFuera);
    document.addEventListener("keydown", cerrarConEscape);
    return () => {
      document.removeEventListener("pointerdown", cerrarAlHacerClickFuera);
      document.removeEventListener("keydown", cerrarConEscape);
    };
  }, [setResultadosCliente, setResultadosVendedor]);

  return <div className="billing-page">
    <nav className="billing-breadcrumb" aria-label="Ruta de navegación">
      <span className="breadcrumb-home" aria-hidden="true">⌂</span><span>Inicio</span><b>›</b><strong>Facturación</strong>
      <span className="billing-date"><span aria-hidden="true">▦</span><span><b>{new Date().toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</b><small>{new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}</small></span></span>
    </nav>
    <header className="billing-heading"><span className="billing-heading-icon" aria-hidden="true">▤</span><div><h1>Facturación</h1><p>Registra nuevas facturas y gestiona clientes.</p></div></header>

    <section className="billing-card customer-section">
      <div className="billing-section-title"><span aria-hidden="true">♟</span><h2>1. Información del cliente</h2></div>
      <div className="billing-customer-grid">
        <div className="billing-field"><label>Vendedor</label><div className="billing-inline"><div className="billing-search-wrap" ref={vendedorSearchRef}><input value={vendedorNombre} onFocus={() => { setMostrarVendedores(true); setResultadosVendedor(vendedores); }} onChange={(event) => { setMostrarVendedores(true); handleBuscarVendedor(event.target.value); }} placeholder="Seleccionar vendedor..." aria-label="Seleccionar vendedor"/><span className="billing-chevron">⌄</span>{mostrarVendedores && resultadosVendedor.length > 0 && <ul className="billing-suggestions">{resultadosVendedor.map((item) => <li key={item.IdVendedor} onClick={() => { seleccionarVendedor(item); setMostrarVendedores(false); }}><strong>{item.Nombre}</strong><small>{item.Telefono || "Sin teléfono"}</small></li>)}</ul>}</div><button type="button" className="billing-icon-button" onClick={() => setMostrarModalVendedor(true)} aria-label="Agregar vendedor">＋</button></div><div className="billing-info-strip"><b className="strip-avatar">♟</b><span>{vendedorSeleccionado?.Nombre || "Sin vendedor seleccionado"}</span><span className="strip-spacer"/><span aria-hidden="true">☎</span><span>{vendedorTelefono || "—"}</span></div></div>
        <div className="billing-field"><label>Cliente <em>*</em></label><div className="billing-inline"><div className="billing-search-wrap" ref={clienteSearchRef}><span className="billing-input-icon">⌕</span><input value={nombreClienteBusqueda} onFocus={() => { setMostrarClientes(true); handleBuscarCliente(nombreClienteBusqueda); }} onChange={(event) => { const value = event.target.value; setNombreClienteBusqueda(value); setMostrarClientes(true); handleBuscarCliente(value); }} onKeyDown={(event) => event.key === "Enter" && handleBuscarCliente()} placeholder="Buscar cliente por nombre, documento o teléfono..." aria-label="Buscar cliente por nombre o documento"/>{mostrarClientes && resultadosCliente.length > 0 && <ul className="billing-suggestions">{resultadosCliente.map((item) => <li key={item.Documento} onClick={() => { seleccionarCliente(item); setMostrarClientes(false); }}><strong>{item.Nombre}</strong><small>{item.Documento} · {item.Telefono || "Sin teléfono"}</small></li>)}</ul>}</div>{!cliente && <button type="button" className="billing-button green" onClick={() => setMostrarModalCliente(true)}>＋ <span>Nuevo cliente</span></button>}</div><div className="billing-info-strip customer-info"><b className="strip-avatar">{cliente ? "✓" : "●"}</b><strong>{cliente?.Nombre || "Sin cliente seleccionado"}</strong><span className="strip-spacer"/><span aria-hidden="true">▦</span><span>Documento</span><b>{cliente?.Documento || "—"}</b><i/><span aria-hidden="true">☎</span><span>Teléfono</span><b>{cliente?.Telefono || "—"}</b><i/><span aria-hidden="true">✉</span><span>Email</span><b>{cliente?.Correo || "—"}</b></div></div>
      </div>
    </section>

    <section className="billing-card products-section">
      <div className="billing-section-header"><div className="billing-section-title"><span aria-hidden="true">⬡</span><h2>2. Productos y servicios</h2></div><div className="billing-product-actions"><div className="billing-search-wrap" ref={productoSearchRef}><span className="billing-input-icon">⌕</span><input value={busqueda} onFocus={() => { setMostrarProductos(true); setMostrarTodosProductos(true); }} onChange={(event) => { handleBuscarProducto(event.target.value); setMostrarProductos(true); setMostrarTodosProductos(false); }} placeholder="Buscar producto por nombre o código..." aria-label="Buscar producto"/>{mostrarProductos && (busqueda || mostrarTodosProductos) && <ul className="billing-suggestions">{productos.filter((product) => !busqueda || `${product.Descripcion || ""} ${product.Referencia || ""} ${product.Talla || ""}`.toLowerCase().includes(busqueda.toLowerCase())).slice(0, 8).map((product) => <li key={product.IdProducto} onClick={() => { handleAgregarProducto(product.IdProducto); setMostrarProductos(false); setMostrarTodosProductos(false); }}><strong>{product.Descripcion || product.Referencia}</strong><small>Talla: {product.Talla || "Única"} · Ref. {product.Referencia || "—"} · {currency(product.PrecioVenta)}</small></li>)}</ul>}</div><button type="button" className="billing-button blue" onClick={() => { setMostrarTodosProductos((value) => !value); setMostrarProductos(true); }}>＋ <span>Agregar producto</span></button></div></div>
      <div className="billing-table-wrap"><table className="billing-table"><thead><tr><th>#</th><th>Producto</th><th>Precio unitario</th><th>Cantidad</th><th>Total</th><th>Acción</th></tr></thead><tbody>{detalle.length === 0 ? <tr><td colSpan="6"><div className="billing-empty"><span aria-hidden="true">📦</span><strong>No hay productos agregados</strong><small>Busca un producto y agrégalo a la factura.</small></div></td></tr> : detalle.map((item, index) => <tr key={item.IdProducto}><td>{index + 1}</td><td><strong>{item.Descripcion}</strong><small className="product-reference">{productos.find((product) => product.IdProducto === item.IdProducto)?.Referencia || ""}</small></td><td>{currency(item.PrecioVenta)}</td><td><input className="billing-number" type="number" min="1" value={item.Cantidad} onChange={(event) => handleCantidadChange(item.IdProducto, event.target.value)} aria-label={`Cantidad de ${item.Descripcion}`}/></td><td className="billing-total-cell">{currency(item.Total)}</td><td><button type="button" className="billing-remove" onClick={() => handleEliminarProducto(item.IdProducto)} aria-label={`Eliminar ${item.Descripcion}`}>×</button></td></tr>)}</tbody></table></div>
      <div className="billing-mobile-items">{detalle.length === 0 ? <div className="billing-empty"><span aria-hidden="true">📦</span><strong>No hay productos agregados</strong><small>Busca un producto y agrégalo a la factura.</small></div> : detalle.map((item) => <article className="billing-mobile-item" key={item.IdProducto}><div><strong>{item.Descripcion}</strong><span>{currency(item.PrecioVenta)} c/u</span></div><button type="button" className="billing-remove" onClick={() => handleEliminarProducto(item.IdProducto)} aria-label="Eliminar producto">×</button><label>Cantidad<input className="billing-number" type="number" min="1" value={item.Cantidad} onChange={(event) => handleCantidadChange(item.IdProducto, event.target.value)}/></label><strong className="mobile-line-total">{currency(item.Total)}</strong></article>)}</div>
    </section>

    <section className="billing-bottom-grid"><article className="billing-card payment-section"><div className="billing-section-title"><span aria-hidden="true">▣</span><h2>3. Pago y observaciones</h2></div><div className="payment-fields"><label className="billing-field"><span>Condición de pago</span><select value={condicionPago} onChange={(event) => setCondicionPago(event.target.value)}><option value="Contado">Contado</option><option value="Credito30Dias">Crédito a 30 días</option></select></label>{condicionPago === "Contado" ? <label className="billing-field"><span>Medio de pago</span><select value={metodoPago} onChange={(event) => setMetodoPago(event.target.value)}><option>Efectivo</option><option>Transferencia</option></select></label> : <div className="billing-field"><label>Abono inicial (opcional)</label><div className="payment-fields"><input className="billing-number" type="number" min="0" max={totales.total} step="0.01" value={abonoInicial} onChange={(event) => setAbonoInicial(event.target.value)} placeholder="0"/><select aria-label="Medio de pago del abono inicial" value={metodoPago} onChange={(event) => setMetodoPago(event.target.value)}><option>Efectivo</option><option>Transferencia</option></select></div></div>}<label className="billing-field"><span>Observaciones (opcional)</span><textarea maxLength={500} value={observaciones} onChange={(event) => setObservaciones(event.target.value)} placeholder="Agregar observaciones de la factura..."/></label></div></article><article className="billing-card totals-card"><div className="totals-calculator" aria-hidden="true">▦</div><div className="totals-lines"><div><span>Subtotal:</span><strong>{currency(totales.subtotal)}</strong></div><div className="grand-total"><b>Total:</b><strong>{currency(totales.total)}</strong></div></div></article></section>
    <button type="button" onClick={handleGenerarFactura} className="billing-submit"><span aria-hidden="true">▤</span> Generar factura</button>

    {mostrarModalCliente && <ModalCliente onClose={() => setMostrarModalCliente(false)} onClienteCreado={(nuevoCliente) => { seleccionarCliente(nuevoCliente); setMostrarModalCliente(false); }}/ >}
    {mostrarModalVendedor && <div className="billing-modal-overlay"><div className="billing-modal"><h2>Registrar vendedor</h2><label>Nombre<input value={nuevoVendedor.Nombre} onChange={(event) => setNuevoVendedor((current) => ({ ...current, Nombre: event.target.value }))} placeholder="Nombre del vendedor"/></label><label>Teléfono<input value={nuevoVendedor.Telefono} onChange={(event) => setNuevoVendedor((current) => ({ ...current, Telefono: event.target.value }))} placeholder="Teléfono"/></label><button type="button" className="billing-button blue" onClick={guardarVendedor}>Guardar vendedor</button><button type="button" className="billing-modal-cancel" onClick={() => setMostrarModalVendedor(false)}>Cancelar</button></div></div>}
  </div>;
}
