import { createUser, getUsers } from "./airtable.js";

document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector(".form");

    const messageEl = document.createElement("p");
    messageEl.id = "register-message";
    messageEl.className = "message";
    form.appendChild(messageEl);

    form.addEventListener("submit", async (e) => {
        // Evita recargar la página
        e.preventDefault();
        // Elimina los espacios en blanco
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
            // Obtener usuarios existentes para verificar si el email ya está registrado
            const usersData = await getUsers();
            const existingUser = usersData.records.find(
                (user) => user.fields.email?.toLowerCase() === email.toLowerCase()
            );
            if (existingUser) {
                messageEl.textContent = "El correo electrónico ya está registrado.";
                messageEl.style.color = "red";
                return;
            }
            // Registrar el usuario
            await createUser(username, email, password);
            
            // Mostrar mensaje de éxito
            messageEl.textContent = "Usuario registrado correctamente. Redirigiendo al login...";
            messageEl.style.color = "green";

            form.reset();
            
            // Redirigir al login después de 2 segundos
            setTimeout(() => {
                window.location.href = "login.html";
            }, 1000);

        } catch (error) {
            console.error(error);
            messageEl.textContent = "Ocurrió un error al registrar el usuario.";
            messageEl.style.color = "red";
        }
    });
});
