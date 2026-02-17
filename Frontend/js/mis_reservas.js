async function cargar_mis_reservas() {
    
    const body_mis_reservas = document.getElementById('lista_mis_reservas');
    const token = localStorage.getItem('jwtToken');

    if (!token) {
        alert("Debes iniciar sesión para ver tus reservas.");
        window.location.href = 'login.html';
        return;
    }

    try {
        const respuesta = await fetch('http://localhost:3000/mis_reservas', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!respuesta.ok) {
            throw new Error("No se pudieron cargar las reservas.");
        }

        const reservas = await respuesta.json();
        body_mis_reservas.innerHTML = "";

        if (reservas.length === 0) {
            body_mis_reservas.innerHTML = "<tr><td colspan='6' class='has-text-centered'>Aún no tienes reservas realizadas.</td></tr>";
            return;
        }

        reservas.forEach(reserva => {
            const fechaFormateada = new Date(reserva.fecha).toLocaleDateString();

            body_mis_reservas.innerHTML += `
                <tr>
                    <td>${fechaFormateada}</td>
                    <td>${reserva.hora_inicio}</td>
                    <td>${reserva.hora_fin}</td>
                    <td>$${reserva.costo_total}</td>
                    <td>${reserva.cancha_nombre}</td>
                    <td>
                    <button class="button is-link" type="button" onclick="preparar_edicion_reserva(${JSON.stringify(reserva).replace(/"/g, '&quot;')})" >Editar</button>
                    <button class="button  is-danger" type="button" onclick="eliminar_reserva(${reserva.id})" >Eliminar</button>
                    </td>
                </tr>
            `;
        });

    } catch (error) {
        console.error("Error:", error);
        tablaBody.innerHTML = "<tr><td colspan='6' class='has-text-danger'>Error al conectar con el servidor.</td></tr>";
    }
}
function preparar_edicion_reserva(reserva) {
    document.getElementById('reserva-edit-id').value = reserva.id;
    document.getElementById('reserva-cancha-id').value = reserva.cancha_id;
    
    const fechaLimpia = reserva.fecha.split('T')[0];
    document.getElementById('reserva-edit-fecha').value = fechaLimpia;
    document.getElementById('reserva-edit-hora-inicio').value = reserva.hora_inicio.substring(0, 5);
    document.getElementById('reserva-edit-hora-fin').value = reserva.hora_fin.substring(0, 5);
}

async function editar_reserva() {
    const token = localStorage.getItem('jwtToken');
    const idReserva = document.getElementById('reserva-edit-id').value;
    const canchaId = document.getElementById('reserva-cancha-id').value;
    const fecha = document.getElementById('reserva-edit-fecha').value;
    const horaInicio = document.getElementById('reserva-edit-hora-inicio').value;
    const horaFin = document.getElementById('reserva-edit-hora-fin').value;
    
    if (!idReserva || !fecha || !horaInicio || !horaFin) {
        alert("Por favor, selecciona una reserva de la tabla y completa todos los campos.");
        return;
    }

    const datosActualizados = {
        cancha_id: parseInt(canchaId),
        fecha: fecha,
        hora_inicio: horaInicio,
        hora_fin: horaFin
    };

    try {
        const respuesta = await fetch(`http://localhost:3000/reservas/${idReserva}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(datosActualizados)
        });

        const resultado = await respuesta.json();

        if (respuesta.ok) {
            alert("Reserva actualizada con éxito.");
            
            // limpia el formulario
            document.getElementById('form-editar-reserva').reset();
            document.getElementById('reserva-edit-id').value = "";
            document.getElementById('reserva-cancha-id').value = "";
            
            // recarga tabla
            cargar_mis_reservas();
        } else {
            alert("Error: " + (resultado.mensaje || "No se pudo actualizar la reserva"));
        }

    } catch (error) {
        console.error("Error al actualizar:", error);
        alert("Error de conexión con el servidor.");
    }
}

async function eliminar_reserva(id) {
    if (!confirm("¿Estás seguro de que deseas cancelar esta reserva?")) return;

    const token = localStorage.getItem('jwtToken');

    try {
        const respuesta = await fetch(`http://localhost:3000/reservas/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (respuesta.ok) {
            alert("Reserva cancelada correctamente.");
            cargar_mis_reservas(); //rcarga la tabla
        } else {
            const error = await respuesta.json();
            alert("Error: " + error.mensaje);
        }
    } catch (err) {
        console.error("Error al eliminar:", err);
    }
}