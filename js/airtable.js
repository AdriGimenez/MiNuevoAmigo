import { AIRTABLE_TOKEN, BASE_ID } from "./env.js";

const TABLES = {
    Mascotas: "tblSbsLzVV7LE2Iwq",
    Usuarios: "tblHOuKr3gWT2Ed6L",
    Favoritos: "tbl9ol93wYrRjVbds",
    Solicitudes: "tblygiByIpeXvShyW"
};

async function airtableFetch(tableId, method = "GET", fields = null) {
    const url = `https://api.airtable.com/v0/${BASE_ID}/${tableId}`;
    const options = {
        method,
        headers: {
            Authorization: `Bearer ${AIRTABLE_TOKEN}`,
            "Content-Type": "application/json"
        }
    };
    if (fields) options.body = JSON.stringify({ fields });
    const response = await fetch(url, options);
    if (!response.ok) {
        console.error("Airtable error:", await response.text());
        throw new Error("Airtable request failed");
    }
    return await response.json();
}

export async function createUser(username, email, password) {
    return airtableFetch(TABLES.Usuarios, "POST", { username, email, password, role: "user" });
}

export async function getUsers() { return airtableFetch(TABLES.Usuarios); }
export async function createPet(data) { return airtableFetch(TABLES.Mascotas, "POST", data); }
export async function getPets() { return airtableFetch(TABLES.Mascotas); }
export async function createFavorite(userId, petId) { return airtableFetch(TABLES.Favoritos, "POST", { user: userId, pet: petId }); }
export async function getFavorites() { return airtableFetch(TABLES.Favoritos); }
