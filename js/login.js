import { getUsers } from "./airtable.js";

document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector(".login-form");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        try {
            const data = await getUsers();
            const users = data.records;

            const user = users.find(u => 
                u.fields.email.toLowerCase() === email.toLowerCase() && 
                u.fields.password === password
            );

            if (!user) {
                alert("Correo o contraseña incorrectos.");
                return;
            }

            const sessionUser = {
                id: user.id,
                username: user.fields.username,
                email: user.fields.email,
                role: user.fields.role
            };

            localStorage.setItem("user", JSON.stringify(sessionUser));

            // SIN mensajes de bienvenida
            window.location.href = "index.html";

        } catch (error) {
            console.error(error);
            alert("Error al iniciar sesión.");
        }
    });
});
