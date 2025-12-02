import { getPets, getFavoritosByUsername, deleteFavorite } from "./airtable.js";

document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("favoritosContainer");
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    container.innerHTML = "<p>Por favor, inicia sesión para ver tus favoritos.</p>";
    return;
  }

  const fetchMascotaData = async (mascotaId) => {
  const petsData = await getPets();
  const mascota = petsData.records.find(p => p.id === mascotaId);
  if (!mascota) return null;
  return { id: mascota.id, ...mascota.fields };
};


  const renderFavoritos = async () => {
    container.innerHTML = "";
    let favoritosRecords;

    try {
      favoritosRecords = await getFavoritosByUsername(user.username);
    } catch (error) {
        console.error("Error al cargar favoritos:", error);
        container.innerHTML = `
          <div class="favoritos-empty">
            <p class="patas">⚠️</p>
            <p class="mensaje">Error al cargar los favoritos 😿</p>
          </div>
        `;
        return;
      }

      console.log("Favoritos records:", favoritosRecords);
      if (!favoritosRecords || favoritosRecords.length === 0) {
        console.log("No hay favoritos encontrados.");
        container.innerHTML = `
          <div class="favoritos-empty">
            <p class="patas">🐾</p>
            <p class="mensaje">No tienes mascotas favoritas aún 🐾</p>
            <a href="./mascotas.html" class="boton-ver">Ver Mascotas</a>
          </div>
        `;
        return;
      }

      for (const fav of favoritosRecords) {
        const mascotaId = Array.isArray(fav.fields.mascota) ? fav.fields.mascota[0] : fav.fields.mascota;
        const fields = await fetchMascotaData(mascotaId);
        console.log("Mascota data for favorite:", fields);
        console.log("Mascota ID:", mascotaId);
        if (!fields) continue;

        const article = document.createElement("article");
        article.classList.add("mascota-item");

        article.innerHTML = `
          <button class="mascota-like activo" data-id="${fav.id}">
            <svg viewBox="0 0 24 24" width="24" height="24" class="icono-corazon">
              <path fill="#000000" d="M12.1,18.55L12,18.65L11.89,18.55C7.14,14.24 4,11.39 
              4,8.5C4,6.5 5.5,5 7.5,5C9.04,5 10.54,6 11.07,7.36H12.93C13.46,6 14.96,5 16.5,5C18.5,5 
              20,6.5 20,8.5C20,11.39 16.86,14.24 12.1,18.55M16.5,3C14.76,3 13.09,3.81 12,5.08C10.91,3.81 
              9.24,3 7.5,3C4.42,3 2,5.41 2,8.5C2,12.27 5.4,15.36 10.55,20.03L12,21.35L13.45,20.03C18.6,15.36 
              22,12.27 22,8.5C22,5.41 19.58,3 16.5,3Z" />
            </svg>
          </button>

          <div class="mascota-img" style="background-image: url('${fields.image?.[0]?.url || 'ruta-default.png'}')"></div>
          <div class="mascota-img-hover" style="background-image: url('${fields.image?.[0]?.url || 'ruta-default.png'}')"></div>
          <div class="mascota-info">
            <span class="mascota-category">${fields.name}</span>
            <h3 class="mascota-title">Raza: ${fields.breed}</h3>
            <a href="./mascota-detail.html?id=${fields.id}" class="button">Ver más</a>
          </div>
        `;

        container.appendChild(article);
      }

      // Agregar evento para eliminar favorito
      document.querySelectorAll(".mascota-like").forEach(icono => {
        icono.addEventListener("click", async () => {
          const favId = icono.dataset.id;
          try {
            await deleteFavorite(favId);
            await renderFavoritos();
          } catch (err) { 
            console.error("Error al eliminar favorito:", err);
          }
        });
      });
    };

  await renderFavoritos();
});