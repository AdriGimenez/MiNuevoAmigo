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
export async function createFavorite(userId, petId) {
    return airtableFetch(TABLES.Favoritos, "POST", {
        usuario: [userId],
        mascota: [petId]
    });
}
export async function getFavorites() { return airtableFetch(TABLES.Favoritos); }
export async function deleteFavorite(favId) {
  const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLES.Favoritos}/${favId}`;
  const options = { method: "DELETE", headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` } };
  const response = await fetch(url, options);
  if (!response.ok) throw new Error("Airtable request failed");
  return await response.json();
}

export async function getFavoritosByUsername(username) {
    const formula = `{usuario}='${username}'`;
    const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLES.Favoritos}?filterByFormula=${encodeURIComponent(formula)}`;
    console.log("Fetching favoritos with URL:", url);
    const res = await fetch(url, { headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` } });
    const data = await res.json();
    return await data.records || [];
}

export async function createSolicitud(data) {
    return airtableFetch(TABLES.Solicitudes, "POST", data);
}
export async function getSolicitudes() { return airtableFetch(TABLES.Solicitudes); }
export async function getSolicitudesByUser(username) {
    const formula = `{usuario}='${username}'`;
    const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLES.Solicitudes}?filterByFormula=${encodeURIComponent(formula)}`;
    console.log("Fetching solicitudes with URL:", url);
    const res = await fetch(url, { headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` } });
    const data = await res.json();
    return data.records || [];
}
