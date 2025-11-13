document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("favoritosContainer");
  const favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];

  if (favoritos.length === 0) {
    container.innerHTML = '<p class="mensaje">No tienes mascotas favoritas aún 🐾</p>';
    return;
  }

  try {
    const response = await fetch("./data/mascotas.json");
    const mascotasData = await response.json();

    const favoritas = mascotasData.filter(m => favoritos.includes(m.id));

    if (favoritas.length === 0) {
      container.innerHTML = `<p class="mesage">No se encontraron tus favoritos 😿</p>`;
      return;
    }

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
    container.innerHTML = `<p class="message">Error al cargar los favoritos 😿</p>`;
  }
});
