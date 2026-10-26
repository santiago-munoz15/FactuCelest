import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  showSuccessAlert,
  showErrorAlert,
  showInfoAlert,
  showConfirmAlert,
} from "../utils/sweetAlertHelper";
import FacturacionForm from "../components/FacturacionForm";
import { buildApiUrl } from "../config/api";
import { downloadInvoicePdf } from "../utils/downloadInvoicePdf";

const formatearMoneda = (valor) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(valor || 0));

const escaparHtml = (texto = "") =>
  String(texto)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const DATOS_EMPRESA = {
  Nombre: "INTIMAS CELESTE",
  Nit: "4268675-2",
  Ciudad: "Medellin",
  Telefono: "3174668696",
};

export default function Facturacion() {
  const [nombreClienteBusqueda, setNombreClienteBusqueda] = useState("");
  const [cliente, setCliente] = useState(null);
  const [vendedorNombre, setVendedorNombre] = useState("");
  const [vendedorTelefono, setVendedorTelefono] = useState("");
  const [vendedorId, setVendedorId] = useState(null);
  const [vendedores, setVendedores] = useState([]);
  const [mostrarModalVendedor, setMostrarModalVendedor] = useState(false);
  const [nuevoVendedor, setNuevoVendedor] = useState({
    Nombre: "",
    Telefono: "",
  });
  const [productos, setProductos] = useState([]);
  const [detalle, setDetalle] = useState([]);
  const [mostrarModalCliente, setMostrarModalCliente] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [resultadosBusqueda, setResultadosBusqueda] = useState([]);
  const [resultadosCliente, setResultadosCliente] = useState([]);
  const [resultadosVendedor, setResultadosVendedor] = useState([]);
  const [metodoPago, setMetodoPago] = useState("Efectivo");
  const [condicionPago, setCondicionPago] = useState("Credito30Dias");
  const [abonoInicial, setAbonoInicial] = useState("");
  const [observaciones, setObservaciones] = useState("");

  const [totales, setTotales] = useState({
    subtotal: 0,
    total: 0,
  });

  // ðŸ”¹ Cargar productos al iniciar
  useEffect(() => {
    axios
      .get(buildApiUrl("/api/productos/listarp"))
      .then((res) => setProductos(res.data))
      .catch((err) => console.error("Error cargando productos:", err));
  }, []);

  // ðŸ”¹ Cargar vendedores desde la base de datos
  useEffect(() => {
    axios
      .get(buildApiUrl("/api/vendedores"))
      .then((res) => {
        if (res.data.success) {
          setVendedores(res.data.vendedores || []);
        }
      })
      .catch((error) => {
        console.error("Error cargando vendedores:", error);
      });
  }, []);

  const handleBuscarProducto = (texto) => {
    setBusqueda(texto);
    if (texto.trim() === "") {
      setResultadosBusqueda([]);
      return;
    }

    const resultados = productos.filter((p) =>
      `${p.Descripcion || ""} ${p.Referencia || ""}`.toLowerCase().includes(texto.toLowerCase())
    );
    setResultadosBusqueda(resultados);
  };

  const handleBuscarVendedor = (texto) => {
    setVendedorNombre(texto);
    setVendedorId(null);

    if (texto.trim() === "") {
      setResultadosVendedor(vendedores);
      setVendedorTelefono("");
      return;
    }

    const coincidencias = vendedores.filter((vendedor) =>
      vendedor.Nombre.toLowerCase().includes(texto.toLowerCase())
    );

    setResultadosVendedor(coincidencias);

    if (coincidencias.length === 1 && coincidencias[0].Nombre.toLowerCase() === texto.toLowerCase()) {
      setVendedorTelefono(coincidencias[0].Telefono || "");
    }
  };

  const seleccionarVendedor = (vendedor) => {
    setVendedorNombre(vendedor.Nombre);
    setVendedorTelefono(vendedor.Telefono || "");
    setVendedorId(vendedor.IdVendedor || null);
    setResultadosVendedor([]);
  };

  const guardarVendedor = async () => {
    const nombre = nuevoVendedor.Nombre.trim();
    const telefono = nuevoVendedor.Telefono.trim();

    if (!nombre || !telefono) {
      showErrorAlert(
        "Campos incompletos",
        "Debes ingresar el nombre y el teléfono del vendedor"
      );
      return;
    }

    const existe = vendedores.some(
      (vendedor) => vendedor.Nombre.toLowerCase() === nombre.toLowerCase()
    );

    if (existe) {
      showInfoAlert(
        "Vendedor duplicado",
        "Ya existe un vendedor con ese nombre. Puedes buscarlo en el listado."
      );
      return;
    }

    try {
      const res = await axios.post(buildApiUrl("/api/vendedores"), {
        Nombre: nombre,
        Telefono: telefono,
      });

      if (res.data.success) {
        const vendedorCreado = res.data.vendedor;
        setVendedores((actual) => {
          const existe = actual.some(
            (item) =>
              String(item.IdVendedor ?? "") === String(vendedorCreado.IdVendedor ?? "") ||
              item.Nombre.toLowerCase() === vendedorCreado.Nombre.toLowerCase()
          );

          const siguienteLista = existe ? actual : [...actual, vendedorCreado];

          return siguienteLista.sort((a, b) => a.Nombre.localeCompare(b.Nombre));
        });
        setVendedorNombre(vendedorCreado.Nombre);
        setVendedorTelefono(vendedorCreado.Telefono || "");
        setVendedorId(vendedorCreado.IdVendedor || null);
        setResultadosVendedor([]);
        setMostrarModalVendedor(false);
        setNuevoVendedor({ Nombre: "", Telefono: "" });
        await showSuccessAlert(
          "Vendedor agregado",
          `${vendedorCreado.Nombre} quedó disponible para facturar`
        );
      } else {
        showErrorAlert("Error", res.data.error || "No se pudo registrar el vendedor");
      }
    } catch (error) {
      console.error("Error registrando vendedor:", error);
      showErrorAlert("Error", "No se pudo registrar el vendedor");
    }
  };

  // ðŸ”¹ Buscar cliente
  const handleBuscarCliente = async (textoBusqueda = nombreClienteBusqueda) => {
    const termino = textoBusqueda.trim();

    if (!termino) {
      try {
        const res = await axios.get(buildApiUrl("/api/clientes/listar"));
        setResultadosCliente(res.data.success ? res.data.clientes || [] : []);
      } catch (error) {
        console.error("Error cargando clientes:", error);
        setResultadosCliente([]);
      }
      return;
    }

    try {
      const res = await axios.get(/^[0-9]+$/.test(termino)
        ? buildApiUrl(`/api/clientes/buscar/${encodeURIComponent(termino)}`)
        : buildApiUrl(`/api/clientes/buscar?nombre=${encodeURIComponent(termino)}`));

      if (res.data.success) {
        const clientes = Array.isArray(res.data.data) ? res.data.data : [res.data.data];
        setResultadosCliente(clientes);
      } else {
        setResultadosCliente([]);
        setCliente(null);
      }
    } catch (error) {
      console.error("Error buscando cliente:", error);
      if (error.response?.status !== 404) {
        showErrorAlert("Error", "Cliente no encontrado o error de conexión");
      }
      setCliente(null);
      setResultadosCliente([]);
    }
  };

  const seleccionarCliente = (clienteSeleccionado) => {
    setCliente(clienteSeleccionado);
    setNombreClienteBusqueda(clienteSeleccionado.Nombre || "");
    setResultadosCliente([]);
  };

  // ðŸ”¹ Agregar producto al detalle
  const handleAgregarProducto = (id) => {
    const prod = productos.find((p) => p.IdProducto === parseInt(id));
    if (!prod) return;

    const existe = detalle.find((d) => d.IdProducto === prod.IdProducto);
    if (existe) {
      showInfoAlert("Producto duplicado", "Este producto ya está agregado");
      return;
    }

    setDetalle([
      ...detalle,
      {
        IdProducto: prod.IdProducto,
        Descripcion: prod.Descripcion,
        Talla: prod.Talla,
        PrecioVenta: prod.PrecioVenta,
        Cantidad: 1,
        Total: prod.PrecioVenta,
      },
    ]);
    setBusqueda("");
    setResultadosBusqueda([]);
  };

  // ðŸ”¹ Cambiar cantidad
  const handleCantidadChange = (id, cantidad) => {
    const cantidadSegura = Math.max(1, parseInt(cantidad, 10) || 1);
    const actualizado = detalle.map((item) =>
      item.IdProducto === id
        ? {
            ...item,
            Cantidad: cantidadSegura,
            Total: cantidadSegura * item.PrecioVenta,
          }
        : item
    );
    setDetalle(actualizado);
  };

  // ðŸ”¹ Calcular totales
  useEffect(() => {
    const subtotal = detalle.reduce((acc, p) => acc + Number(p.Total || 0), 0);
    setTotales({ subtotal, total: subtotal });
  }, [detalle]);

  // ðŸ”¹ Eliminar producto del detalle
  const handleEliminarProducto = (id) => {
    setDetalle(detalle.filter((item) => item.IdProducto !== id));
  };

  const descargarFacturaPdf = async (idFactura) => {
    try {
      const res = await axios.get(buildApiUrl(`/api/facturas/detalle/${idFactura}`));
      if (!res.data.success || !res.data.factura) {
        showErrorAlert("Factura guardada", "No fue posible preparar el PDF de la factura.");
        return false;
      }
      downloadInvoicePdf(res.data.factura);
      return true;
    } catch (error) {
      console.error("Error descargando PDF de la factura:", error);
      showErrorAlert("Factura guardada", "La factura se guardó, pero no fue posible descargar el PDF.");
      return false;
    }
  };

  const guardarFactura = async () => {
    try {
      const facturaData = {
        DocumentoCliente: cliente.Documento,
        Subtotal: totales.subtotal,
        Total: totales.total,
        CondicionPago: condicionPago,
        AbonoInicial: condicionPago === "Contado" ? totales.total : Number(abonoInicial || 0),
        MetodoAbono: metodoPago,
        MetodoPago: condicionPago === "Contado" || Number(abonoInicial) > 0 ? metodoPago : "Crédito 30 días",
        Observaciones: observaciones.trim() || null,
        NombreVendedor: vendedorNombre,
        TelefonoVendedor: vendedorTelefono,
        IdVendedor: vendedorId,
        Detalle: detalle, // Enviar productos
      };

      console.log("ðŸ“¤ Enviando factura:", facturaData);

      const res = await axios.post(buildApiUrl("/api/facturas/crear"), facturaData);

      console.log("ðŸ“¥ Respuesta del servidor:", res.data);

      if (res.data.success) {
        await showSuccessAlert(
          "¡Factura creada!",
          `Factura #${res.data.IdFactura} registrada correctamente`
        );
        return { success: true, IdFactura: res.data.IdFactura };
      } else {
        showErrorAlert(
          "Error",
          res.data.error || "No se pudo guardar la factura"
        );
        return { success: false };
      }
    } catch (error) {
      console.error("âŒ Error guardando factura:", error);
      showErrorAlert(
        "Error",
        error.response?.data?.error || "No se pudo guardar la factura"
      );
      return { success: false };
    }
  };

  // ðŸ”¹ Generar factura (verifica y llama guardarFactura)
  const handleGenerarFactura = async () => {
    if (!cliente) {
      showErrorAlert(
        "Cliente requerido",
        "Debes seleccionar o registrar un cliente"
      );
      return;
    }

    if (!vendedorNombre.trim()) {
      showErrorAlert(
        "Vendedor requerido",
        "Debes seleccionar o registrar un vendedor"
      );
      return;
    }

    if (detalle.length === 0) {
      showErrorAlert("Sin productos", "Debes agregar al menos un producto");
      return;
    }

    const confirmacion = await showConfirmAlert(
      "Confirmar factura",
      "¿Deseas guardar y generar esta factura?"
    );
    if (!confirmacion.isConfirmed) return;

    const guardada = await guardarFactura();

    if (guardada?.success) {
      const decisionPdf = await showConfirmAlert(
        "Factura creada",
        "¿Deseas guardar el PDF de la factura?"
      );

      if (decisionPdf.isConfirmed) {
        await descargarFacturaPdf(guardada.IdFactura);
      }

      // Reinicia el formulario
      setNombreClienteBusqueda("");
      setCliente(null);
      setResultadosCliente([]);
      setVendedorNombre("");
      setVendedorTelefono("");
      setVendedorId(null);
      setDetalle([]);
      setMetodoPago("Efectivo");
      setCondicionPago("Credito30Dias");
      setAbonoInicial("");
      setObservaciones("");
      setTotales({ subtotal: 0, total: 0 });
    }
  };

  return <FacturacionForm
    cliente={cliente}
    nombreClienteBusqueda={nombreClienteBusqueda}
    setNombreClienteBusqueda={setNombreClienteBusqueda}
    resultadosCliente={resultadosCliente}
    setResultadosCliente={setResultadosCliente}
    handleBuscarCliente={handleBuscarCliente}
    seleccionarCliente={seleccionarCliente}
    mostrarModalCliente={mostrarModalCliente}
    setMostrarModalCliente={setMostrarModalCliente}
    vendedorNombre={vendedorNombre}
    vendedorTelefono={vendedorTelefono}
    vendedores={vendedores}
    resultadosVendedor={resultadosVendedor}
    setResultadosVendedor={setResultadosVendedor}
    handleBuscarVendedor={handleBuscarVendedor}
    seleccionarVendedor={seleccionarVendedor}
    mostrarModalVendedor={mostrarModalVendedor}
    setMostrarModalVendedor={setMostrarModalVendedor}
    nuevoVendedor={nuevoVendedor}
    setNuevoVendedor={setNuevoVendedor}
    guardarVendedor={guardarVendedor}
    busqueda={busqueda}
    handleBuscarProducto={handleBuscarProducto}
    resultadosBusqueda={resultadosBusqueda}
    productos={productos}
    handleAgregarProducto={handleAgregarProducto}
    detalle={detalle}
    handleCantidadChange={handleCantidadChange}
    handleEliminarProducto={handleEliminarProducto}
    metodoPago={metodoPago}
    setMetodoPago={setMetodoPago}
    condicionPago={condicionPago}
    setCondicionPago={setCondicionPago}
    abonoInicial={abonoInicial}
    setAbonoInicial={setAbonoInicial}
    observaciones={observaciones}
    setObservaciones={setObservaciones}
    totales={totales}
    handleGenerarFactura={handleGenerarFactura}
  />;
}
