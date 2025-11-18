import { AIRTABLE_TOKEN, BASE_ID } from "./env.js";

const tablaUsuarios = "Usuarios"; // Nombre de la tabla en Airtable

// Elementos del DOM
const tablaBody = document.getElementById("usuarios-body");
const btnAdd = document.getElementById("btn-add");
const formContainer = document.getElementById("form-container");
const btnGuardar = document.getElementById("btn-guardar");
const btnCancelar = document.getElementById("btn-cancelar");

const inputUsername = document.getElementById("nombre");  // AHORA username
const inputEmail = document.getElementById("correo");     // email
const inputRol = document.getElementById("rol");          // role

let editID = null;

/* ============================================================
   MOSTRAR FORMULARIO: Nuevo Usuario
   ============================================================ */
btnAdd.addEventListener("click", () => {
  editID = null;
  document.getElementById("form-title").textContent = "Nuevo Usuario";
  limpiarFormulario();
  formContainer.classList.remove("hidden");
});

/* ============================================================
   CANCELAR FORMULARIO
   ============================================================ */
btnCancelar.addEventListener("click", () => {
  formContainer.classList.add("hidden");
  limpiarFormulario();
});

/* ============================================================
   CARGAR USUARIOS DESDE AIRTABLE
   ============================================================ */
async function cargarUsuarios() {
  tablaBody.innerHTML = "";

  const response = await fetch(
    `https://api.airtable.com/v0/${BASE_ID}/${tablaUsuarios}`,
    {
      headers: {
        Authorization: `Bearer ${AIRTABLE_TOKEN}`,
      },
    }
  );

  const data = await response.json();

  data.records.forEach((record) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${record.fields.username || "-"}</td>
      <td>${record.fields.email || "-"}</td>
      <td>${record.fields.role || "usuario"}</td>
      <td>
        <button class="btn-edit" data-id="${record.id}">Editar</button>
        <button class="btn-delete" data-id="${record.id}">Eliminar</button>
      </td>
    `;

    tablaBody.appendChild(tr);
  });

  agregarEventosAcciones();
}

/* ============================================================
   AGREGAR EVENTOS DE EDITAR Y ELIMINAR
   ============================================================ */
function agregarEventosAcciones() {
  document
    .querySelectorAll(".btn-edit")
    .forEach((btn) => btn.addEventListener("click", () => editarUsuario(btn.dataset.id)));

  document
    .querySelectorAll(".btn-delete")
    .forEach((btn) => btn.addEventListener("click", () => eliminarUsuario(btn.dataset.id)));
}

/* ============================================================
   EDITAR USUARIO
   ============================================================ */
async function editarUsuario(id) {
  editID = id;

  const response = await fetch(
    `https://api.airtable.com/v0/${BASE_ID}/${tablaUsuarios}/${id}`,
    {
      headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` },
    }
  );

  const data = await response.json();

  inputUsername.value = data.fields.username || "";
  inputEmail.value = data.fields.email || "";
  inputRol.value = data.fields.role || "usuario";

  document.getElementById("form-title").textContent = "Editar Usuario";
  formContainer.classList.remove("hidden");
}

/* ============================================================
   GUARDAR USUARIO
   ============================================================ */
btnGuardar.addEventListener("click", async () => {
  const fields = {
    username: inputUsername.value.trim(),
    email: inputEmail.value.trim(),
    role: inputRol.value.trim(),
  };

  const method = editID ? "PATCH" : "POST";

  const url = editID
    ? `https://api.airtable.com/v0/${BASE_ID}/${tablaUsuarios}/${editID}`
    : `https://api.airtable.com/v0/${BASE_ID}/${tablaUsuarios}`;

  await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${AIRTABLE_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fields }),
  });

  formContainer.classList.add("hidden");
  limpiarFormulario();
  cargarUsuarios();
});

/* ============================================================
   ELIMINAR USUARIO
   ============================================================ */
async function eliminarUsuario(id) {
  if (!confirm("¿Eliminar este usuario?")) return;

  await fetch(
    `https://api.airtable.com/v0/${BASE_ID}/${tablaUsuarios}/${id}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` },
    }
  );

  cargarUsuarios();
}

/* ============================================================
   LIMPIAR FORMULARIO
   ============================================================ */
function limpiarFormulario() {
  inputUsername.value = "";
  inputEmail.value = "";
  inputRol.value = "usuario";
}

/* ============================================================
   INICIALIZAR
   ============================================================ */
cargarUsuarios();
