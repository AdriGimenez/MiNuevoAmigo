document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("favoritosContainer");
  const favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];

  // Limpiamos mensajes antiguos
  const existingMensaje = container.querySelector(".favoritos-empty");
  if (existingMensaje) existingMensaje.remove();

  if (favoritos.length === 0) {
    const mensajeDiv = document.createElement("div");
    mensajeDiv.classList.add("favoritos-empty");
    mensajeDiv.innerHTML = `
      <p class="patas">🐾</p>
      <p class="mensaje">No tienes mascotas favoritas aún 🐾</p>
      <p class="submensaje">Agrega algunas mascotas a tus favoritos para verlas aquí.</p>
      <a href="./mascotas.html" class="boton-ver">Ver mascotas</a>
    `;
    container.appendChild(mensajeDiv); // Se agrega sin borrar el contenedor principal
    return;
  }

  try {
    const response = await fetch("./data/mascotas.json");
    const mascotasData = await response.json();

    const favoritas = mascotasData.filter(m => favoritos.includes(m.id));

    // Limpiamos posibles mensajes anteriores
    container.querySelectorAll(".favoritos-empty").forEach(el => el.remove());

    if (favoritas.length === 0) {
      const mensajeDiv = document.createElement("div");
      mensajeDiv.classList.add("favoritos-empty");
      mensajeDiv.innerHTML = `
        <p class="patas">😿</p>
        <p class="mensaje">No se encontraron tus favoritos 😿</p>
        <a href="./mascotas.html" class="boton-ver">Ver mascotas</a>
      `;
      container.appendChild(mensajeDiv);
      return;
    }

    // Limpiamos todo antes de mostrar favoritos
    container.innerHTML = "";

    favoritas.forEach(mascota => {
      const article = document.createElement("article");
      article.classList.add("mascota-item");
      article.innerHTML = `
        <div class="mascota-img" style="background-image: url('${mascota.image}')"></div>
        <div class="mascota-img-hover" style="background-image: url('${mascota.image}')"></div>
        <div class="mascota-info">
          <span class="mascota-category">${mascota.name}</span>
          <h3 class="mascota-title">Raza: ${mascota.breed}</h3>
          <a href="./mascota-detail.html?id=${mascota.id}" class="button">Ver más</a>
        </div>
      `;
      container.appendChild(article);
    });

  } catch (error) {
    console.error("Error al cargar los favoritos:", error);
    const mensajeDiv = document.createElement("div");
    mensajeDiv.classList.add("favoritos-empty");
    mensajeDiv.innerHTML = `
      <p class="patas">⚠️</p>
      <p class="mensaje">Error al cargar los favoritos 😿</p>
    `;
    container.appendChild(mensajeDiv);
  }
});
