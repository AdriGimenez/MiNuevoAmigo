import { 
    getPets, 
    getPet, 
    createPet, 
    updatePet, 
    deletePet 
} from "./airtable.js"; 
// La importación de env.js, BASE_ID y TABLE_NAME ya no es necesaria aquí.

// --- Elementos del DOM (El mismo que tenías) ---
const btnAdd = document.getElementById("btn-add");
const formCard = document.getElementById("form-card");
const form = document.getElementById("pet-form");
const petId = document.getElementById("pet-id");
const nameInput = document.getElementById("name");
const ageInput = document.getElementById("age");
const categoryInput = document.getElementById("category");
const breedInput = document.getElementById("breed");
const sizeInput = document.getElementById("size");
const genderInput = document.getElementById("gender");
const storyInput = document.getElementById("story");
const imageInput = document.getElementById("image");
const imageFile = document.getElementById("image-file");
const previewImg = document.getElementById("preview-img");
const btnCancelar = document.getElementById("btn-cancelar"); 
const petsBody = document.getElementById("pets-body");
const formTitle = document.getElementById("form-title");

// --- 1. CONFIGURACIÓN DE CLOUDINARY
const CLOUD_NAME = "dyfkecv5p"; 
const UPLOAD_PRESET = "mascotas_preset";
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

// --- Eventos de UI (Sin cambios) ---
imageFile.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
        previewImg.src = URL.createObjectURL(file);
        previewImg.classList.remove("hidden");
    } else {
        previewImg.classList.add("hidden");
    }
});
imageInput.addEventListener("input", () => {
    const url = imageInput.value.trim();
    if (!url) {
        previewImg.src = "";
        previewImg.classList.add("hidden");
        return;
    }
    previewImg.src = url;
    previewImg.classList.remove("hidden");
});

btnAdd.addEventListener("click", () => {
    form.reset();
    previewImg.classList.add("hidden");
    petId.value = "";
    formTitle.textContent = "Agregar Mascota";
    formCard.classList.remove("hidden");
});

btnCancelar.addEventListener("click", () => {
    formCard.classList.add("hidden");
});

// Función principal para subir el archivo a Cloudinary
async function uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    try {
        console.log("Iniciando subida a Cloudinary...");
        
        const response = await fetch(CLOUDINARY_UPLOAD_URL, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error de Cloudinary:', errorData);
            throw new Error(`Fallo al subir el archivo: ${errorData.error.message || response.statusText}`);
        }

        const data = await response.json();
        return data.secure_url;

    } catch (error) {
        console.error("Error durante la subida:", error);
        alert("Error crítico al subir la imagen. Por favor, revisa tu Cloud Name y Upload Preset.");
        return null;
    }
}

function limpiarFormulario() {
    form.reset();
    previewImg.classList.add("hidden");
    petId.value = "";
    imageInput.value = ""; // Limpiamos el campo oculto de URL
}
// --- Funciones CRUD de Mascota (Refactorizadas) ---

async function loadPets() {
    try {
        // === REFACTORIZADO: Usamos getPets() de airtable.js ===
        const data = await getPets(); 
        
        petsBody.innerHTML = "";
        
        if (!data.records || data.records.length === 0) {
             petsBody.innerHTML = `<tr><td colspan="7">No hay mascotas registradas</td></tr>`;
             return;
        }

        data.records.forEach(record => {
            const m = record.fields;
            const tr = document.createElement("tr");

            tr.innerHTML = `
                <td>${m.name || ""}</td>
                <td>${m.age || ""}</td>
                <td>${m.category || ""}</td>
                <td>${m.breed || ""}</td>
                <td>${m.size || ""}</td>
                <td>${m.gender || ""}</td>
                <td>
                    <button id="btn-edit" class="button" data-id="${record.id}">Editar</button>
                    <button id="btn-delete" class="button" data-id="${record.id}">Eliminar</button>
                </td>
            `;
            petsBody.appendChild(tr);
        });

        addRowEvents();

    } catch (error) {
        console.error("Error al cargar mascotas:", error);
        petsBody.innerHTML = `<tr><td colspan="7">Error al cargar mascotas</td></tr>`;
    }
}


