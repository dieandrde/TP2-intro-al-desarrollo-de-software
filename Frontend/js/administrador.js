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