async function registrarUsuario() {
    const url = 'https://tp2-intro-al-desarrollo-de-software-db.onrender.com/usuarios'; 

    try {

        const nombre = document.getElementById("form-nombre").value;
        const email = document.getElementById("form-email").value;
        const telefono = document.getElementById("form-telefono").value;
        const password = document.getElementById("form-contraseña").value;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json', // backend espera json
            },
            body: JSON.stringify({  nombre, email, telefono, password   }), // conversion de js a json
        });

        const resultado = await response.json();

        if (response.ok) {
            alert('Registro exitoso. ¡Ahora puedes iniciar sesión!');
            
            window.location.href = '/login.html'; 

        } else {
            alert('Error al registrar: ' + resultado.message);
        }
    } catch (error) {
        console.error('Error de conexión:', error);
    }
}