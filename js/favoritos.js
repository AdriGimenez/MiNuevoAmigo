import { AIRTABLE_TOKEN, BASE_ID } from "./env.js";

const TABLE_FAVORITOS = "Favoritos";
const TABLE_MASCOTAS = "Mascotas";

document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("favoritosContainer");

  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    container.innerHTML = "<p>Debes iniciar sesión para ver tus favoritos.</p>";
    return;
  }

  const fetchJson = async (url, opts = {}) => {
    const r = await fetch(url, opts);
    if (!r.ok) {
      const t = await r.text();
      throw new Error(`HTTP ${r.status} - ${t}`);
    }
    return r.json();
  };

  const getFavoritosByInternalId = async () => {
    const formula = `FIND('${user.id}', ARRAYJOIN(usuario))`;
    const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_FAVORITOS}?filterByFormula=${encodeURIComponent(formula)}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` } });
    const data = await res.json();
    return data.records || [];
  };


  const getFavoritosByUsername = async () => {

    const formula = `{usuario}='${user.username || user.email || ""}'`;
    const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_FAVORITOS}?filterByFormula=${encodeURIComponent(formula)}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` } });
    const data = await res.json();
    return data.records || [];
  };

  const getFavoritos = async () => {
    try {
      let records = await getFavoritosByInternalId();
      if (records.length === 0) {
        records = await getFavoritosByUsername();
      }
      return records;
    } catch (err) {
      console.error("Error fetching favoritos:", err);
      return [];
    }
  };

  const eliminarFavorito = async (favoritoId) => {
    await fetchJson(`https://api.airtable.com/v0/${BASE_ID}/${TABLE_FAVORITOS}/${favoritoId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` }
    });
  };

  const resolveMascotaFromFavorite = async (fav) => {
    if (fav.fields["mascota name"] || fav.fields["mascota image"] || fav.fields["mascota breed"]) {
      return {
        id: Array.isArray(fav.fields.mascota) ? fav.fields.mascota[0] : fav.fields.mascota,
        name: fav.fields["mascota name"] || "",
        breed: fav.fields["mascota breed"] || "",
        category: fav.fields["mascota category"] || "",
        image: fav.fields["mascota image"]?.[0]?.url || ""
      };
    }

    const mascotaField = fav.fields.mascota;

    if (Array.isArray(mascotaField) && mascotaField.length > 0 && typeof mascotaField[0] === "string") {
      try {
        const mascotaId = mascotaField[0];
        const data = await fetchJson(`https://api.airtable.com/v0/${BASE_ID}/${TABLE_MASCOTAS}/${mascotaId}`, {
          headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` }
        });
        return {
          id: data.id,
          name: data.fields.name || "",
          breed: data.fields.breed || "",
          category: data.fields.category || "",
          image: data.fields.image?.[0]?.url || ""
        };
      } catch (err) {
        console.error("Error fetching mascota by internal id:", err);
        return null;
      }
    }

    if (mascotaField !== undefined && (typeof mascotaField === "number" || (typeof mascotaField === "string" && /^[0-9]+$/.test(mascotaField)))) {
      const idOriginal = mascotaField;
      try {
        const formula = `{ID}=${idOriginal}`;
        const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_MASCOTAS}?filterByFormula=${encodeURIComponent(formula)}`;
        const res = await fetch(url, { headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` } });
        const data = await res.json();
        const rec = data.records?.[0];
        if (!rec) return null;
        return {
          id: rec.id,
          name: rec.fields.name || "",
          breed: rec.fields.breed || "",
          category: rec.fields.category || "",
          image: rec.fields.image?.[0]?.url || ""
        };
      } catch (err) {
        console.error("Error fetching mascota by original id:", err);
        return null;
      }
    }

    if (typeof mascotaField === "string") {
      try {
        const data = await fetchJson(`https://api.airtable.com/v0/${BASE_ID}/${TABLE_MASCOTAS}/${mascotaField}`, {
          headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` }
        });
        return {
          id: data.id,
          name: data.fields.name || "",
          breed: data.fields.breed || "",
          category: data.fields.category || "",
          image: data.fields.image?.[0]?.url || ""
        };
      } catch (err) {
        console.error("Error fetching mascota by string field:", err);
        return null;
      }
    }

    return null;
  };
  const renderFavoritos = async () => {
    container.innerHTML = "";
    try {
      const favoritosRecords = await getFavoritos();

      if (!favoritosRecords || favoritosRecords.length === 0) {
        container.innerHTML = `
          <div class="favoritos-empty">
            <p class="patas">🐾</p>
            <p class="mensaje">No tienes mascotas favoritas aún 🐾</p>
            <p class="submensaje">Agrega algunas mascotas a tus favoritos para verlas aquí.</p>
            <a href="./mascotas.html" class="boton-ver">Ver mascotas</a>
          </div>
        `;
        return;
      }

      for (const fav of favoritosRecords) {
        const mascotaData = await resolveMascotaFromFavorite(fav);

        if (!mascotaData) continue;

        const article = document.createElement("article");
        article.classList.add("mascota-item");

        article.innerHTML = `
          <button class="mascota-like activo" data-id="${fav.id}">
            <svg viewBox="0 0 24 24" width="24" height="24" class="icono-corazon">
              <path fill="#000000" d="M12.1,18.55L12,18.65L11.89,18.55C7.14,14.24 4,11.39 
              4,8.5C4,6.5 5.5,5 7.5,5C9.04,5 10.54,6 11.07,7.36H12.93C13.46,6 14.96,5 16.5,5C18.5,5 
              20,6.5 20,8.5C20,11.39 16.86,14.24 12.1,18.55M16.5,3C14.76,3 13.09,3.81 12,5.08C10.91,3.81 
              9.24,3 7.5,3C4.42,3 2,5.41 2,8.5C2,12.27 5.4,15.36 10.55,20.03L12,21.35L13.45,20.03C18.6,15.36 
              22,12.27 22,8.5C22,5.41 19.58,3 16.5,3Z" />
            </svg>
          </button>

          <div class="mascota-img" style="background-image: url('${mascotaData.image}')"></div>
          <div class="mascota-img-hover" style="background-image: url('${mascotaData.image}')"></div>
          <div class="mascota-info">
            <span class="mascota-category">${mascotaData.name}</span>
            <h3 class="mascota-title">Raza: ${mascotaData.breed}</h3>
            <a href="./mascota-detail.html?id=${mascotaData.id}" class="button">Ver más</a>
          </div>
        `;
        container.appendChild(article);
      }

      const corazones = document.querySelectorAll(".mascota-like");
      corazones.forEach(icono => {
        icono.addEventListener("click", async () => {
          const id = icono.dataset.id;
          try {
            await eliminarFavorito(id);
            await renderFavoritos();
          } catch (err) {
            console.error("Error al eliminar favorito:", err);
          }
        });
      });

    } catch (error) {
      console.error("Error al cargar los favoritos:", error);
      container.innerHTML = `
        <div class="favoritos-empty">
          <p class="patas">⚠️</p>
          <p class="mensaje">Error al cargar los favoritos 😿</p>
        </div>
      `;
    }
  };

  await renderFavoritos();
});
