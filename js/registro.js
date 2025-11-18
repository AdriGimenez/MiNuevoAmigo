// registro.js
import { createUser } from "./airtable.js";

document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector(".register-form");

    // Crear un contenedor para mensajes dentro del formulario
    const messageEl = document.createElement("p");
    messageEl.id = "register-message";
    messageEl.className = "message";
    form.appendChild(messageEl);

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Obtener valores del formulario
        const username = document.getElementById("username").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();
        const confirmPassword = document.getElementById("confirm-password").value.trim();

        // Validaciones básicas
        if (!username || !email || !password || !confirmPassword) {
            messageEl.textContent = "Por favor completa todos los campos.";
            messageEl.style.color = "red";
            return;
        }

        if (password !== confirmPassword) {
            messageEl.textContent = "Las contraseñas no coinciden.";
            messageEl.style.color = "red";
            return;
        }

        try {
            // Crear usuario en Airtable
            await createUser(username, email, password);

            // Mostrar mensaje de éxito
            messageEl.textContent = "Usuario registrado correctamente. Redirigiendo al login...";
            messageEl.style.color = "green";

            form.reset(); // limpiar formulario

            // Redirigir al login después de 2 segundos
            setTimeout(() => {
                window.location.href = "login.html";
            }, 2000);

        } catch (error) {
            console.error(error);
            messageEl.textContent = "Ocurrió un error al registrar el usuario.";
            messageEl.style.color = "red";
        }
    });
});
