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
