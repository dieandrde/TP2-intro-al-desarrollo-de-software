
async function obtenerListaUsuarios() {
    const token = localStorage.getItem('jwtToken');
    
    if (!token) {
        alert('Debe iniciar sesión para ver esta lista.');
        // Opcional: Redirigir al login
        // window.location.href = 'login.html';
        return;
    }

    // 1. Declarar tabla_body ANTES del try/catch
    const tabla_body = document.getElementById('lista_usuarios');
    
    if (!tabla_body) {
        console.error("El elemento con ID 'lista_usuarios' no fue encontrado en el DOM.");
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/usuarios', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        // 2. Manejo de Errores HTTP
        if (!response.ok) {
            const errorData = await response.json(); // Intentamos leer el mensaje de error del Backend
            
            if (response.status === 403) {
                 alert('Acceso denegado. No eres administrador.');
            } else if (response.status === 401) {
                 alert('Sesión expirada. Inicie sesión de nuevo.');
            } else {
                 alert(`Error al cargar usuarios: ${errorData.message || response.statusText}`);
            }
            // Limpiamos o mostramos mensaje de error
            tabla_body.innerHTML = '<tr><td colspan="5">Error al cargar usuarios.</td></tr>';
            return;
        }
        
        // 3. Bloque de ÉXITO
        // Declarar 'usuarios' como const DENTRO de este bloque es seguro
        const usuarios = await response.json(); 
        
        // Limpiar la tabla y llenarla
        tabla_body.innerHTML = ''; 

        if (usuarios.length === 0) {
            tabla_body.innerHTML = '<tr><td colspan="5">No hay usuarios registrados (aparte del administrador).</td></tr>';
            return;
        }

        usuarios.forEach(user => {
            tabla_body.innerHTML += `
                <tr>
                    <td>${user.id}</td>
                    <td>${user.nombre}</td>
                    <td>${user.email}</td>
                    <td>${user.telefono}</td> <td>
                    <button class="button is-link" type="button" onclick="prepararEdicion(${JSON.stringify(user).replace(/"/g, '&quot;')})" >Editar</button>
                    <button class="button  is-danger" type="button" onclick="eliminarUsuario(${user.id})" >Eliminar</button>
                    </td>
                </tr>
            `;
        });
        
    } catch (error) {
        // Captura errores de red (si el servidor está caído)
        console.error('Error de red al obtener usuarios:', error);
        alert('Error de conexión con el servidor.');
    }
}

function prepararEdicion(user) {

    document.getElementById('edit-id').value = user.id;
    document.getElementById('edit-nombre').value = user.nombre;
    document.getElementById('edit-email').value = user.email;
    document.getElementById('edit-telefono').value = user.telefono;
}


async function editarUsuario() {
    const id = document.getElementById('edit-id').value;
    const token = localStorage.getItem('jwtToken');

    const nombre = document.getElementById('edit-nombre').value;
    const email = document.getElementById('edit-email').value;
    const telefono = document.getElementById('edit-telefono').value;
    const password = document.getElementById('edit-password').value;
    

    const resp = await fetch(`http://localhost:3000/usuarios/${id}`, {
        method: 'PUT',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ nombre, email, telefono, password })
    });

    if (resp.ok) {
        alert("Actualizado con éxito");
        obtenerListaUsuarios();

        const form = document.getElementById('form-editar-usuario'); 
        if (form) {
            form.reset();
        }

    }
}



async function eliminarUsuario(id) {
    if (!confirm("¿Seguro que quieres eliminar este usuario?")) return;

    const token = localStorage.getItem('jwtToken');
    const resp = await fetch(`http://localhost:3000/usuarios/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });

    if (resp.ok) {
        obtenerListaUsuarios(); // Refrescar la tabla
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

        // Limpiamos el cuerpo de la tabla
        body_canchas.innerHTML = ""; 

        if (canchas.length === 0) {
            cuerpoTabla.innerHTML = "<tr><td colspan='6' class='has-text-centered'>No hay canchas registradas.</td></tr>";
            return;
        }

        // Recorremos las canchas y creamos las filas
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
                        <button class="button is-link" type="button" onclick="preparar_edicion_canchas(${JSON.stringify(cancha).replace(/"/g, '&quot;')})" >Editar</button>
                        <button class="button  is-danger" type="button" onclick="eliminar_cancha(${cancha.id})" >Eliminar</button>
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


async function editar_cancha() {
    const id = document.getElementById('edit-cancha-id').value;
    const token = localStorage.getItem('jwtToken');

    const nombre = document.getElementById('edit-cancha-nombre').value;
    const tipo = document.getElementById('edit-cancha-tipo').value;
    const ubicacion = document.getElementById('edit-cancha-ubicacion').value;
    const precio_por_hora = document.getElementById('edit-cancha-precio').value;
    const capacidad = document.getElementById('edit-cancha-capacidad').value;
    

    const resp = await fetch(`http://localhost:3000/canchas/${id}`, {
        method: 'PUT',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ nombre, tipo, ubicacion, precio_por_hora, capacidad })
    });

    if (resp.ok) {
        alert("Actualizado con éxito");
        mostrarCanchasEnTabla();

        const form = document.getElementById('form-editar-cancha'); 
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




