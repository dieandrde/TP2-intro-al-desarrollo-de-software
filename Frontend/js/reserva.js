document.addEventListener('DOMContentLoaded', () => {
    // obtiene id url
    const urlParams = new URLSearchParams(window.location.search);
    const canchaId = urlParams.get('cancha_id');
    const inputCancha = document.getElementById('reserva-cancha-id');

    // if input existe, se asigna valor
    if (inputCancha) {
        if (canchaId) {
            inputCancha.value = canchaId;
            console.log("ID cargado con éxito:", canchaId);
        }
    } else {
        console.error("No se encontró el elemento con ID 'reserva-cancha-id' en el HTML.");
    }
});


async function crear_reserva() {
    // jwt token, localstorage
    const token = localStorage.getItem('jwtToken');

    if (!token) {
        alert("Debes iniciar sesión para realizar una reserva.");
        window.location.href = 'login.html';
        return;
    }

    const canchaId = document.getElementById('reserva-cancha-id').value; // id es el mismo que el input hidden?
    const fecha = document.getElementById('reserva-fecha').value;
    const horaInicio = document.getElementById('reserva-hora-inicio').value;
    const horaFin = document.getElementById('reserva-hora-fin').value;

    if (!fecha || !horaInicio || !horaFin) {
        alert("Por favor, completa todos los campos.");
        return;
    }

    const datosReserva = {
        cancha_id: parseInt(canchaId),
        fecha: fecha,
        hora_inicio: horaInicio,
        hora_fin: horaFin
    };

    try {
        const respuesta = await fetch('https://tp2-intro-al-desarrollo-de-software-db.onrender.com/reservas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(datosReserva)
        });

        const resultado = await respuesta.json();

        if (respuesta.ok) {
            alert("¡Reserva creada con éxito!");
            window.location.href = 'lista_precios.html'; // redireccion a reservas
        } else {
            alert("Error: " + (resultado.mensaje || "No se pudo crear la reserva"));
        }

    } catch (error) {
        console.error("Error al crear la reserva:", error);
        alert("Error de conexión con el servidor.");
    }
}