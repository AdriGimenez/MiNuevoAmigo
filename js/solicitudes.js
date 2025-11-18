import { AIRTABLE_TOKEN, BASE_ID } from "./env.js";

document.addEventListener("DOMContentLoaded", async () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const container = document.getElementById("solicitudesContainer");

  if (!user) {
    container.innerHTML = "<p>Debes iniciar sesión para ver tus solicitudes.</p>";
    return;
  }

  try {
    // Traemos todas las solicitudes del usuario loggeado
    const response = await fetch(
      `https://api.airtable.com/v0/${BASE_ID}/Solicitudes?filterByFormula={usuario}='${user.username}'`,
      {
        headers: {
          Authorization: `Bearer ${AIRTABLE_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );

    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    const data = await response.json();
    const solicitudes = data.records;

    if (solicitudes.length === 0) {
      container.innerHTML = "<p>No hay solicitudes registradas.</p>";
      return;
    }

    container.innerHTML = "";

    // Recorremos cada solicitud y obtenemos el nombre de la mascota
    for (const solicitud of solicitudes) {
      const fields = solicitud.fields;
      let mascotaName = "Sin datos";

      if (fields.mascota && fields.mascota.length > 0) {
        const mascotaId = fields.mascota[0];
        const mascotaRes = await fetch(
          `https://api.airtable.com/v0/${BASE_ID}/Mascotas/${mascotaId}`,
          {
            headers: {
              Authorization: `Bearer ${AIRTABLE_TOKEN}`,
              "Content-Type": "application/json"
            }
          }
        );
        const mascotaData = await mascotaRes.json();
        mascotaName = mascotaData.fields?.name || "Sin datos";
      }

      container.innerHTML += `
        <div class="solicitud-item">
          <h3>Mascota: ${mascotaName}</h3>
          <p><strong>Estado:</strong> ${fields.estado || "Pendiente"}</p>
          <p><strong>Mensaje:</strong> ${fields.mensaje || ""}</p>
          <p><strong>Teléfono:</strong> ${fields.telefono || ""}</p>
          <p><strong>Dirección:</strong> ${fields.direccion || ""}</p>
        </div>
      `;
    }

  } catch (error) {
    console.error("Error al cargar las solicitudes:", error);
    container.innerHTML = "<p>Error al cargar las solicitudes.</p>";
  }
});
