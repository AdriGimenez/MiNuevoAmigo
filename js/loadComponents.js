document.addEventListener("DOMContentLoaded", () => {

  // 1. Cargar NAVBAR
  fetch("navbar.html")
    .then(response => response.text())
    .then(data => {
      document.getElementById("navbar-container").innerHTML = data;

      // Llamar a función una vez que el navbar existe en el DOM
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


// =========================================
// FUNCIÓN QUE PERSONALIZA EL NAVBAR
// =========================================
function personalizeNavbar() {
  const user = JSON.parse(localStorage.getItem("user"));

  const navRight = document.querySelector(".nav-right");
  const favoritosLink = document.getElementById("nav-favoritos");

  if (!navRight) return;

  // ==== Ocultar o mostrar FAVORITOS ====
  if (favoritosLink) {
    if (user) {
      favoritosLink.style.display = "inline-block"; // mostrar si loggeado
    } else {
      favoritosLink.style.display = "none"; // ocultar si NO loggeado
    }
  }

  // ==== Mostrar usuario o Login/Registro ====
  navRight.innerHTML = "";

  if (user) {
    navRight.innerHTML = `
      <span style="font-weight:600;">Hola, ${user.username}</span>
      <button id="logoutBtn" class="button btn-login logout-btn-custom">Salir</button>
    `;

    document.getElementById("logoutBtn").addEventListener("click", () => {
      localStorage.removeItem("user");
      window.location.href = "index.html";
    });

  } else {
    navRight.innerHTML = `
      <a href="login.html" class="button btn-login">Login</a>
      <a href="registro.html" class="button btn-register">Registro</a>
    `;
  }
}
