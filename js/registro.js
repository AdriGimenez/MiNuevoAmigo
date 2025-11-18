import { createUser } from "./airtable.js";

document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector(".register-form");

    const messageEl = document.createElement("p");
    messageEl.id = "register-message";
    messageEl.className = "message";
    form.appendChild(messageEl);

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const username = document.getElementById("username").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();
        const confirmPassword = document.getElementById("confirm-password").value.trim();

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

            await createUser(username, email, password);


            messageEl.textContent = "Usuario registrado correctamente. Redirigiendo al login...";
            messageEl.style.color = "green";

            form.reset();
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
