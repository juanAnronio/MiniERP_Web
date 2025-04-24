//Proteger acceso si no hay usuario logueado
const usuario = localStorage.getItem("usuario");
if (!usuario) {
  alert("Debes iniciar sesión para acceder a esta sección.");
  window.location.href = "auth.html";
}

const apiUrl = "http://localhost:5021/api/productos";

const form = document.getElementById("formProducto");
const lista = document.getElementById("listaProductos");

let editando = false;
let productoEditandoId = null;
let callbackEliminar = null;

function mostrarConfirmacion(mensaje, callback) {
  document.getElementById("modalTexto").textContent = mensaje;
  document.getElementById("modalConfirmacion").style.display = "block";
  callbackEliminar = callback;
}

window.onload = () => {
  obtenerProductos();
  document.getElementById("nombreProducto").focus();

  document.getElementById("btnCancelar").onclick = () => {
    document.getElementById("modalConfirmacion").style.display = "none";
    callbackEliminar = null;
  };

  document.getElementById("btnConfirmar").onclick = () => {
    if (callbackEliminar) callbackEliminar();
    document.getElementById("modalConfirmacion").style.display = "none";
  };
};

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = document.getElementById("nombreProducto").value.trim();
  const precio = parseFloat(document.getElementById("precioProducto").value);

  const datosProducto = { nombre, precio };

  try {
    let respuesta;

    if (editando) {
      respuesta = await fetch(`${apiUrl}/${productoEditandoId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: productoEditandoId, ...datosProducto }),
      });

      if (!respuesta.ok) throw new Error("Error al actualizar producto");

      mostrarMensaje("✏️ Producto actualizado", "success");

      editando = false;
      productoEditandoId = null;
      form.querySelector("button").textContent = "Agregar Producto";
    } else {
      respuesta = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(datosProducto),
      });

      if (!respuesta.ok) throw new Error("Error al crear producto");

      mostrarMensaje("✅ Producto agregado correctamente", "success");
    }

    form.reset();
    document.getElementById("nombreProducto").focus();
    obtenerProductos();
  } catch (error) {
    mostrarMensaje("❌ Error al guardar producto", "error");
    console.error(error);
  }
});

async function obtenerProductos() {
  try {
    const respuesta = await fetch(apiUrl);
    const productos = await respuesta.json();

    lista.innerHTML = "";

    productos.forEach((producto) => {
      const li = document.createElement("li");
      li.textContent = `${producto.nombre} - ${producto.precio.toFixed(2)} €`;

      const btnEditar = document.createElement("button");
      btnEditar.textContent = "✏️";
      btnEditar.title = "Editar";
      btnEditar.onclick = () => {
        document.getElementById("nombreProducto").value = producto.nombre;
        document.getElementById("precioProducto").value = producto.precio;
        editando = true;
        productoEditandoId = producto.id;
        form.querySelector("button").textContent = "Guardar cambios";
      };

      const btnEliminar = document.createElement("button");
      btnEliminar.textContent = "🗑️";
      btnEliminar.title = "Eliminar";
      btnEliminar.onclick = () => {
        mostrarConfirmacion(
          `¿Seguro que quieres eliminar "${producto.nombre}"?`,
          async () => {
            try {
              const res = await fetch(`${apiUrl}/${producto.id}`, {
                method: "DELETE",
              });

              if (!res.ok) throw new Error("No se pudo eliminar");

              mostrarMensaje("🗑️ Producto eliminado correctamente", "success");
              obtenerProductos();
            } catch (err) {
              mostrarMensaje("❌ Error al eliminar producto", "error");
              console.error(err);
            }
          }
        );
      };

      li.appendChild(btnEditar);
      li.appendChild(btnEliminar);
      lista.appendChild(li);
    });
  } catch (error) {
    mostrarMensaje("❌ Error al cargar productos", "error");
    console.error(error);
  }
}

function mostrarMensaje(texto, tipo) {
  const msg = document.getElementById("mensaje");
  if (!msg) return;

  msg.textContent = texto;
  msg.style.display = "block";
  msg.style.backgroundColor = tipo === "success" ? "#4CAF50" : "#f44336";

  setTimeout(() => {
    msg.style.display = "none";
  }, 3000);
}
