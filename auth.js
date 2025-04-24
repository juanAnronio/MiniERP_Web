const urlBase = "http://localhost:5021/api/usuarios";

// Tabs
const btnLoginTab = document.getElementById("btnLoginTab");
const btnRegistroTab = document.getElementById("btnRegistroTab");
const formLogin = document.getElementById("formLogin");
const formRegistro = document.getElementById("formRegistro");

btnLoginTab.onclick = () => {
  btnLoginTab.classList.add("active");
  btnRegistroTab.classList.remove("active");
  formLogin.classList.remove("hidden");
  formRegistro.classList.add("hidden");
};

btnRegistroTab.onclick = () => {
  btnLoginTab.classList.remove("active");
  btnRegistroTab.classList.add("active");
  formLogin.classList.add("hidden");
  formRegistro.classList.remove("hidden");
};

// Login
formLogin.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value.trim();
  const contrasena = document.getElementById("loginPassword").value.trim();

  try {
    const res = await fetch(`${urlBase}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, contrasena }),
    });

    if (!res.ok) {
      mostrarMensaje("❌ Credenciales inválidas", "error");
      return;
    }

    const datos = await res.json();
    localStorage.setItem("usuario", JSON.stringify(datos));
    mostrarMensaje("✅ Sesión iniciada", "success");

    setTimeout(() => (window.location.href = "index.html"), 1000);
  } catch (err) {
    mostrarMensaje("❌ Error de conexión", "error");
  }
});

// Registro
formRegistro.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("registroEmail").value.trim();
  const contrasena = document.getElementById("registroPassword").value.trim();

  try {
    const res = await fetch(`${urlBase}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, contrasena }),
    });

    if (!res.ok) {
      const error = await res.json();
      mostrarMensaje(`❌ ${error.mensaje}`, "error");
      return;
    }

    const datos = await res.json();
    localStorage.setItem("usuario", JSON.stringify(datos));
    mostrarMensaje("✅ Registrado con éxito", "success");

    setTimeout(() => (window.location.href = "index.html"), 1000);
  } catch (err) {
    mostrarMensaje("❌ Error de conexión", "error");
  }
});

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
