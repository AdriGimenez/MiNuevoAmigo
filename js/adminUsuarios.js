import { getUsers, createUser, updateUser, deleteUser } from "./airtable.js";

// --- Elementos del DOM ---
const tablaBody = document.getElementById("usuarios-body");
const btnAdd = document.getElementById("btn-add");
const formContainer = document.getElementById("form-container");
const formTitle = document.getElementById("form-title");
const inputEmail = document.getElementById("correo");
const inputNombre = document.getElementById("nombre");
const selectRol = document.getElementById("rol");
const btnGuardar = document.getElementById("btn-guardar"); // Renombrado en HTML
const btnCancelar = document.getElementById("btn-cancelar"); // Renombrado en HTML

// Variable para almacenar el ID del usuario si estamos en modo edición
let editingUserId = null;

// --- Funciones de Utilidad y UI ---

function limpiarFormulario() {
    inputEmail.value = "";
    inputNombre.value = "";
    selectRol.value = "usuario";
    editingUserId = null;
    formTitle.textContent = "Nuevo Usuario";
    btnGuardar.textContent = "Guardar";
    // Habilitamos el input de Correo/Email al crear
    inputEmail.disabled = false; 
}

function mostrarFormulario(modoEdicion = false, userData = {}) {
    limpiarFormulario();
    if (modoEdicion) {
        editingUserId = userData.id;
        formTitle.textContent = "Editar Usuario";
        btnGuardar.textContent = "Actualizar";
        inputEmail.value = userData.fields.email || "";
        inputNombre.value = userData.fields.username || "";
        selectRol.value = userData.fields.role || "usuario";
        // Deshabilitamos el input de Correo/Email al editar (suele ser la clave)
        inputEmail.disabled = true; 
    }
    formContainer.classList.remove("hidden");
}

function ocultarFormulario() {
    formContainer.classList.add("hidden");
    limpiarFormulario();
}

// --- Manejo de la Tabla ---

async function cargarUsuarios() {
    tablaBody.innerHTML = ""; // Limpiar tabla

    try {
        const usuariosData = await getUsers(); // Traemos los usuarios
        // Usamos .records si Airtable devuelve el array dentro de esa propiedad
        const usuarios = usuariosData.records; 

        if (!usuarios || usuarios.length === 0) {
            tablaBody.innerHTML = `<tr><td colspan="4">No hay usuarios registrados</td></tr>`;
            return;
        }

        usuarios.forEach(user => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${user.fields.username || "-"}</td>
                <td>${user.fields.email || "-"}</td>
                <td>${user.fields.role || "usuario"}</td>
                <td>
                    <button id="btn-edit" class="button " data-action="edit" data-id="${user.id}">Editar</button>
                    <button id="btn-delete" class="button " data-action="delete" data-id="${user.id}" data-nombre="${user.fields.username}">Eliminar</button>
                </td>
            `;
            tablaBody.appendChild(tr);
        });
        
        // Asignar listeners a los nuevos botones
        asignarListenersAcciones();

    } catch (error) {
        console.error("Error al cargar usuarios:", error);
        tablaBody.innerHTML = `<tr><td colspan="4">Error al cargar usuarios</td></tr>`;
    }
}

function asignarListenersAcciones() {
    tablaBody.querySelectorAll('[data-action]').forEach(button => {
        button.removeEventListener('click', manejarAccionUsuario); // Evitar duplicados
        button.addEventListener('click', manejarAccionUsuario);
    });
}

async function manejarAccionUsuario(event) {
    const button = event.target;
    const action = button.dataset.action;
    const userId = button.dataset.id;
    const userName = button.dataset.nombre;

    if (action === "edit") {
        try {
            const usuariosData = await getUsers();
            const usuarioAEditar = usuariosData.records.find(u => u.id === userId);

            if (usuarioAEditar) {
                mostrarFormulario(true, usuarioAEditar);
            } else {
                alert("Usuario no encontrado.");
            }
        } catch (error) {
            console.error("Error al buscar usuario para editar:", error);
            alert("Error al intentar editar el usuario.");
        }

    } else if (action === "delete") {
        if (confirm(`¿Estás seguro de que quieres eliminar al usuario ${userName}?`)) {
            await eliminarUsuario(userId);
        }
    }
}

// --- Funciones de Airtable (CRUD) ---

async function guardarUsuario() {
    const email = inputEmail.value.trim();
    const username = inputNombre.value.trim();
    const role = selectRol.value;

    if (!email || !username) {
        alert("El correo y el nombre son obligatorios.");
        return;
    }

    try {
        if (editingUserId) {
            // Modo edición
            const fieldsToUpdate = {
                username: username,
                role: role
            };
            await updateUser(editingUserId, fieldsToUpdate);
            alert("Usuario actualizado con éxito.");
        } else {
            await createUser(username, email, "0408"); 
            alert("Usuario creado con éxito.");
        }
        
        ocultarFormulario();
        await cargarUsuarios(); // Recargar la tabla para ver los cambios

    } catch (error) {
        console.error("Error al guardar/actualizar usuario:", error);
        alert(`Error al guardar el usuario: ${error.message}`);
    }
}

async function eliminarUsuario(userId) {
    try {
        await deleteUser(userId);
        alert("Usuario eliminado con éxito.");
        await cargarUsuarios(); // Recargar la tabla
    } catch (error) {
        console.error("Error al eliminar usuario:", error);
        alert(`Error al eliminar el usuario: ${error.message}`);
    }
}


// --- Listeners de Eventos ---

btnAdd.addEventListener("click", () => mostrarFormulario(false)); // Abrir para Agregar
btnCancelar.addEventListener("click", ocultarFormulario); // Ocultar
btnGuardar.addEventListener("click", guardarUsuario); // Guardar/Actualizar

// --- Carga Inicial ---
cargarUsuarios();