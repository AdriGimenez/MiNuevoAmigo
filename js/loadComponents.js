document.addEventListener("DOMContentLoaded", () => {

  // Cargar NAVBAR
  fetch("navbar.html")
    .then(response => response.text())
    .then(data => {
      document.getElementById("navbar-container").innerHTML = data;

      personalizeNavbar(); // aplicar roles
    })
    .catch(error => console.error("Error al cargar el navbar:", error));

  // Cargar FOOTER
  fetch("footer.html")
    .then(response => response.text())
    .then(data => {
      document.getElementById("footer-container").innerHTML = data;
    })
    .catch(error => console.error("Error al cargar el footer:", error));
});


// =======================
//      NAVBAR LOGIC
// =======================
function personalizeNavbar() {
  const user = JSON.parse(localStorage.getItem("user"));

  const navRight = document.querySelector(".nav-right");
  const navLeft = document.querySelector(".nav-left");

  const favoritosLink = document.getElementById("nav-favoritos");
  const solicitudesLink = document.getElementById("nav-solicitudes");

  if (!navRight) return;

  // Ocultar por defecto
  if (favoritosLink) favoritosLink.style.display = "none";
  if (solicitudesLink) solicitudesLink.style.display = "none";

  navRight.innerHTML = "";

  if (user) {

    // -------------------------
    //    SI ES ADMIN
    // -------------------------
    if (user.role === "admin") {

      // Agregar link sólo si NO existe ya (para evitar duplicados)
      if (!document.getElementById("nav-admin")) {
        navLeft.innerHTML += `<a href="admin.html" id="nav-admin">Administración</a>`;
      }

    }

    // -------------------------
    //   SI ES USUARIO NORMAL
    // -------------------------
    else {
      if (favoritosLink) favoritosLink.style.display = "inline-block";
      if (solicitudesLink) solicitudesLink.style.display = "inline-block";
    }

    // USER LOGUEADO (admin o user)
    navRight.innerHTML = `
      <span style="font-weight:600;">Hola, ${user.username}</span>
      <button id="logoutBtn" class="button btn-login logout-btn-custom">Salir</button>
    `;

    document.getElementById("logoutBtn").addEventListener("click", () => {
      localStorage.removeItem("user");
      window.location.href = "index.html";
    });

  } else {

    // Usuario NO logueado
    navRight.innerHTML = `
      <a href="login.html" class="button btn-login">Login</a>
      <a href="registro.html" class="button btn-register">Registro</a>
    `;
  }
}
