import { getPets, getFavorites, createFavorite } from './airtable.js';

document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const petId = params.get('id');

    if (!petId) return;

    // Verificar usuario loggeado
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.id) {
        alert('Debes iniciar sesión para ver este contenido');
        window.location.href = 'login.html';
        return;
    }

    // Obtener mascotas
    const petsData = await getPets();
    const pets = petsData.records;
    const pet = pets.find(p => p.id === petId);

    // Si no existe
    if (!pet) {
      document.getElementById('mascotaDetailContainer').innerHTML = 
      '<p>Mascota no encontrada.</p>';
      return;
    }

    const fields = pet.fields;

    // Renderizar detalles de la mascota
    const container = document.getElementById('mascotaDetailContainer');
    container.innerHTML = `
        <div class="mascota-detail-card-horizontal">
            <div class="mascota-img-col">
                <img src="${fields.image[0].url}" alt="${fields.Nombre}" class="mascota-detail-img">
            </div>

            <div class="mascota-info-col">
              <h2 class="mascota-name">${fields.name}</h2>
              <p><strong>Año:</strong> ${fields.age || 'Sin datos'}</p>
              <p><strong>Categoría:</strong> ${fields.category || 'Sin datos'}</p>
              <p><strong>Raza:</strong> ${fields.breed || 'Sin datos'}</p>
              <p class="mascota-story">${fields.story || ''}</p>

              <div class="mascota-buttons">
                <a href="mascotas.html" class="button volver">Volver</a>
                <a href="adopcion.html?id=${pet.id}" class="button adoptar">Adoptar</a>
                <button class="button favoritos" id="fav-button">Agregar a Favoritos</button>
              </div>
            </div>
        </div>
    `;

    // Manejar botón de favoritos
    const favButton = document.getElementById("fav-button");
   
    // Verificar si ya está en favoritos
    let favoritosData;
    try {
      favoritosData = await getFavorites();
    } catch (error) {
      console.error("Error al obtener favoritos:", error);
      return;
    }

    const isFavorito = favoritosData.records.some(fav =>
      fav.fields.user?.[0] === user.id && 
      fav.fields.pet?.[0] === pet.id
    );

    if (isFavorito) {
      favButton.disabled = true;
      favButton.textContent = "Ya está en Favoritos";
    }

    // Evento: agregar a favoritos
      favButton.addEventListener('click', async () => {
      favButton.disabled = true;
      favButton.textContent = "Agregando...";

      try {
        // user.id y pet.id ya deben ser los record IDs de Airtable
        await createFavorite(user.id, pet.id);
        favButton.textContent = "¡Agregado a Favoritos!";
      } catch (error) {
        console.error("Error al agregar a favoritos:", error);
        favButton.disabled = false;
        favButton.textContent = "Agregar a Favoritos";
        alert("Error al agregar a favoritos. Inténtalo de nuevo.");
      }
    });
});
