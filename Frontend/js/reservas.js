async function eliminarReserva(id) {
    if (!confirm("¿Seguro de que queres cancelar esta reserva?")) return;

    try {
        const respuesta = await fetch(`http://localhost:3000/api/reservas/${id}`, {
            method: 'DELETE',
        });

        if (respuesta.ok) {
            alert("Reserva eliminada");
            cargarReservas(); 
        } else {
            const error = await respuesta.json();
            alert("Error al eliminar: " + error.error);
        }
    } catch (error) {
        console.error("Error en la petición DELETE:", error);
        alert("No se pudo conectar con el servidor.");
    }
}


async function cargarReservas() {
    const contenedor = document.getElementById('contenedor-reservas');
    if (!contenedor) return; 

    try {
        const res = await fetch('http://localhost:3000/api/reservas');
        const reservas = await res.json();

        if (reservas.length === 0) {
            contenedor.innerHTML = '<p class="has-text-white">No hay reservas todavía.</p>';
            return;
        }

        contenedor.innerHTML = reservas.map(r => `
            <div class="card-reserva">
                <img src="images/card.png" alt="Cancha">
                <div class="info-reserva">
                    <h3>Cancha: ${r.cancha_id}</h3>
                    <p><strong>Fecha:</strong> ${new Date(r.fecha).toLocaleDateString('es-AR')}</p>
                    <p><strong>Horario:</strong> ${r.hora_inicio} - ${r.hora_fin}</p>
                    <div class="acciones">
                        <button class="btn-modificar" onclick="prepararEdicion(${r.id}, '${r.fecha}', '${r.hora_inicio}', '${r.hora_fin}')">Modificar</button>
                        <button class="btn-eliminar" onclick="eliminarReserva(${r.id})">Eliminar</button>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error("Error al cargar:", error);
        contenedor.innerHTML = `<p class="has-text-white">Error al conectar con el servidor.</p>`;
    }
}

function prepararEdicion(id, fecha, inicio, fin) {
    document.getElementById('edit-id').value = id;
    document.getElementById('edit-fecha').value = fecha.split('T')[0];
    document.getElementById('edit-inicio').value = inicio;
    document.getElementById('edit-fin').value = fin;
    
    document.getElementById('modal-editar').classList.add('is-active'); 
}

function cerrarModal() {
    document.getElementById('modal-editar').classList.remove('is-active');
}


async function guardarCambios() {
    const id = document.getElementById('edit-id').value;
    const datos = {
        fecha: document.getElementById('edit-fecha').value,
        hora_inicio: document.getElementById('edit-inicio').value,
        hora_fin: document.getElementById('edit-fin').value
    };

    try {
        const res = await fetch(`http://localhost:3000/api/reservas/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });

        if (res.ok) {
            alert("Reserva actualizada y costo recalculado");
            cerrarModal();
            cargarReservas();
        }
    } catch (error) {
        alert("Error al actualizar la reserva");
    }
}

async function crearNuevaReserva() {
    const canchaId = document.getElementById('nueva-cancha').value;
    const fecha = document.getElementById('nueva-fecha').value;
    const inicio = document.getElementById('nueva-inicio').value;
    const fin = document.getElementById('nueva-fin').value;

    const datos = {
        usuario_id: 1, 
        cancha_id: parseInt(canchaId), 
        fecha: fecha,
        hora_inicio: inicio,
        hora_fin: fin,
        precio_por_hora: 5000 
    };

    try {
        const res = await fetch('http://localhost:3000/api/reservas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });

        if (res.ok) {
            alert("Reserva agregada!");
            document.getElementById('nueva-inicio').value = "";
            document.getElementById('nueva-fin').value = "";
            cargarReservas(); 
        } else if (res.status === 409) {

            const errorData = await res.json();
            alert("" + errorData.error); 
        } else {
            const error = await res.json();
            alert("Error: " + (error.detalle || error.error));
        }
    } catch (err) {
        alert("Error de conexion");
    }
}