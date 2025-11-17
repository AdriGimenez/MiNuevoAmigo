import { AIRTABLE_API_KEY, BASE_ID } from "./airtable-secret.js";

document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("mascotaContainer");
  const filterList = document.querySelector(".mascota-filter ul");
  const searchInput = document.getElementById("searchInput");

  let mascotasData = [];
  let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];

  const airtableUrl = `https://api.airtable.com/v0/${BASE_ID}/Mascotas`;

  async function getMascotas() {
    try {
      const response = await fetch(airtableUrl, {
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          "Content-Type": "application/json"
        }
      });
      const data = await response.json();

      // Mapeo de registros
      mascotasData = data.records.map(item => ({
        id: item.id,
        name: item.fields.name,
        breed: item.fields.breed,
        category: item.fields.category,
        image: item.fields.image || []
      }));

      renderMascotas(mascotasData);
      renderCategorias();
    } catch (error) {
      console.error("Error al cargar las mascotas:", error);
      container.innerHTML = `<p>Error al cargar las mascotas.</p>`;
    }
  }

  function renderMascotas(mascotas) {
    container.innerHTML = "";
    mascotas.forEach(mascota => {
      const esFavorito = favoritos.includes(mascota.id);
      const article = document.createElement("article");
      article.classList.add("mascota-item");

      article.innerHTML = `
        <button class="mascota-like ${esFavorito ? "activo" : ""}" data-id="${mascota.id}">
          <svg viewBox="0 0 24 24" width="24" height="24" class="icono-corazon">
            <path fill="#000000" d="M12.1,18.55L12,18.65L11.89,18.55C7.14,14.24 4,11.39 
            4,8.5C4,6.5 5.5,5 7.5,5C9.04,5 10.54,6 11.07,7.36H12.93C13.46,6 14.96,5 16.5,5C18.5,5 
            20,6.5 20,8.5C20,11.39 16.86,14.24 12.1,18.55M16.5,3C14.76,3 13.09,3.81 12,5.08C10.91,3.81 
            9.24,3 7.5,3C4.42,3 2,5.41 2,8.5C2,12.27 5.4,15.36 10.55,20.03L12,21.35L13.45,20.03C18.6,15.36 
            22,12.27 22,8.5C22,5.41 19.58,3 16.5,3Z" />
          </svg>
        </button>

        <div class="mascota-img" style="background-image: url('${mascota.image[0]?.url || ''}')"></div>
        <div class="mascota-img-hover" style="background-image: url('${mascota.image[0]?.url || ''}')"></div>
        <div class="mascota-info">
          <span class="mascota-category">${mascota.name}</span>
          <h3 class="mascota-title">Raza: ${mascota.breed}</h3>
          <a href="./mascota-detail.html?id=${mascota.id}" class="button">Adoptar</a>
        </div>
      `;
      container.appendChild(article);
    });

    agregarEventosFavoritos();
  }

  function agregarEventosFavoritos() {
    const corazones = document.querySelectorAll(".mascota-like");
    corazones.forEach(icono => {
      icono.addEventListener("click", () => {
        const id = icono.dataset.id;
        toggleFavorito(id);
        icono.classList.toggle("activo");
      });
    });
  }

  function toggleFavorito(id) {
    if (favoritos.includes(id)) {
      favoritos = favoritos.filter(f => f !== id);
    } else {
      favoritos.push(id);
    }
    localStorage.setItem("favoritos", JSON.stringify(favoritos));
  }

  function renderCategorias() {
    const categorias = [...new Set(mascotasData.map(m => m.category))];
    categorias.unshift("Todos");

    categorias.forEach(categoria => {
      const li = document.createElement("li");
      li.textContent = categoria;
      li.addEventListener("click", () => {
        if (categoria === "Todos") {
          renderMascotas(mascotasData);
        } else {
          const filtradas = mascotasData.filter(m => m.category === categoria);
          renderMascotas(filtradas);
        }
      });
      filterList.appendChild(li);
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const term = e.target.value.toLowerCase();
      const filtradas = mascotasData.filter(m =>
        m.name.toLowerCase().includes(term) ||
        m.breed.toLowerCase().includes(term)
      );
      renderMascotas(filtradas);
    });
  }

  // ejecutar fetch
  getMascotas();
});
