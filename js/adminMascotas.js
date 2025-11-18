import { AIRTABLE_TOKEN, BASE_ID } from "./env.js";

const TABLE_NAME = "Mascotas";

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

const previewImg = document.getElementById("preview-img");

const btnCancelar = document.getElementById("btn-cancelar");
const petsBody = document.getElementById("pets-table-body");
const formTitle = document.getElementById("form-title");

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


async function loadPets() {
  const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` }
  });

  const data = await res.json();

  petsBody.innerHTML = "";

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
        <button class="btn-edit" data-id="${record.id}">Editar</button>
        <button class="btn-delete" data-id="${record.id}">Eliminar</button>
      </td>
    `;

    petsBody.appendChild(tr);
  });

  addRowEvents();
}

loadPets();

function addRowEvents() {

  document.querySelectorAll(".btn-edit").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;

      const res = await fetch(
        `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}/${id}`,
        { headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` } }
      );

      const data = await res.json();
      const m = data.fields;

      petId.value = id;
      nameInput.value = m.name || "";
      ageInput.value = m.age || "";
      categoryInput.value = m.category || "";
      breedInput.value = m.breed || "";
      sizeInput.value = m.size || "";
      genderInput.value = m.gender || "";
      storyInput.value = m.story || "";
      imageInput.value = m.image || "";

      if (m.image) {
        previewImg.src = m.image;
        previewImg.classList.remove("hidden");
      } else {
        previewImg.classList.add("hidden");
      }

      formTitle.textContent = "Editar Mascota";
      formCard.classList.remove("hidden");
    });
  });

  document.querySelectorAll(".btn-delete").forEach(btn => {
    btn.addEventListener("click", async () => {
      if (!confirm("¿Seguro que querés eliminar esta mascota?")) return;

      const id = btn.dataset.id;

      await fetch(
        `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` }
        }
      );

      loadPets();
    });
  });
}


form.addEventListener("submit", async e => {
  e.preventDefault();

  const id = petId.value;

  const mascota = {
    name: nameInput.value,
    age: ageInput.value,
    category: categoryInput.value,
    breed: breedInput.value,
    size: sizeInput.value,
    gender: genderInput.value,
    story: storyInput.value,
    image: imageInput.value
  };

  const url = id
    ? `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}/${id}`
    : `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`;

  const method = id ? "PATCH" : "POST";

  await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${AIRTABLE_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ fields: mascota })
  });

  formCard.classList.add("hidden");
  form.reset();
  previewImg.classList.add("hidden");

  loadPets();
});
