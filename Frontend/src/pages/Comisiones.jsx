import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { buildApiUrl } from "../config/api";

const currency = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});
const formatCurrency = (value) => currency.format(Number(value || 0));
const formatDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("es-CO", {
    day: "2-digit", month: "short", year: "numeric",
  });
};
const obtenerMesActual = () => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
};

export default function Comisiones() {
  const [vendedores, setVendedores] = useState([]);
  const [vendedor, setVendedor] = useState("");
  const [mes, setMes] = useState(obtenerMesActual);
  const [consulta, setConsulta] = useState(null);
  const [facturas, setFacturas] = useState([]);
  const [cargandoVendedores, setCargandoVendedores] = useState(true);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let vigente = true;
    axios.get(buildApiUrl("/api/vendedores"))
      .then((response) => {
        if (!vigente) return;
        const lista = response.data.vendedores || [];
        setVendedores(lista);
      })
      .catch((requestError) => {
        if (vigente) setError(requestError.response?.data?.error || "No se pudieron cargar los vendedores.");
      })
      .finally(() => { if (vigente) setCargandoVendedores(false); });
    return () => { vigente = false; };
  }, []);

  const vendedorConsultado = useMemo(
    () => vendedores.find((item) => item.Nombre === consulta?.vendedor),
    [vendedores, consulta],
  );
  const totalVentas = useMemo(
    () => facturas.reduce((total, factura) => total + Number(factura.Total || 0), 0),
    [facturas],
  );
  const comision = Math.round(totalVentas * 0.06);
  const mesLegible = consulta?.mes
    ? new Date(`${consulta.mes}-01T12:00:00`).toLocaleDateString("es-CO", { month: "long", year: "numeric" })
    : "";

  const consultarComision = async (event) => {
    event.preventDefault();
    if (!vendedor || !mes) {
      setError("Selecciona un vendedor y un mes para calcular la comisión.");
      return;
    }
    setCargando(true);
    setError("");
    const [year, month] = mes.split("-").map(Number);
    const desde = `${mes}-01`;
    const hasta = `${year}-${String(month).padStart(2, "0")}-${String(new Date(year, month, 0).getDate()).padStart(2, "0")}`;
    const params = new URLSearchParams({ periodo: "rango", desde, hasta, vendedor });
    try {
      const response = await axios.get(buildApiUrl(`/api/facturas/reporte?${params.toString()}`));
      if (!response.data.success) throw new Error(response.data.error || "No se pudo consultar la comisión.");
      setFacturas(response.data.facturas || []);
      setConsulta({ vendedor, mes });
    } catch (requestError) {
      setError(requestError.response?.data?.error || requestError.message || "No se pudo consultar la comisión.");
      setFacturas([]);
      setConsulta(null);
    } finally {
      setCargando(false);
    }
  };

  const exportar = () => {
    if (!consulta || !facturas.length) return;
    const rows = [
      ["Vendedor", "Mes", "Factura", "Fecha", "Cliente", "Documento", "Total factura", "Comisión 6%"],
      ...facturas.map((factura) => [
        consulta.vendedor, mesLegible, factura.IdFactura, formatDate(factura.Fecha),
        factura.NombreCliente, factura.DocumentoCliente, factura.Total,
        Number(factura.Total || 0) * 0.06,
      ]),
      [],
      ["Total ventas", totalVentas],
      ["Comisión total (6%)", comision],
    ];
    const quote = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
    const content = rows.map((row) => row.map(quote).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob(["\ufeff", content], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `comisiones_${consulta.vendedor.replace(/[^a-z0-9]+/gi, "_")}_${consulta.mes}.csv`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return <div className="commissions-page">
    <header className="commissions-heading">
      <div><span className="commissions-heading-icon">%</span><div><h1>Comisiones</h1><p>Consulta las ventas mensuales y calcula la comisión del vendedor.</p></div></div>
      <button type="button" onClick={exportar} disabled={!facturas.length}>Exportar reporte</button>
    </header>

    <form className="commissions-filters" onSubmit={consultarComision}>
      <label>Vendedor<select value={vendedor} onChange={(event) => setVendedor(event.target.value)} disabled={cargandoVendedores} required>
        <option value="">{cargandoVendedores ? "Cargando vendedores..." : "Selecciona un vendedor"}</option>
        {vendedores.map((item) => <option key={item.IdVendedor} value={item.Nombre}>{item.Nombre}</option>)}
      </select></label>
      <label>Mes de ventas<input type="month" value={mes} onChange={(event) => setMes(event.target.value)} required/></label>
      <button type="submit" disabled={cargando || cargandoVendedores}>{cargando ? "Calculando..." : "Consultar comisión"}</button>
    </form>

    {error && <p className="commissions-error" role="alert">{error}</p>}

    {consulta && <>
      <section className="commissions-summary" aria-label="Resumen de comisión">
        <article><span>Vendedor</span><strong>{vendedorConsultado?.Nombre || consulta.vendedor}</strong><small>{mesLegible}</small></article>
        <article><span>Facturas del mes</span><strong>{facturas.length}</strong><small>Ventas registradas</small></article>
        <article><span>Total de ventas</span><strong>{formatCurrency(totalVentas)}</strong><small>Valor total facturado</small></article>
        <article className="commission-highlight"><span>Comisión (6%)</span><strong>{formatCurrency(comision)}</strong><small>6% del total de ventas del mes</small></article>
      </section>

      <section className="commissions-results">
        <div className="commissions-results-heading"><div><h2>Facturas del vendedor</h2><p>{consulta.vendedor} · {mesLegible}</p></div><span>{facturas.length} registro{facturas.length === 1 ? "" : "s"}</span></div>
        <div className="commissions-table-scroll"><table><thead><tr><th>#</th><th>Factura</th><th>Fecha</th><th>Cliente</th><th>Documento</th><th>Total</th><th>Comisión atribuida (6%)</th></tr></thead>
          <tbody>{facturas.length ? facturas.map((factura, index) => <tr key={factura.IdFactura}>
            <td>{index + 1}</td><td><strong>#{factura.IdFactura}</strong></td><td>{formatDate(factura.Fecha)}</td>
            <td>{factura.NombreCliente || "—"}</td><td>{factura.DocumentoCliente || "—"}</td>
            <td>{formatCurrency(factura.Total)}</td><td>{formatCurrency(Number(factura.Total || 0) * 0.06)}</td>
          </tr>) : <tr><td colSpan="7" className="commissions-empty">Este vendedor no tiene facturas en el mes seleccionado.</td></tr>}</tbody>
          {facturas.length > 0 && <tfoot><tr><td colSpan="5">Total del mes · Comisión calculada sobre el total acumulado</td><td>{formatCurrency(totalVentas)}</td><td>{formatCurrency(comision)}</td></tr></tfoot>}
        </table></div>
      </section>
    </>}

    {!consulta && !error && <div className="commissions-empty-state"><span>％</span><strong>Selecciona un vendedor y un mes</strong><p>Verás aquí sus facturas, el total vendido y la comisión correspondiente al 6%.</p></div>}
  </div>;
}
