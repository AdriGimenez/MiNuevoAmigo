document.addEventListener("DOMContentLoaded", () => {

  fetch("navbar.html")
    .then(response => response.text())
    .then(data => {
      document.getElementById("navbar-container").innerHTML = data;

      personalizeNavbar();
    })
    .catch(error => console.error("Error al cargar el navbar:", error));

  fetch("footer.html")
    .then(response => response.text())
    .then(data => {
      document.getElementById("footer-container").innerHTML = data;
    })
    .catch(error => console.error("Error al cargar el footer:", error));
});


function personalizeNavbar() {
  const user = JSON.parse(localStorage.getItem("user"));

  const navRight = document.querySelector(".nav-right");
  const favoritosLink = document.getElementById("nav-favoritos");
  const solicitudesLink = document.getElementById("nav-solicitudes");

  if (!navRight) return;

  if (favoritosLink) {
    favoritosLink.style.display = user ? "inline-block" : "none";
  }
  if (solicitudesLink) {
    solicitudesLink.style.display = user ? "inline-block" : "none";
  }

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
