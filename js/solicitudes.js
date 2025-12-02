import { getSolicitudesByUser, getPets } from "./airtable.js";

document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("solicitudesContainer");
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    container.innerHTML = "<p>Por favor, inicia sesión para ver tus solicitudes.</p>";
    return;
  }

  const fetchMascotaData = async (mascotaId) => {
    const petsData = await getPets();
    return petsData.records.find(p => p.id === mascotaId)?.fields || null;
  };

  const renderSolicitudes = async () => {
    container.innerHTML = "";
    let solicitudesRecords;

    try {
      solicitudesRecords = await getSolicitudesByUser(user.username);
    } catch (error) {
      console.error("Error al cargar solicitudes:", error);
      container.innerHTML = `
        <div class="favoritos-empty">
          <p class="patas">⚠️</p>
          <p class="mensaje">Error al cargar las solicitudes 😿</p>
        </div>
      `;
      return;
    }

    if (!solicitudesRecords || solicitudesRecords.length === 0) {
      container.innerHTML = `
        <div class="favoritos-empty">
          <p class="patas">🐾</p>
          <p class="mensaje">No tienes solicitudes realizadas aún 🐾</p>
          <a href="./mascotas.html" class="boton-ver">Ver Mascotas</a>
        </div>
      `;
      return;
    }

    for (const solicitud of solicitudesRecords) {
      const mascotaId = Array.isArray(solicitud.fields.mascota)
        ? solicitud.fields.mascota[0]
        : solicitud.fields.mascota;

      const fields = await fetchMascotaData(mascotaId);
      if (!fields) continue;

      // Variables para la mascota
      const mascotaImg = fields.image?.[0]?.url || "ruta-default.png";
      const mascotaName = fields.name || "Mascota sin nombre";

      // Variables para la solicitud
      const estado = solicitud.fields.estado || "Pendiente";

      const article = document.createElement("article");
      article.classList.add("solicitud-item");

      article.innerHTML += `
          <div class="solicitud-header">
            <img src="${mascotaImg}" alt="Imagen de ${mascotaName}" class="solicitud-img"/>
            <h3> Mascota: ${mascotaName} </h3>
          </div>
          <p><strong>Estado:</strong> ${estado}</p>
      `;

      container.appendChild(article);
    }
  };

  await renderSolicitudes();
});
