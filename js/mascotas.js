document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("mascotaContainer");
  const filterList = document.querySelector(".mascota-filter ul");

  let mascotasData = [];

  try {
    const response = await fetch("./data/mascotas.json");
    mascotasData = await response.json();

    // Obtener categorías únicas del JSON
    const categorias = [...new Set(mascotasData.map(m => m.category))];

    // Agregar "Todos" al principio
    categorias.unshift("Todos");

    // Generar los filtros en el HTML
    categorias.forEach(categoria => {
      const li = document.createElement("li");
      li.textContent = categoria;
      filterList.appendChild(li);
    });

    // Función para mostrar mascotas
    const mostrarMascotas = (mascotas) => {
      container.innerHTML = "";
      mascotas.forEach(mascota => {
        const article = document.createElement("article");
        article.classList.add("mascota-item");

        article.innerHTML = `
          <div class="mascota-info-hover">
            <svg class="mascota-like" viewBox="0 0 24 24">
              <path fill="#6A0DAD" d="M12.1,18.55L12,18.65L11.89,18.55C7.14,14.24 4,11.39 4,8.5C4,6.5 5.5,5 7.5,5C9.04,5 10.54,6 11.07,7.36H12.93C13.46,6 14.96,5 16.5,5C18.5,5 20,6.5 20,8.5C20,11.39 16.86,14.24 12.1,18.55M16.5,3C14.76,3 13.09,3.81 12,5.08C10.91,3.81 9.24,3 7.5,3C4.42,3 2,5.41 2,8.5C2,12.27 5.4,15.36 10.55,20.03L12,21.35L13.45,20.03C18.6,15.36 22,12.27 22,8.5C22,5.41 19.58,3 16.5,3Z"/>
            </svg>
          </div>
          <div class="mascota-img" style="background-image: url('${mascota.image}')"></div>
          <div class="mascota-img-hover" style="background-image: url('${mascota.image}')"></div>
          <div class="mascota-info">
            <span class="mascota-category">${mascota.name}</span>
            <h3 class="mascota-title">Raza: ${mascota.breed}</h3>
            <a href="./mascota-detail.html?id=${mascota.id}" class="button">Adoptar</a>
          </div>
        `;
        container.appendChild(article);
      });
    };

    // Mostrar todas al inicio
    mostrarMascotas(mascotasData);

    // Filtrar al hacer click en cada li
    const filterItems = document.querySelectorAll(".mascota-filter li");
    filterItems.forEach(item => {
      item.addEventListener("click", () => {
        const categoria = item.textContent;
        if (categoria === "Todos") {
          mostrarMascotas(mascotasData);
        } else {
          const filtradas = mascotasData.filter(m => m.category === categoria);
          mostrarMascotas(filtradas);
        }
      });
    });

  } catch (error) {
    console.error("Error al cargar las mascotas:", error);
    container.innerHTML = `<p>Error al cargar las mascotas.</p>`;
  }
});
