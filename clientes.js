// ✅ Proteger acceso si no hay usuario logueado
const usuario = localStorage.getItem("usuario");
if (!usuario) {
  alert("Debes iniciar sesión para acceder a esta sección.");
  window.location.href = "auth.html";
}

const apiUrl = "http://localhost:5021/api/clientes";

const form = document.getElementById("formCliente");
const lista = document.getElementById("listaClientes");

let editando = false;
let clienteEditandoId = null;
let callbackEliminar = null;

function mostrarConfirmacion(mensaje, callback) {
  document.getElementById("modalTexto").textContent = mensaje;
  document.getElementById("modalConfirmacion").style.display = "block";
  callbackEliminar = callback;
}

window.onload = () => {
  obtenerClientes();
  document.getElementById("nombre").focus();

  // Configurar botones del modal cuando el DOM ya está cargado
  document.getElementById("btnCancelar").onclick = () => {
    document.getElementById("modalConfirmacion").style.display = "none";
    callbackEliminar = null;
  };

  document.getElementById("btnConfirmar").onclick = () => {
    if (callbackEliminar) callbackEliminar();
    document.getElementById("modalConfirmacion").style.display = "none";
  };
};

// Enviar formulario
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = document.getElementById("nombre").value.trim();
  const email = document.getElementById("email").value.trim();
  const telefono = document.getElementById("telefono").value.trim();

  const datosCliente = { nombre, email, telefono };

  try {
    let respuesta;

    if (editando) {
      respuesta = await fetch(`${apiUrl}/${clienteEditandoId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: clienteEditandoId, ...datosCliente }),
      });

      if (!respuesta.ok) throw new Error("Error al actualizar cliente");

      mostrarMensaje("✏️ Cliente actualizado", "success");

      editando = false;
      clienteEditandoId = null;
      form.querySelector("button").textContent = "Agregar Cliente";
    } else {
      respuesta = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(datosCliente),
      });

      if (!respuesta.ok) throw new Error("Error al crear cliente");

      mostrarMensaje("✅ Cliente agregado correctamente", "success");
    }

    form.reset();
    document.getElementById("nombre").focus();
    obtenerClientes();
  } catch (error) {
    mostrarMensaje("❌ Error al guardar cliente", "error");
    console.error(error);
  }
});

// Mostrar clientes
async function obtenerClientes() {
  try {
    const respuesta = await fetch(apiUrl);
    const clientes = await respuesta.json();

    lista.innerHTML = "";

    clientes.forEach((cliente) => {
      const li = document.createElement("li");
      li.textContent = `${cliente.nombre} - ${cliente.email} - ${cliente.telefono}`;

      const btnEditar = document.createElement("button");
      btnEditar.textContent = "✏️";
      btnEditar.title = "Editar";
      btnEditar.onclick = () => {
        document.getElementById("nombre").value = cliente.nombre;
        document.getElementById("email").value = cliente.email;
        document.getElementById("telefono").value = cliente.telefono;
        editando = true;
        clienteEditandoId = cliente.id;
        form.querySelector("button").textContent = "Guardar cambios";
      };

      const btnEliminar = document.createElement("button");
      btnEliminar.textContent = "🗑️";
      btnEliminar.title = "Eliminar";
      btnEliminar.onclick = () => {
        mostrarConfirmacion(
          `¿Seguro que quieres eliminar a ${cliente.nombre}?`,
          async () => {
            try {
              const res = await fetch(`${apiUrl}/${cliente.id}`, {
                method: "DELETE",
              });

              if (!res.ok) throw new Error("No se pudo eliminar");

              mostrarMensaje("🗑️ Cliente eliminado correctamente", "success");
              obtenerClientes();
            } catch (err) {
              mostrarMensaje("❌ Error al eliminar cliente", "error");
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
    mostrarMensaje("❌ Error al cargar clientes", "error");
    console.error(error);
  }
}

// Mensaje flotante
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
