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

    const mascotaUrl = `https://api.airtable.com/v0/${BASE_ID}/Mascotas/${mascotaId}`;

    try {
        const res = await fetch(mascotaUrl, {
            headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` }
        });
        const data = await res.json();

        const cont = document.getElementById("adoption-mascota-details");
        cont.innerHTML = `
            <div class="adoption-mascota-card">
                <div class="adoption-mascota-img">
                    <img src="${data.fields.image?.[0]?.url || ""}" alt="${data.fields.name}">
                </div>
                <div class="adoption-mascota-details">
                    <h3>${data.fields.name}</h3>
                    <p><strong>Raza:</strong> ${data.fields.breed}</p>
                    <p><strong>Edad:</strong> ${data.fields.age || "Sin datos"}</p>
                </div>
            </div>
        `;
    } catch (error) {
        console.error("Error cargando mascota:", error);
        document.getElementById("adoption-mascota-details").innerHTML =
            "<p>Error al cargar la mascota.</p>";
    }

    const form = document.getElementById("adoption-form");
    const submitButton = form.querySelector('button[type="submit"]');

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        submitButton.disabled = true;
        submitButton.textContent = "Enviando...";

        const formData = new FormData(form);
        const telefono = formData.get("telefono");
        const direccion = formData.get("direccion");
        const mensaje = formData.get("motivo");

        const body = {
            fields: {
                usuario: [user.id],
                mascota: [mascotaId],
                telefono,
                direccion,
                mensaje,
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
                window.location.href = "solicitudes.html";
            } else {
                console.error(await response.text());
                alert("Hubo un error al enviar la solicitud.");
                submitButton.disabled = false;
                submitButton.textContent = "Enviar solicitud";
            }
        } catch (error) {
            console.error(error);
            alert("Error en la solicitud.");
            submitButton.disabled = false;
            submitButton.textContent = "Enviar solicitud";
        }
    });
});
