# TP2 - Sistema de Reserva de Canchas - FIUBA

## Descripción del Proyecto
Este sistema es una plataforma integral para la gestión y reserva de canchas.

* **Backend:** Construido con Node.js y Express, utilizando PostgreSQL como base de datos.
* **Frontend:** Interfaz dinámica desarrollada en HTML, CSS y JavaScript vainilla, consumiendo la API de forma asincrónica.
* **Infraestructura:** Uso de Docker para la contenerización de la base de datos, garantizando un entorno de desarrollo consistente.

---

## 🛠️ Configuracion y Ejecucion
### 🟢 Levantar el Backend
1. Navegá a la carpeta del servidor:
   ```bash
   cd Backend
   crear un archivo .env donde dentro tiene que tener esto:
   DATABASE_URL=postgres://postgres:postgres@localhost:5432/fiumbr
   url para que el backend se conecte a la base de datos
   JWT_SECRET="intro2c2025" 
   key para crear los token
   ADMIN_EMAIL="admin@gmail.com"
   email de administrador para que se cree un usuario administrador
   ADMIN_PASSWORD="admin1234"
   passwrod de administrador para que se cree un ususario administrador y es el el que se usa para iniciar sesion

2. Levanta del docker compose:
   ```bash
   docker compose up -d
   // para crear ls tablas tenes que entrar al postgre asi:
   docker exec -it backend-db-1 psql -U postgres -d fiumbr
   // luego poner esto en la terminal este sql :

CREATE TABLE Usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    fecha_registro DATE NOT NULL DEFAULT CURRENT_DATE,
    es_admin BOOLEAN NOT NULL DEFAULT FALSE
);


CREATE TABLE canchas (
    id SERIAL PRIMARY KEY,
    nombre varchar(100) not null,
    tipo varchar(50) not null,
    precio_por_hora decimal(10,2) not null,
    ubicacion varchar(255),
    capacidad int not null
);


CREATE TABLE reservas (
    id SERIAL PRIMARY KEY,
    
    usuario_id INTEGER NOT NULL 
        REFERENCES usuarios(id) 
        ON DELETE CASCADE, 
    
    cancha_id INTEGER NOT NULL 
        REFERENCES canchas(id) 
        ON DELETE CASCADE,
        
    fecha DATE NOT NULL,
   hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    costo_total DECIMAL(10, 2) NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'confirmada'
); 


3. Instala las dependencias necesarias:
   ```bash
   npm install
4. Corre el servidor:
   ```bash
   npm run dev
   npm run seed-db
   //para que se cre el ususario administrador con el email y password anteriores
### 🔵 Levantar el Frontend
1. Navega a la carpeta de la interfaz:
   ```bash
   cd Frontend
2. Inicia el servidor:
   ```bash
   npx http-server
3. Abrí tu navegador en la dirección 
   ```bash
   http://localhost:8080
