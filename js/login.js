import { getUsers } from "./airtable.js";

document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector(".form");

    form.addEventListener("submit", async (e) => {
        // Evita que se ejecute la acción predeterminada del evento.
        e.preventDefault();
        // trim elimina los espacios en blanco
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        try {
            const data = await getUsers();
            const users = data.records;

            const user = users.find(u => 
                u.fields.email?.toLowerCase() === email.toLowerCase() && 
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

            window.location.href = "index.html";

        } catch (error) {
            console.error(error);
            alert("Error al iniciar sesión.");
        }
    });
});
