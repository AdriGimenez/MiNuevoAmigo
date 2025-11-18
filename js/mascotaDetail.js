import { AIRTABLE_TOKEN, BASE_ID } from "./env.js";

document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) return;

  const user = JSON.parse(localStorage.getItem("user")); // Usuario logueado

  const airtableUrl = `https://api.airtable.com/v0/${BASE_ID}/Mascotas/${id}`;

  try {
    const response = await fetch(airtableUrl, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_TOKEN}`,
        "Content-Type": "application/json"
      }
    });

    const data = await response.json();

    if (!data.fields) {
      document.getElementById("mascotaDetailContainer").innerHTML =
        "<p>Mascota no encontrada</p>";
      return;
    }

    // Mapeo de los datos igual que en mascotas.js
    const mascota = {
      id: data.id,
      name: data.fields.name,
      breed: data.fields.breed,
      age: data.fields.age,
      category: data.fields.category,
      story: data.fields.story,
      image: data.fields.image || []
    };

    const container = document.getElementById("mascotaDetailContainer");
    container.innerHTML = `
      <div class="mascota-detail-card-horizontal">
        <div class="mascota-img-col">
          <img src="${mascota.image[0]?.url || ''}" alt="${mascota.name}">
        </div>

        <div class="mascota-info-col">
          <h2 class="mascota-name">${mascota.name}</h2>
          <p><strong>Año:</strong> ${mascota.age || 'Sin datos'}</p>
          <p><strong>Categoría:</strong> ${mascota.category}</p>
          <p><strong>Raza:</strong> ${mascota.breed}</p>
          <p class="mascota-story">${mascota.story || ''}</p>

          <div class="mascota-buttons">
            <a href="mascotas.html" class="button volver">Volver</a>
            <a href="adopcion.html?id=${mascota.id}" class="button adoptar">Adoptar</a>
            <button class="button favoritos" id="add-favorite">Agregar a Favoritos</button>
          </div>
        </div>
      </div>
    `;

    // --- Funcionalidad Agregar a Favoritos ---
    const favButton = document.getElementById("add-favorite");
    favButton.addEventListener("click", async () => {
      if (!user || !user.id) {
        alert("Debes iniciar sesión para agregar a favoritos.");
        window.location.href = "login.html";
        return;
      }

      favButton.disabled = true;
      favButton.textContent = "Agregando...";

      try {
        const id_favorito = Date.now(); // ID simple para favoritos

        const body = {
          fields: {
            id_favorito,
            usuario: [user.id],   // ID del usuario logueado
            mascota: [mascota.id] // ID de la mascota que se muestra
          }
        };

        const response = await fetch(
          `https://api.airtable.com/v0/${BASE_ID}/Favoritos`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${AIRTABLE_TOKEN}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
          }
        );

        if (response.ok) {
          favButton.textContent = "¡Favorito agregado!";
          console.log("Favorito cargado correctamente");
        } else {
          console.error(await response.text());
          favButton.disabled = false;
          favButton.textContent = "Agregar a Favoritos";
          alert("Hubo un error al agregar a favoritos.");
        }
      } catch (error) {
        console.error(error);
        favButton.disabled = false;
        favButton.textContent = "Agregar a Favoritos";
        alert("Error al agregar a favoritos.");
      }
    });

  } catch (error) {
    console.error("Error al cargar la mascota:", error);
  }
});