function addRowEvents() {
    document.querySelectorAll(".btn-edit").forEach(btn => {
        btn.removeEventListener("click", handleEditClick); 
        btn.addEventListener("click", handleEditClick);
    });

    document.querySelectorAll(".btn-delete").forEach(btn => {
        btn.removeEventListener("click", handleDeleteClick); 
        btn.addEventListener("click", handleDeleteClick);
    });
}

async function handleEditClick() {
    const id = this.dataset.id;
    try {
        // === REFACTORIZADO: Usamos getPet(id) de airtable.js ===
        const data = await getPet(id); 
        const m = data.fields;
        
        limpiarFormulario();
        // Cargar datos en el formulario (mismo código)
        petId.value = id;
        nameInput.value = m.name || "";
        ageInput.value = m.age || "";
        categoryInput.value = m.category || "";
        breedInput.value = m.breed || "";
        sizeInput.value = m.size || "";
        genderInput.value = m.gender || "";
        storyInput.value = m.story || "";

        const firstImage = m.image && m.image.length > 0 ? m.image[0] : null;

        if (firstImage && firstImage.url) {
            // Guardamos la URL existente en el campo oculto
            imageInput.value = firstImage.url; 
            previewImg.src = firstImage.url;
            previewImg.classList.remove("hidden");
        }

        formTitle.textContent = "Editar Mascota";
        formCard.classList.remove("hidden");
    } catch (error) {
        alert("Error al obtener datos de la mascota para editar.");
        console.error("Error en Edición:", error);
    }
}

async function handleDeleteClick() {
    if (!confirm("¿Seguro que querés eliminar esta mascota?")) return;

    const id = this.dataset.id;
    try {
        // === REFACTORIZADO: Usamos deletePet(id) de airtable.js ===
        await deletePet(id); 
        alert("Mascota eliminada con éxito.");
        loadPets(); 
    } catch (error) {
        alert("Error al eliminar la mascota.");
        console.error("Error en Eliminación:", error);
    }
}


// --- Manejo del Formulario (Crear/Actualizar) ---

form.addEventListener("submit", async e => {
    e.preventDefault();

    const id = petId.value;
    const file = imageFile.files[0]; 
    let finalImageUrl = imageInput.value.trim();

    // 1. Manejo de la subida de archivos
    if (file) {
        // Se seleccionó un nuevo archivo (ya sea creando o editando)
        alert("Subiendo imagen a la nube... por favor espera.");
        
        const uploadedUrl = await uploadFile(file);
        
        if (!uploadedUrl) {
             return; // Detener el proceso si la subida falló
        }
        finalImageUrl = uploadedUrl;
    } else if (!id && !finalImageUrl) {
        // Si estamos CREANDO y no se seleccionó archivo
        alert("Debes seleccionar una imagen para la nueva mascota.");
        return; 
    }

    const mascota = {
        name: nameInput.value,
        age: ageInput.value,
        category: categoryInput.value,
        breed: breedInput.value,
        size: sizeInput.value,
        gender: genderInput.value,
        story: storyInput.value,
    };

    if (finalImageUrl) {
        mascota.image = [{ url: finalImageUrl }];
    } else {
        mascota.image = []; 
    }
    try {
        if (id) {
            // === REFACTORIZADO: Usamos updatePet(id, mascota) de airtable.js ===
            await updatePet(id, mascota);
            alert("Mascota actualizada con éxito.");
        } else {
            // === REFACTORIZADO: Usamos createPet(mascota) de airtable.js ===
            await createPet(mascota);
            alert("Mascota agregada con éxito.");
        }
    } catch (error) {
        alert(`Error al ${id ? "actualizar" : "agregar"} la mascota.`);
        console.error("Error en Guardado:", error);
    }
    
    // Limpiar y Ocultar
    formCard.classList.add("hidden");
    form.reset();
    previewImg.classList.add("hidden");

    loadPets();
});

// --- Carga Inicial ---
loadPets();