import { getPets, createPet } from "./airtable.js";
import { AIRTABLE_TOKEN, BASE_ID } from "./env.js";

const formCard = document.getElementById("form-card");
const petsTableBody = document.getElementById("pets-table-body");
const petForm = document.getElementById("pet-form");

// Mostrar/Ocultar el formulario
document.getElementById("btn-add").addEventListener("click", () => {
    document.getElementById("form-title").textContent = "Agregar Mascota";
    petForm.reset();
    document.getElementById("pet-id").value = "";
    formCard.classList.remove("hidden");
});

document.getElementById("btn-cancel").addEventListener("click", () => {
    formCard.classList.add("hidden");
});

// Cargar mascotas al iniciar
async function loadPets() {
    const data = await getPets();
    petsTableBody.innerHTML = "";

    data.records.forEach(pet => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${pet.fields.name || ""}</td>
            <td>${pet.fields.age || ""}</td>
            <td>${pet.fields.category || ""}</td>
            <td>${pet.fields.breed || ""}</td>
            <td>${pet.fields.size || ""}</td>
            <td>${pet.fields.gender || ""}</td>

            <td>
                <button class="btn-edit" data-id="${pet.id}">Editar</button>
                <button class="btn-delete" data-id="${pet.id}">Eliminar</button>
            </td>
        `;

        petsTableBody.appendChild(row);
    });

    // Editar
    document.querySelectorAll(".btn-edit").forEach(btn => {
        btn.addEventListener("click", async () => {
            const id = btn.dataset.id;
            const pet = data.records.find(p => p.id === id);

            document.getElementById("form-title").textContent = "Editar Mascota";

            document.getElementById("pet-id").value = id;
            document.getElementById("name").value = pet.fields.name || "";
            document.getElementById("age").value = pet.fields.age || "";
            document.getElementById("category").value = pet.fields.category || "";
            document.getElementById("breed").value = pet.fields.breed || "";
            document.getElementById("size").value = pet.fields.size || "";
            document.getElementById("gender").value = pet.fields.gender || "";
            document.getElementById("story").value = pet.fields.story || "";
            document.getElementById("image").value = pet.fields.image?.[0]?.url || "";

            formCard.classList.remove("hidden");
        });
    });

    // Eliminar
    document.querySelectorAll(".btn-delete").forEach(btn => {
        btn.addEventListener("click", async () => {
            if (!confirm("¿Eliminar esta mascota?")) return;

            const id = btn.dataset.id;

            await fetch(`https://api.airtable.com/v0/${BASE_ID}/tblSbsLzVV7LE2Iwq/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` }
            });

            loadPets();
        });
    });
}

loadPets();

// Guardar Mascota
petForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = document.getElementById("pet-id").value;

    const fields = {
        name: document.getElementById("name").value.trim(),
        age: document.getElementById("age").value.trim(),
        category: document.getElementById("category").value.trim(),
        breed: document.getElementById("breed").value.trim(),
        size: document.getElementById("size").value.trim(),
        gender: document.getElementById("gender").value.trim(),
        story: document.getElementById("story").value.trim(),
        image: document.getElementById("image").value ? [{ url: document.getElementById("image").value }] : []
    };

    if (id) {
        // EDITAR
        await fetch(`https://api.airtable.com/v0/${BASE_ID}/tblSbsLzVV7LE2Iwq/${id}`, {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${AIRTABLE_TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ fields })
        });

    } else {
        // CREAR
        await createPet(fields);
    }

    formCard.classList.add("hidden");
    loadPets();
});
