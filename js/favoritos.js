import { AIRTABLE_TOKEN, BASE_ID, USER_EMAIL } from "./env.js"; // USER_EMAIL: email del usuario logueado

const TABLE_FAVORITOS = "Favoritos";
const TABLE_MASCOTAS = "Mascotas";

document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("favoritosContainer");

  // Función para obtener favoritos del usuario desde Airtable
  const getFavoritos = async () => {
    const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_FAVORITOS}?filterByFormula={usuario email}='${USER_EMAIL}'`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` }
    });
    const data = await res.json();
    return data.records;
  };

  // Función para eliminar favorito
  const eliminarFavorito = async (favoritoId) => {
    await fetch(`https://api.airtable.com/v0/${BASE_ID}/${TABLE_FAVORITOS}/${favoritoId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` }
    });
  };

  const renderFavoritos = async () => {
    container.innerHTML = "";
    try {
      const favoritosRecords = await getFavoritos();

      if (favoritosRecords.length === 0) {
        container.innerHTML = `
          <div class="favoritos-empty">
            <p class="patas">🐾</p>
            <p class="mensaje">No tienes mascotas favoritas aún 🐾</p>
            <p class="submensaje">Agrega algunas mascotas a tus favoritos para verlas aquí.</p>
            <a href="./mascotas.html" class="boton-ver">Ver mascotas</a>
          </div>
        `;
        return;
      }

      favoritosRecords.forEach(fav => {
        const mascota = fav.fields.mascota[0]; // id de la mascota relacionada
        const name = fav.fields["mascota name"];
        const breed = fav.fields["mascota breed"];
        const category = fav.fields["mascota category"];
        const image = fav.fields["mascota image"]?.[0]?.url || "";

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

          <div class="mascota-img" style="background-image: url('${image}')"></div>
          <div class="mascota-img-hover" style="background-image: url('${image}')"></div>
          <div class="mascota-info">
            <span class="mascota-category">${name}</span>
            <h3 class="mascota-title">Raza: ${breed}</h3>
            <a href="./mascota-detail.html?id=${mascota}" class="button">Ver más</a>
          </div>
        `;
        container.appendChild(article);
      });

      // Agregar eventos para eliminar favorito
      const corazones = document.querySelectorAll(".mascota-like");
      corazones.forEach(icono => {
        icono.addEventListener("click", async () => {
          const id = icono.dataset.id;
          await eliminarFavorito(id);
          renderFavoritos(); // refresca la lista
        });
      });

    } catch (error) {
      console.error("Error al cargar los favoritos:", error);
      container.innerHTML = `
        <div class="favoritos-empty">
          <p class="patas">⚠️</p>
          <p class="mensaje">Error al cargar los favoritos 😿</p>
        </div>
      `;
    }
  };

  await renderFavoritos();
});
