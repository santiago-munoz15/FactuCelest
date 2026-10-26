import { jsPDF } from "jspdf";

const money = (value) => new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
}).format(Number(value || 0));

const date = (value) => value
  ? new Date(value).toLocaleDateString("es-CO")
  : new Date().toLocaleDateString("es-CO");

const cleanFilePart = (value) => String(value || "")
  .normalize("NFKC")
  .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "")
  .replace(/\s+/g, " ")
  .trim()
  .replace(/[. ]+$/g, "");

export function downloadInvoicePdf(invoice) {
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = 15;

  const sectionTitle = (title) => {
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.setTextColor(15, 118, 110);
    pdf.text(title.toUpperCase(), margin, y);
    y += 6;
    pdf.setTextColor(31, 41, 55);
  };

  const drawTableHeader = () => {
    const top = y;
    pdf.setFillColor(235, 248, 248);
    pdf.rect(margin, top, contentWidth, 8, "F");
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);
    pdf.text("Referencia", margin + 2, top + 5.3);
    pdf.text("Producto", margin + 29, top + 5.3);
    pdf.text("Cant.", margin + 116, top + 5.3, { align: "right" });
    pdf.text("Precio", margin + 149, top + 5.3, { align: "right" });
    pdf.text("Total", pageWidth - margin - 2, top + 5.3, { align: "right" });
    y += 8;
  };

  const addPage = (repeatTableHeader = true) => {
    pdf.addPage();
    y = 15;
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.setTextColor(15, 118, 110);
    pdf.text("Factura #" + invoice.IdFactura, margin, y);
    y += 9;
    if (repeatTableHeader) drawTableHeader();
  };

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(19);
  pdf.setTextColor(15, 118, 110);
  pdf.text("FactuCelest", margin, y + 2);
  pdf.setFontSize(10);
  pdf.setTextColor(31, 41, 55);
  pdf.text("Factura #" + invoice.IdFactura, pageWidth - margin, y, { align: "right" });
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.text("Fecha: " + date(invoice.Fecha), pageWidth - margin, y + 5, { align: "right" });
  pdf.text("Condición: " + (invoice.CondicionPago === "Contado" ? "Contado" : "Crédito a 30 días"), pageWidth - margin, y + 10, { align: "right" });
  y += 18;
  pdf.setDrawColor(15, 118, 110);
  pdf.setLineWidth(0.7);
  pdf.line(margin, y, pageWidth - margin, y);
  y += 8;

  sectionTitle("Datos del cliente");
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  const clientLines = [
    invoice.NombreCliente || "Cliente",
    (invoice.TipoDocumentoCliente || "Documento") + ": " + (invoice.DocumentoCliente || "—"),
    "Teléfono: " + (invoice.TelefonoCliente || "—"),
    "Correo: " + (invoice.CorreoCliente || "—"),
    "Ciudad: " + ([invoice.CiudadCliente, invoice.DepartamentoCliente].filter(Boolean).join(", ") || "—"),
  ];
  clientLines.forEach((line) => {
    pdf.text(pdf.splitTextToSize(String(line), contentWidth), margin, y);
    y += 5;
  });
  y += 3;

  sectionTitle("Detalle de la factura");
  drawTableHeader();
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  (invoice.Detalle || []).forEach((item) => {
    const description = (item.Descripcion || "Producto") + (item.Talla ? " · Talla " + item.Talla : "");
    const descriptionLines = pdf.splitTextToSize(description, 82);
    const rowHeight = Math.max(8, descriptionLines.length * 4 + 3);
    if (y + rowHeight > pageHeight - 35) addPage();
    pdf.setDrawColor(225, 232, 238);
    pdf.line(margin, y + rowHeight, pageWidth - margin, y + rowHeight);
    pdf.text(String(item.Referencia || item.IdProducto || "—"), margin + 2, y + 5);
    pdf.text(descriptionLines, margin + 29, y + 5);
    pdf.text(String(Number(item.Cantidad || 0)), margin + 116, y + 5, { align: "right" });
    pdf.text(money(item.PrecioUnitario ?? item.PrecioVenta), margin + 149, y + 5, { align: "right" });
    pdf.text(money(item.Total ?? item.Subtotal), pageWidth - margin - 2, y + 5, { align: "right" });
    y += rowHeight;
  });
  if (!(invoice.Detalle || []).length) {
    pdf.setFont("helvetica", "italic");
    pdf.text("No hay productos registrados en esta factura.", margin + 2, y + 6);
    y += 12;
  }

  const totalsHeight = 32 + (invoice.Observaciones ? 18 : 0);
  if (y + totalsHeight > pageHeight - 18) addPage(false);
  y += 5;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.text("Subtotal", pageWidth - margin - 48, y);
  pdf.text(money(invoice.Subtotal), pageWidth - margin, y, { align: "right" });
  y += 6;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.text("Total", pageWidth - margin - 48, y);
  pdf.text(money(invoice.Total), pageWidth - margin, y, { align: "right" });
  y += 7;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.text("Abono inicial", pageWidth - margin - 48, y);
  pdf.text(money(invoice.MontoPagado), pageWidth - margin, y, { align: "right" });
  y += 12;
  if (invoice.Observaciones) {
    sectionTitle("Observaciones");
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.text(pdf.splitTextToSize(String(invoice.Observaciones), contentWidth), margin, y);
  }

  const footerY = pageHeight - 10;
  const pageCount = pdf.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    pdf.setPage(page);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(115, 129, 145);
    pdf.text("Documento generado por FactuCelest", pageWidth / 2, footerY, { align: "center" });
  }

  const fileName = cleanFilePart(invoice.IdFactura) + "-" + (cleanFilePart(invoice.NombreCliente) || "Cliente") + ".pdf";
  pdf.save(fileName);
}
