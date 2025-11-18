import { AIRTABLE_TOKEN, BASE_ID } from "./env.js";

document.addEventListener("DOMContentLoaded", async () => {

    const params = new URLSearchParams(window.location.search);
    const mascotaId = params.get("id");

    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
        alert("Debes iniciar sesión para enviar una solicitud.");
        window.location.href = "login.html";
        return;
    }

    // ===============================
    // 1. CARGAR INFO DE LA MASCOTA
    // ===============================

    const mascotaUrl = `https://api.airtable.com/v0/${BASE_ID}/Mascotas/${mascotaId}`;

    try {
        const res = await fetch(mascotaUrl, {
            headers: {
                Authorization: `Bearer ${AIRTABLE_TOKEN}`
            }
        });

        const data = await res.json();

        const mascotaInfo = document.getElementById("mascota-info");
        mascotaInfo.innerHTML = `
            <div class="mascota-detail-card">
                <img src="${data.fields.image?.[0]?.url || ""}">
                <h2>${data.fields.name}</h2>
                <p>Raza: ${data.fields.breed}</p>
                <p>Edad: ${data.fields.age || "Sin datos"}</p>
            </div>
        `;
    } catch (error) {
        console.error("Error cargando mascota:", error);
    }

    // ===============================
    // 2. ENVIAR FORMULARIO
    // ===============================

    const form = document.getElementById("adoption-form");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const formData = new FormData(form);

        const nombre = formData.get("nombre");
        const email = formData.get("email");
        const telefono = formData.get("telefono");
        const direccion = formData.get("direccion");
        const motivo = formData.get("motivo");

        // ARMAR CUERPO PARA AIRTABLE (todo minúscula)
        const body = {
            fields: {
                usuario: [user.id],
                mascota: [mascotaId],
                nombre,
                email,
                telefono,
                direccion,
                motivo,
                estado: "pendiente"
            }
        };

        try {
            const response = await fetch(
                `https://api.airtable.com/v0/${BASE_ID}/Solicitudes`,
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
                alert("Solicitud enviada con éxito.");
                window.location.href = "mascotas.html";
            } else {
                console.error(await response.text());
                alert("Hubo un error al enviar la solicitud.");
            }

        } catch (error) {
            console.error(error);
            alert("Error en la solicitud.");
        }
    });
});
