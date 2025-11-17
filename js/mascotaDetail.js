document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) return;

  try {
    const mascotas = await airtableGet(TABLE_MASCOTAS);


    const mascota = mascotas.find(m => m.id == id);
    if (!mascota) {
      document.body.innerHTML = "<p>Mascota no encontrada</p>";
      return;
    }

    const container = document.getElementById("mascotaDetailContainer");
    container.innerHTML = `
      <div class="mascota-detail-card-horizontal">
        <div class="mascota-img-col">
          <img src="${mascota.image[0].url}" alt="${mascota.name}">
        </div>
        <div class="mascota-info-col">
          <h2 class="mascota-name">${mascota.name}</h2>
          <p><strong>Año:</strong> ${mascota.age}</p>
          <p><strong>Categoria:</strong> ${mascota.category}</p>
          <p><strong>Raza:</strong> ${mascota.breed}</p>
          <p class="mascota-story">${mascota.story}</p>
          <div class="mascota-buttons">
            <a href="mascotas.html" class="button volver">Volver</a>
            <a href="adopcion.html?id=${mascota.id}" class="button adoptar">Adoptar</a>
            <button class="button favoritos">Agregar a Favoritos</button>
          </div>
        </div>
      </div>
    `;


  } catch (error) {
    console.error("Error al cargar la mascota:", error);
  }
});
