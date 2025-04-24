// 🔒 Protección
const usuario = localStorage.getItem("usuario");
if (!usuario) window.location.href = "auth.html";

// URLs
const apiFacturas = "http://localhost:5021/api/facturas";
const apiClientes = "http://localhost:5021/api/clientes";
const apiProductos = "http://localhost:5021/api/productos";

// Elementos
const listaFacturas = document.getElementById("listaFacturas");
const cbClientes = document.getElementById("cbClientes");
const cbProductos = document.getElementById("cbProductos");
const cantidadInput = document.getElementById("cantidad");
const carritoUl = document.getElementById("carrito");
const totalFactura = document.getElementById("totalFactura");
const formFactura = document.getElementById("formFactura");

// Datos
let carrito = [];
let total = 0;

// Mostrar listado de facturas
async function obtenerFacturas() {
  try {
    const res = await fetch(apiFacturas);
    if (!res.ok) throw new Error("No se pudieron obtener las facturas");
    const datos = await res.json();

    const clienteId = parseInt(document.getElementById("filtroClientes").value);

    const facturasFiltradas = clienteId
      ? datos.filter((f) => f.cliente?.id === clienteId)
      : datos;

    listaFacturas.innerHTML =
      facturasFiltradas.length === 0
        ? "<li>No hay facturas para este cliente.</li>"
        : "";

    facturasFiltradas.forEach((f) => {
      const li = document.createElement("li");
      li.innerHTML = `
          <div class="factura-item">
            <p><strong>Cliente:</strong> ${
              f.cliente?.nombre || "Desconocido"
            }</p>
            <p><strong>Fecha:</strong> ${new Date(
              f.fecha
            ).toLocaleDateString()}</p>
            <p><strong>Total:</strong> ${f.total.toFixed(2)} €</p>
            <button class="btnExportar" data-id="${
              f.id
            }">🧾 Exportar PDF</button>
          </div>
        `;
      listaFacturas.appendChild(li);
    });
  } catch (err) {
    console.error(err);
    listaFacturas.innerHTML = "<li>Error al cargar las facturas.</li>";
  }
}

// Cargar combos
async function cargarCombos() {
  try {
    const [clientes, productos] = await Promise.all([
      fetch(apiClientes).then((r) => r.json()),
      fetch(apiProductos).then((r) => r.json()),
    ]);

    // Combo de crear factura
    cbClientes.innerHTML = clientes
      .map((c) => `<option value="${c.id}">${c.nombre}</option>`)
      .join("");

    // Combo de productos
    cbProductos.innerHTML = productos
      .map(
        (p) =>
          `<option value="${p.id}" data-precio="${p.precio}">${p.nombre}</option>`
      )
      .join("");

    // Combo de filtro por cliente (listado)
    const filtroClientes = document.getElementById("filtroClientes");
    filtroClientes.innerHTML =
      '<option value="0">🔍 Ver todas</option>' +
      clientes
        .map((c) => `<option value="${c.id}">${c.nombre}</option>`)
        .join("");
  } catch (err) {
    console.error("❌ Error cargando combos:", err);
  }
}

// Agregar al carrito
document.getElementById("btnAgregarProducto").addEventListener("click", () => {
  const productoSel = cbProductos.options[cbProductos.selectedIndex];
  const productoId = parseInt(productoSel.value);
  const nombre = productoSel.text;
  const precio = parseFloat(productoSel.dataset.precio);
  const cantidad = parseInt(cantidadInput.value);

  const existente = carrito.find((p) => p.productoId === productoId);
  if (existente) {
    existente.cantidad += cantidad;
  } else {
    carrito.push({ productoId, nombre, precio, cantidad });
  }

  actualizarCarrito();
});

function actualizarCarrito() {
  carritoUl.innerHTML = "";
  total = 0;

  carrito.forEach((item) => {
    const subtotal = item.precio * item.cantidad;
    total += subtotal;

    const li = document.createElement("li");
    li.textContent = `${item.nombre} - ${item.cantidad} x ${item.precio.toFixed(
      2
    )}€ = ${subtotal.toFixed(2)}€`;
    carritoUl.appendChild(li);
  });

  totalFactura.textContent = `Total: ${total.toFixed(2)} €`;
}

// Guardar factura
formFactura.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (carrito.length === 0) {
    alert("Agrega al menos un producto");
    return;
  }

  const clienteId = parseInt(cbClientes.value);

  const factura = {
    clienteId,
    fecha: new Date().toISOString(),
    total,
    detalles: carrito.map((p) => ({
      productoId: p.productoId,
      cantidad: p.cantidad,
    })),
  };

  try {
    const res = await fetch(apiFacturas, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(factura),
    });

    console.log("🔎 Código de estado HTTP:", res.status);
    console.log("🔎 Headers:", [...res.headers.entries()]);
    const texto = await res.text();
    console.log("🔎 Texto crudo de respuesta:", texto);

    if (!res.ok) {
      try {
        const error = await res.json();
        console.error("❌ Error detallado desde backend:", error);
        mostrarMensaje("❌ " + (error.detalle || "Error desconocido"), "error");
      } catch {
        console.warn("⚠️ No se pudo interpretar la respuesta de error");
        mostrarMensaje("❌ Error desconocido al guardar factura", "error");
      }
      return;
    }

    mostrarMensaje("✅ Factura creada correctamente", "success");

    carrito = [];
    actualizarCarrito();
    formFactura.reset();
    total = 0;
    totalFactura.textContent = "Total: 0.00 €";

    obtenerFacturas();
  } catch (err) {
    console.error(err);
    mostrarMensaje("❌ Error inesperado al guardar factura", "error");
  }
});

// Mensaje flotante
function mostrarMensaje(texto, tipo) {
  const msg = document.getElementById("mensaje");
  msg.textContent = texto;
  msg.style.display = "block";
  msg.style.backgroundColor = tipo === "success" ? "#4CAF50" : "#f44336";

  setTimeout(() => {
    msg.style.display = "none";
  }, 3000);
}

// Init
document.addEventListener("DOMContentLoaded", () => {
  obtenerFacturas();
  cargarCombos();

  document
    .getElementById("filtroClientes")
    .addEventListener("change", obtenerFacturas);
});

// 🧾 Exportar PDF de factura
document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("btnExportar")) {
    const facturaId = e.target.dataset.id;

    try {
      const res = await fetch(`${apiFacturas}/${facturaId}`);
      const factura = await res.json();

      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();

      doc.setFontSize(18);
      doc.text("Factura", 20, 20);
      doc.setFontSize(12);
      doc.text(`Cliente: ${factura.cliente?.nombre || "Desconocido"}`, 20, 30);
      doc.text(
        `Fecha: ${new Date(factura.fecha).toLocaleDateString()}`,
        20,
        40
      );
      doc.text(`Total: ${factura.total.toFixed(2)} €`, 20, 50);

      doc.text("Productos:", 20, 65);
      let y = 75;

      factura.detalles.forEach((detalle, index) => {
        const linea = `${index + 1}. ${
          detalle.producto?.nombre || "Producto"
        } - Cantidad: ${detalle.cantidad}`;
        doc.text(linea, 20, y);
        y += 10;
      });

      doc.save(`Factura_${factura.id}.pdf`);
    } catch (err) {
      console.error("❌ Error al exportar PDF:", err);
      mostrarMensaje("❌ No se pudo generar el PDF", "error");
    }
  }
});
