document.addEventListener("DOMContentLoaded", () => {

  // 1. Cargar NAVBAR
  fetch("navbar.html")
    .then(response => response.text())
    .then(data => {
      document.getElementById("navbar-container").innerHTML = data;

      // *** Aquí modificamos el NAV luego de insertarlo ***
      personalizeNavbar();
    })
    .catch(error => console.error("Error al cargar el navbar:", error));

  // 2. Cargar FOOTER
  fetch("footer.html")
    .then(response => response.text())
    .then(data => {
      document.getElementById("footer-container").innerHTML = data;
    })
    .catch(error => console.error("Error al cargar el footer:", error));
});


// ========================
// FUNCIÓN PARA EDITAR NAV
// ========================
function personalizeNavbar() {
  const user = JSON.parse(localStorage.getItem("user"));

  // elementos del navbar
  const navRight = document.querySelector(".nav-right");

  if (!navRight) return;

  // limpiar contenido previo (Login / Registro)
  navRight.innerHTML = "";

  if (user) {
    // Si está logueado
    navRight.innerHTML = `
      <span style="font-weight: 600;">Hola, ${user.username}</span>
      <button id="logoutBtn" class="button btn-login logout-btn-custom">Salir</button>
    `;

    // evento Logout
    document.getElementById("logoutBtn").addEventListener("click", () => {
      localStorage.removeItem("user");
      window.location.href = "index.html";
    });

  } else {
    // Si NO está logueado → dejar Login y Registro
    navRight.innerHTML = `
      <a href="login.html" class="button btn-login">Login</a>
      <a href="register.html" class="button btn-register">Registro</a>
    `;
  }
}
