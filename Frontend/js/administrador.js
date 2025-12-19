async function mostrar_reservas() {
    const body_reservas = document.getElementById('lista_reservas');
    const token = localStorage.getItem('jwtToken');

    
    try {
        const respuesta = await fetch('http://localhost:3000/reservas', {
            method: 'GET', 
            headers: {
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${token}` 
            }
        });
        
        if (!respuesta.ok) {
            throw new Error(`Error al obtener reservas: ${respuesta.status}`);
        }

        const reservas = await respuesta.json();
        console.log("¿Qué llegó del servidor?:", reservas);

        body_reservas.innerHTML = ""; 

        if (reservas.length === 0) {
            body_reservas.innerHTML = "<tr><td colspan='8' class='has-text-centered'>No hay reservas registradas.</td></tr>";
            return;
        }

        reservas.forEach(reserva => {
            // Formateamos la fecha para que sea más legible (opcional)
            const fechaFormateada = new Date(reserva.fecha).toLocaleDateString();

            body_reservas.innerHTML += `
                <tr>
                    <td>${reserva.id}</td>
                    <td>${fechaFormateada}</td>
                    <td>${reserva.hora_inicio}</td>
                    <td>${reserva.hora_fin}</td>
                    <td>${reserva.costo_total}</td>
                    <td>${reserva.cancha_nombre}</td> 
                    <td>${reserva.usuario_nombre}</td>
                    <td>
                        <button class="button  is-danger" type="button" onclick="eliminar_reserva(${reserva.id})" >Eliminar</button>
                    </td>
                </tr>
            `;
        });

    } catch (error) {
        console.error("Error al llenar la tabla de reservas:", error);
        body_reservas.innerHTML = "<tr><td colspan='8' class='has-text-danger'>Error al conectar con el servidor.</td></tr>";
    }
}
