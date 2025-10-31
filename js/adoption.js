document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) return;

  try {
    const response = await fetch("./data/mascotas.json");
    const mascotas = await response.json();

    const mascota = mascotas.find(m => m.id == id);
    if (!mascota) {
      document.getElementById("mascota-info").innerHTML = "<p>Mascota no encontrada</p>";
      return;
    }

    const infoContainer = document.getElementById("mascota-info");
    infoContainer.innerHTML = `
      <div class="adoption-mascota-card">
        <div class="adoption-mascota-img">
          <img src="${mascota.image}" alt="${mascota.name}">
        </div>
        <div class="adoption-mascota-details">
          <h3>${mascota.name}</h3>
          <p><strong>Edad:</strong> ${mascota.age}</p>
          <p><strong>Raza:</strong> ${mascota.breed}</p>
          <p class="story">${mascota.story}</p>
        </div>
      </div>
    `;
  } catch (error) {
    console.error("Error al cargar la mascota:", error);
  }

  // Evitar que el formulario recargue la página
  const form = document.getElementById("adoption-form");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    alert("Formulario enviado correctamente (simulado)");
  });
});
