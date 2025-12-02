import { getPets, createSolicitud } from "./airtable.js";

document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const mascotaId = params.get("id");
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
        alert("Por favor, inicia sesión para adoptar una mascota.");
        window.location.href = "login.html";
        return;
    }

    if (!mascotaId) {
        alert("ID de mascota no proporcionado.");
        window.location.href = "mascotas.html";
        return;
    }

    // Obtener datos de la mascota
    const fetchMascotaData = async (id) => {
        try {
            const petsData = await getPets();
            const record = petsData.records.find(p => p.id === id);

            if (!record) throw new Error("Mascota no encontrada");
            return record.fields;
        } catch (err) {
            console.error("Error al obtener datos de mascota:", err);
            return null;
        }
    };

    const mascotaFields = await fetchMascotaData(mascotaId);
    const container = document.getElementById("adoption-mascota-details");

    if (!mascotaFields) {
        container.innerHTML = "<p>Error al cargar los detalles de la mascota.</p>";
        return;
    }

    // Mostrar tarjeta
    container.innerHTML = `
        <div class="adoption-mascota-card">
            <div class="adoption-mascota-img">
                <img src="${mascotaFields.image?.[0]?.url || ""}" alt="${mascotaFields.name}">
            </div>
            <div class="adoption-mascota-details">
                <h3>${mascotaFields.name}</h3>
                <p><strong>Raza:</strong> ${mascotaFields.breed}</p>
                <p><strong>Edad:</strong> ${mascotaFields.age || "Sin datos"}</p>
            </div>
        </div>
    `;

    // Formulario
    const form = document.getElementById("adoption-form");
    const submitButton = form.querySelector("button[type='submit']");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        submitButton.disabled = true;
        submitButton.textContent = "Enviando...";

        const formData = new FormData(form);
        const telefono = formData.get("telefono");
        const direccion = formData.get("direccion");
        const motivo = formData.get("motivo");

        const body = {
            usuario: [user.id],     // ← CORRECTO AHORA
            mascota: [mascotaId],   // ← CORRECTO AHORA
            telefono,
            direccion,
            mensaje: motivo,
            estado: "pendiente"
        };

        try {
            await createSolicitud(body);
            window.location.href = "solicitudes.html";
        } catch (err) {
            console.error("Error al crear solicitud:", err);
            alert("Hubo un error al enviar la solicitud.");
            submitButton.disabled = false;
            submitButton.textContent = "Enviar Solicitud";
        }
    });
});
