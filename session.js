function mostrarUsuarioHeader() {
  const contenedor = document.getElementById("usuarioInfo");
  if (!contenedor) return;

  const usuario = JSON.parse(localStorage.getItem("usuario"));

  if (usuario) {
    contenedor.innerHTML = `
        <div class="usuario-dropdown">
          <div class="usuario-info">
            <img src="https://www.svgrepo.com/show/384674/account-avatar-profile-user-11.svg" alt="Usuario" />
            <span>${usuario.email}</span>
          </div>
          <div class="usuario-menu">
            <a href="#" id="cerrarSesion">🔓 Cerrar sesión</a>
          </div>
        </div>
      `;

    const dropdown = contenedor.querySelector(".usuario-dropdown");
    const menu = contenedor.querySelector(".usuario-menu");

    dropdown.addEventListener("click", () => {
      menu.classList.toggle("mostrar-menu");
    });

    const btnCerrar = document.getElementById("cerrarSesion");
    btnCerrar.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("usuario");
      window.location.href = "auth.html";
    });
  } else {
    contenedor.innerHTML = `
        <a href="login.html" style="color: white; text-decoration: none;">Iniciar sesión / Registrarse</a>
      `;
  }
}
document.addEventListener("DOMContentLoaded", mostrarUsuarioHeader);
function toggleMenu() {
  const menu = document.getElementById("sideMenu");
  menu.classList.toggle("show");
}
