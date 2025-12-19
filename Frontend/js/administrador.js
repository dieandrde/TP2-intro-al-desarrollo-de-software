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

async function eliminar_reserva(id) {
    // 1. Confirmación de seguridad
    const confirmar = confirm("¿Seguro que quieres eliminar esta reserva? Esta acción no se puede deshacer.");
    if (!confirmar) return;

    const token = localStorage.getItem('jwtToken');

    try {
        const resp = await fetch(`http://localhost:3000/reservas/${id}`, {
            method: 'DELETE',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        // 2. Manejo de errores específicos
        if (resp.status === 403) {
            alert("No tienes permiso para eliminar esta reserva.");
            return;
        }

        if (resp.status === 401) {
            alert("Tu sesión ha expirado. Por favor, vuelve a iniciar sesión.");
            window.location.href = "login.html";
            return;
        }

        if (resp.ok) {
            alert("Reserva eliminada con éxito.");
            // 3. Volvemos a cargar la tabla para reflejar el cambio
            await mostrar_reservas(); 
        } else {
            const errorData = await resp.json();
            alert("Error al eliminar: " + (errorData.mensaje || "Error desconocido"));
        }

    } catch (error) {
        console.error("Error en la petición DELETE:", error);
        alert("Ocurrió un error al intentar conectar con el servidor.");
    }
}

async function crear_cancha() {
    const token = localStorage.getItem('jwtToken');

    const nombre = document.getElementById('crear-cancha-nombre').value;
    const tipo = document.getElementById('crear-cancha-tipo').value;
    const ubicacion = document.getElementById('crear-cancha-ubicacion').value;
    const precio_por_hora = document.getElementById('crear-cancha-precio').value;
    const capacidad = document.getElementById('crear-cancha-capacidad').value;
    

    const resp = await fetch(`http://localhost:3000/canchas`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ nombre, tipo, ubicacion, precio_por_hora, capacidad })
    });                     
    if (resp.ok) {
        alert("Cancha creada con éxito");
        mostrarCanchasEnTabla();

        const form = document.getElementById('form-crear-cancha'); 
        if (form) {
            form.reset();
        }

    }       
}

async function eliminar_cancha(id) {
    if (!confirm("¿Seguro que quieres eliminar esta cancha?")) return;

    const token = localStorage.getItem('jwtToken');
    const resp = await fetch(`http://localhost:3000/canchas/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });

    if (resp.ok) {
        mostrarCanchasEnTabla(); // Refrescar la tabla
    }
}

async function mostrarCanchasEnTabla() {
    const body_canchas = document.getElementById('lista_canchas');
    
    try {
        const respuesta = await fetch('http://localhost:3000/canchas');
        
        if (!respuesta.ok) {
            throw new Error(`Error al obtener datos: ${respuesta.status}`);
        }

        const canchas = await respuesta.json();

        body_canchas.innerHTML = ""; 

        if (canchas.length === 0) {
            body_canchas.innerHTML =
                "<tr><td colspan='7' class='has-text-centered'>No hay canchas registradas.</td></tr>";
            return;
        }

        canchas.forEach(cancha => {
            body_canchas.innerHTML += `
                <tr>
                    <td><strong>${cancha.id}</strong></td>
                    <td>${cancha.nombre}</td>
                    <td>${cancha.tipo}</td>
                    <td>$${cancha.precio_por_hora}</td>
                    <td>${cancha.ubicacion}</td>
                    <td>${cancha.capacidad} personas</td>
                    <td>
                        <button class="button is-link"
                            onclick="preparar_edicion_canchas(${JSON.stringify(cancha).replace(/"/g, '&quot;')})">
                            Editar
                        </button>
                    </td>
                </tr>
            `;
        });

    } catch (error) {
        console.error("Error al llenar la tabla:", error);
    }
}


function preparar_edicion_canchas(cancha) {
    document.getElementById('edit-cancha-id').value = cancha.id;
    document.getElementById('edit-cancha-nombre').value = cancha.nombre;
    document.getElementById('edit-cancha-tipo').value = cancha.tipo;
    document.getElementById('edit-cancha-ubicacion').value = cancha.ubicacion;
    document.getElementById('edit-cancha-precio').value = cancha.precio_por_hora;
    document.getElementById('edit-cancha-capacidad').value = cancha.capacidad;
}

