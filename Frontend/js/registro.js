

async function registrarUsuario() {
    const url = 'http://localhost:3000/usuarios'; 

    try {

        const nombre = document.getElementById("form-nombre").value;
        const email = document.getElementById("form-email").value;
        const telefono = document.getElementById("form-telefono").value;
        const password = document.getElementById("form-contraseña").value;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json', // Le dice al Backend que espera JSON
            },
            body: JSON.stringify({  nombre, email, telefono, password   }), // Convierte el objeto JS a JSON (cadena de texto)
        });

        const resultado = await response.json();

        if (response.ok) {
            alert('Registro exitoso. ¡Ahora puedes iniciar sesión!');
            
            window.location.href = '/login.html'; 

        } else {
            // Maneja errores 400 (Validación) o 409 (Email duplicado)
            alert('Error al registrar: ' + resultado.message);
        }
    } catch (error) {
        console.error('Error de conexión:', error);
    }
}