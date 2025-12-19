document.addEventListener('DOMContentLoaded', () => {
    // 1. Obtener el ID de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const canchaId = urlParams.get('cancha_id');

    // 2. Buscar el input (con el ID exacto del HTML)
    const inputCancha = document.getElementById('reserva-cancha-id');

    // 3. Verificar que el input existe antes de asignarle el valor
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
    // 1. Obtener el token del localStorage (asegúrate de usar el nombre correcto 'jwtToken')
    const token = localStorage.getItem('jwtToken');

    if (!token) {
        alert("Debes iniciar sesión para realizar una reserva.");
        window.location.href = 'login.html';
        return;
    }

    const canchaId = document.getElementById('reserva-cancha-id').value; // Verifica que el ID sea el mismo que el input hidden
    const fecha = document.getElementById('reserva-fecha').value;
    const horaInicio = document.getElementById('reserva-hora-inicio').value;
    const horaFin = document.getElementById('reserva-hora-fin').value;

    // Validación simple antes de enviar
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
        const respuesta = await fetch('http://localhost:3000/reservas', {
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
            window.location.href = 'lista_precios.html'; // Redirigir a sus reservas
        } else {
            // Aquí capturamos los errores del backend (ej: "La cancha ya está ocupada")
            alert("Error: " + (resultado.mensaje || "No se pudo crear la reserva"));
        }

    } catch (error) {
        console.error("Error al crear la reserva:", error);
        alert("Error de conexión con el servidor.");
    }
}