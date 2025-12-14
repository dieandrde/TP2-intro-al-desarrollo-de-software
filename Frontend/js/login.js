async function iniciarSesion( ) {
    const url = 'http://localhost:3000/login'; 

    try{

        const email = document.getElementById("login-email").value;
        const password = document.getElementById("login-password").value;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email , password }),
        });

        const resultado = await response.json();

        if (response.ok) {
            localStorage.setItem('jwtToken', resultado.token);
            localStorage.setItem('esAdmin', resultado.esAdmin);
            
            if (resultado.esAdmin) {
                window.location.href = '/administrador.html'; 
            } else {
                window.location.href = '/index.html'; 
            }
        } else {
            alert('Fallo en el Login: ' + resultado.message);
        }
    } catch (error) {
        console.error('Error de conexión:', error);
    }


}