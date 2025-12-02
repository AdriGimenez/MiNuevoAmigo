import { AIRTABLE_TOKEN, BASE_ID } from "./env.js";

const TABLES = {
    Mascotas: "tblSbsLzVV7LE2Iwq",
    Usuarios: "tblHOuKr3gWT2Ed6L",
    Favoritos: "tbl9ol93wYrRjVbds",
    Solicitudes: "tblygiByIpeXvShyW"
};

async function airtableFetch(tableId, method = "GET", data = null) {
    const url = `https://api.airtable.com/v0/${BASE_ID}/${tableId}`;
    const options = {
        method,
        headers: {
            Authorization: `Bearer ${AIRTABLE_TOKEN}`,
            "Content-Type": "application/json"
        }
    };
    if (data) options.body = JSON.stringify(data);
    const response = await fetch(url, options);
    if (!response.ok) {
        console.error("Airtable error:", await response.text());
        throw new Error("Airtable request failed");
    }
    return await response.json();
}

// USUARIOS
export async function getUsers() {
  return airtableFetch(TABLES.Usuarios); // ya lo tenías
}
export async function createUser(username, email, password) {
  const fields = { username, email, password, role: "user" };
  return airtableFetch(TABLES.Usuarios, "POST", { fields });
}
export async function updateUser(id, fieldsToUpdate) {
  return airtableFetch(`${TABLES.Usuarios}/${id}`, "PATCH", { fields: fieldsToUpdate });
}
export async function deleteUser(id) {
  return airtableFetch(`${TABLES.Usuarios}/${id}`, "DELETE");
}

// MASCOTAS
export async function getPets() { 
  return airtableFetch(TABLES.Mascotas); 
}
export async function getPet(id) {
  return airtableFetch(`${TABLES.Mascotas}/${id}`, "GET");
}
export async function createPet(petData) { 
  return airtableFetch(TABLES.Mascotas, "POST", { fields: petData }); 
}
export async function updatePet(id, petData) {
  return airtableFetch(`${TABLES.Mascotas}/${id}`, "PATCH", { fields: petData });
}
export async function deletePet(id) {
  return airtableFetch(`${TABLES.Mascotas}/${id}`, "DELETE");
}

// FAVORITOS
export async function createFavorite(userId, petId) {
    return airtableFetch(TABLES.Favoritos, "POST", {
        usuario: [userId],
        mascota: [petId]
    });
}
export async function getFavorites() { return airtableFetch(TABLES.Favoritos); }

export async function deleteFavorite(favoritoId) {
    await fetch(`https://api.airtable.com/v0/${BASE_ID}/Favoritos/${favoritoId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` }
    });
  }

export async function getFavoritosByUsername(username) {
    const formula = `{usuario}='${username}'`;
    const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLES.Favoritos}?filterByFormula=${encodeURIComponent(formula)}`;
    console.log("Fetching favoritos with URL:", url);
    const res = await fetch(url, { headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` } });
    const data = await res.json();
    return await data.records || [];
}

// SOLICITUDES
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
