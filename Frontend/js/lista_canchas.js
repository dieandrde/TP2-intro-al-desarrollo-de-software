async function cargarCanchas() {
    const contenedor = document.getElementById('contenedor-canchas');
    
    try {
        const respuesta = await fetch('http://localhost:3000/canchas');
        
        // Primero verificamos si la respuesta del servidor es correcta (status 200)
        if (!respuesta.ok) {
            throw new Error(`Error en el servidor: ${respuesta.status}`);
        }

        const canchas = await respuesta.json();

        contenedor.innerHTML = ""; 

        if (canchas.length === 0) {
            contenedor.innerHTML = "<p class='has-text-centered'>No hay canchas disponibles en este momento.</p>";
            return;
        }

        canchas.forEach(cancha => {
            
            const nombreImagen = cancha.tipo
                .toLowerCase()                             // Todo a minúsculas
                .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Quitamos tildes (Fútbol -> Futbol)
                .replace(/\s+/g, "_");                     // Espacios por guiones bajos

            const rutaFinal = `./images/${nombreImagen}.jpg`;
            contenedor.innerHTML += `
                <div class="caja">
                    <div class="cancha-imagen">
                        <img src="${rutaFinal}" 
                             alt="${cancha.nombre}" 
                            >
                    </div>
                    <div class="card-body">
                        <h2>${cancha.nombre}</h2>
                        <p><strong>Tipo:</strong> ${cancha.tipo}</p>
                        <p><strong>Ubicación:</strong> ${cancha.ubicacion}</p>
                        <div class="card-footer">
                            <span class="precio">$${cancha.precio_por_hora} / h</span>
                            <button class="button is-primary" type="button" onclick="ir_a_reserva(${cancha.id})">Reservar</button>
                        </div>
                    </div>
                </div>
            `;
        });

    } catch (error) {
        console.error("Error detallado:", error);
    }
}

function ir_a_reserva(cancha_id) {
    window.location.href = `reserva.html?cancha_id=${cancha_id}`;
}


