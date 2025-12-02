import { getPets, getFavoritosByUsername, createFavorite, deleteFavorite } from "./airtable.js";
 document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("mascotaContainer");
  const filterList = document.querySelector(".mascota-filter ul");
  const searchInput = document.getElementById("searchInput");
  
  const user = JSON.parse(localStorage.getItem("user"));
   if (!user || !user.id) { 
    alert("Debes iniciar sesión para ver y agregar favoritos.");
    window.location.href = "login.html"; 
    return;
   }
   
  // Traer mascotas 
    const mascotasData = await getPets(); 
    //Formatea la data
    const mascotas = mascotasData.records.map(r => ({ 
      id: r.id, 
      name: r.fields.name, 
      age: r.fields.age, 
      breed: r.fields.breed, 
      category: r.fields.category, 
      image: r.fields.image || []
    }));
    
    // Traer favoritos del usuario 
    let favoritosAirtable = []; 
    const cargarFavoritos = async () => {
    const favs = await getFavoritosByUsername(user.username);
    
    favoritosAirtable = favs.map(f => ({ 
      favoritoId: f.id, 
      mascotaId: Array.isArray(f.fields.mascota) ? f.fields.mascota[0] : f.fields.mascota 
    }));
   };
   
   await cargarFavoritos();
   
   function renderCategorias() {
    const categorias = [...new Set(mascotas.map(m => m.category))];
    categorias.unshift("Todos"); 
    categorias.forEach(categoria => {
      const li = document.createElement("li");
      li.textContent = categoria; 
      li.addEventListener("click", () => {
        const filtradas = categoria === "Todos" ? mascotas : mascotas.filter(m => m.category === categoria);
        
        renderMascotas(filtradas); 
      });
      
      filterList.appendChild(li); 
    });
   }
   
   function renderMascotas(mascotas) {
     container.innerHTML = ""; 
     mascotas.forEach(mascota => {
      const fav = favoritosAirtable.find(f => f.mascotaId === mascota.id); 
      const article = document.createElement("article"); 
      article.classList.add("mascota-item"); 
      
      article.innerHTML = `
      <button class="mascota-like ${fav ? "activo" : ""}" data-id="${mascota.id}" data-favorito="${fav ? fav.favoritoId : ""}"> 
      <svg viewBox="0 0 24 24" width="24" height="24" class="icono-corazon">
       <path fill="#000000" d="M12.1,18.55L12,18.65L11.89,18.55C7.14,14.24 
          4,11.39 4,8.5C4,6.5 5.5,5 7.5,5C9.04,5 10.54,6 11.07,7.36H12.93C13.46,6
          14.96,5 16.5,5C18.5,5 20,6.5 20,8.5C20,11.39 16.86,14.24
          12.1,18.55M16.5,3C14.76,3 13.09,3.81 12,5.08C10.91,3.81 
          9.24,3 7.5,3C4.42,3 2,5.41 2,8.5C2,12.27 5.4,15.36 10.55,20.03L12,21.35L13.45,
          20.03C18.6,15.36 22,12.27 22,8.5C22,5.41 19.58,3 16.5,3Z" /> 
      </svg> 
      </button> 
      <div class="mascota-img" style="background-image: url('${mascota.image[0]?.url || ''}')"></div> 
      <div class="mascota-img-hover" style="background-image: url('${mascota.image[0]?.url || ''}')"></div>
      <div class="mascota-info"> 
        <span class="mascota-category">${mascota.name}</span> 
        <h3 class="mascota-title">Raza: ${mascota.breed}</h3> 
        <a href="./mascota-detail.html?id=${mascota.id}" class="button">Ver más</a> 
      </div> 
      `; 
      
      container.appendChild(article); });
      
      // Eventos para favoritos 
      document.querySelectorAll(".mascota-like").forEach(icono => { 
        icono.addEventListener("click", async () => {
           const favoritoId = icono.dataset.favorito;
           const mascotaId = icono.dataset.id;
           try {  
            if (icono.classList.contains("activo")) {
              await deleteFavorite(favoritoId); 
            } else {
              await createFavorite(user.id, mascotaId);
            }
            
            location.reload();
          } catch (err) { 
            console.error("Error al eliminar favorito:", err); }
           });
          });
        } 

        // búsqueda por nombre o raza 
        if (searchInput) { 
          searchInput.addEventListener("input", (e) => {
            const term = e.target.value.toLowerCase(); 
            const filtradas = mascotas.filter(m => 
              m.name.toLowerCase().includes(term) || 
              m.breed.toLowerCase().includes(term) 
            );
           renderMascotas(filtradas); 
          }); 
        } 
        renderCategorias(); 
        renderMascotas(mascotas); 
      });