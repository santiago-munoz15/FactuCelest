const escapeHtml = (value = "") => String(value)
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#39;");

const money = (value) => new Intl.NumberFormat("es-CO", {
  style: "currency", currency: "COP", maximumFractionDigits: 0,
}).format(Number(value || 0));

const date = (value) => {
  if (!value) return "—";
  const text = String(value).slice(0, 10);
  const parts = text.split("-");
  if (parts.length === 3) {
    return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])).toLocaleDateString("es-CO");
  }
  return new Date(value).toLocaleDateString("es-CO");
};

export function printPaymentInvoice(windowRef, invoice, payments = [], summary = {}) {
  const paid = Number(summary.MontoPagado ?? payments.reduce((sum, item) => sum + Number(item.Monto || 0), 0));
  const total = Number(invoice.Total || 0);
  const balance = Math.max(0, Number(summary.Saldo ?? total - paid));
  const status = summary.Estado || (balance <= 0 ? "Pagada" : paid > 0 ? "Abonada" : "Pendiente");
  const details = invoice.Detalle || [];

  const rows = details.map((item) => `<tr>
    <td>${escapeHtml(item.Referencia || item.IdProductoFK || "")}</td>
    <td>${escapeHtml(item.Descripcion || "Producto")}${item.Talla ? ` · ${escapeHtml(item.Talla)}` : ""}</td>
    <td class="number">${Number(item.Cantidad || 0)}</td>
    <td class="number">${money(item.PrecioUnitario)}</td>
    <td class="number">${money(item.Subtotal)}</td>
  </tr>`).join("");

  const paymentRows = payments.length
    ? payments.map((item) => `<tr><td>${date(item.FechaPago)}</td><td>${escapeHtml(item.Pagador || invoice.NombreCliente || "—")}</td><td>${escapeHtml(item.MetodoPago || "—")}</td><td>${escapeHtml(item.Observaciones || "—")}</td><td class="number">${money(item.Monto)}</td></tr>`).join("")
    : '<tr><td colspan="5" class="empty">Sin abonos registrados</td></tr>';

  const document = `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Factura ${escapeHtml(invoice.IdFactura)}</title>
  <style>
    @page{size:A4;margin:16mm}*{box-sizing:border-box}body{font:12px Arial,sans-serif;color:#172b42;margin:0}h1{font-size:24px;margin:0 0 5px}h2{font-size:14px;margin:22px 0 9px;color:#123b63}.muted{color:#62758a}.top{display:flex;justify-content:space-between;border-bottom:2px solid #147fc5;padding-bottom:14px}.brand{font-size:19px;font-weight:800;color:#087bb4}.meta{text-align:right;line-height:1.6}.grid{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-top:18px}.box{padding:12px;border:1px solid #dce5ed;border-radius:6px;line-height:1.65}.box b{display:block;margin-bottom:3px;color:#365673}table{width:100%;border-collapse:collapse;margin-top:8px}th{background:#f0f5fa;text-align:left;color:#405972}th,td{padding:8px 7px;border-bottom:1px solid #e4eaf0;vertical-align:top}.number{text-align:right;white-space:nowrap}.totals{width:290px;margin:12px 0 0 auto}.totals td{border:0;padding:4px 7px}.totals tr:last-child{border-top:2px solid #d7e3ed;font-size:16px;font-weight:800}.status{display:inline-block;padding:5px 9px;border-radius:12px;background:#e7f7ee;color:#087749;font-weight:700}.balance{font-size:16px;font-weight:800;color:${balance > 0 ? "#b45309" : "#087749"}}.empty{text-align:center;color:#75869a;padding:16px}.footer{margin-top:24px;border-top:1px solid #e3eaf0;padding-top:10px;color:#718195;text-align:center;font-size:10px}@media print{body{print-color-adjust:exact;-webkit-print-color-adjust:exact}}
  </style></head><body>
    <div class="top"><div><div class="brand">FactuCelest</div><div class="muted">Comprobante de venta y estado de cuenta</div></div><div class="meta"><h1>Factura #${escapeHtml(invoice.IdFactura)}</h1><div>Fecha: ${date(invoice.Fecha)}</div><div>Vencimiento: ${date(summary.FechaVencimiento || invoice.FechaVencimiento)}</div><div>Condición: ${escapeHtml(invoice.CondicionPago === "Contado" ? "Contado" : invoice.CondicionPago === "Credito30Dias" ? "Crédito a 30 días" : "No especificada")}</div><div>Estado: <span class="status">${escapeHtml(status)}</span></div></div></div>
    <div class="grid"><div class="box"><b>Cliente</b>${escapeHtml(invoice.NombreCliente || "—")}<br>${escapeHtml(invoice.TipoDocumentoCliente || "CC")}: ${escapeHtml(invoice.DocumentoCliente || "—")}<br>Dirección: ${escapeHtml(invoice.DireccionCliente || "—")}<br>Departamento: ${escapeHtml(invoice.DepartamentoCliente || "—")}<br>Ciudad: ${escapeHtml(invoice.CiudadCliente || "—")}<br>Teléfono: ${escapeHtml(invoice.TelefonoCliente || "—")}<br>Correo: ${escapeHtml(invoice.CorreoCliente || "—")}</div><div class="box"><b>Emisor</b>INTIMAS CELESTE<br>NIT: 4268675-2<br>Medellín · 3174668696<br>Vendedor: ${escapeHtml(invoice.NombreVendedor || "—")}</div></div>
    <h2>Detalle de la factura</h2><table><thead><tr><th>Referencia</th><th>Descripción</th><th class="number">Cant.</th><th class="number">Precio unitario</th><th class="number">Total</th></tr></thead><tbody>${rows || '<tr><td colspan="5" class="empty">La factura no tiene productos.</td></tr>'}</tbody></table>
    <table class="totals"><tr><td>Subtotal</td><td class="number">${money(invoice.Subtotal)}</td></tr><tr><td>Total factura</td><td class="number">${money(total)}</td></tr><tr><td>Total abonado</td><td class="number">${money(paid)}</td></tr><tr><td>Saldo pendiente</td><td class="number balance">${money(balance)}</td></tr></table>
    <h2>Historial de abonos</h2><table><thead><tr><th>Fecha</th><th>Pagador</th><th>Medio</th><th>Observaciones</th><th class="number">Valor</th></tr></thead><tbody>${paymentRows}</tbody></table>
    ${invoice.Observaciones ? `<p><b>Observaciones de factura:</b> ${escapeHtml(invoice.Observaciones)}</p>` : ""}
    <div class="footer">Documento generado desde FactuCelest. El saldo refleja los abonos registrados en el sistema.</div>
    <script>window.onload=()=>setTimeout(()=>window.print(),250);window.onafterprint=()=>window.close();</script>
  </body></html>`;

  windowRef.document.open();
  windowRef.document.write(document);
  windowRef.document.close();
}
