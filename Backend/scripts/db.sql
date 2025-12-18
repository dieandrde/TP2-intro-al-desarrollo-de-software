CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, 
    telefono VARCHAR(20),
    fecha_registro DATE NOT NULL DEFAULT CURRENT_DATE
);

CREATE TABLE canchas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    tipo VARCHAR(50) NOT NULL, 
    precio_por_hora DECIMAL(10, 2) NOT NULL,
    ubicacion VARCHAR(255),
    capacidad INT NOT NULL
);
CREATE TABLE reservas (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id), 
    cancha_id INTEGER NOT NULL REFERENCES canchas(id),   
    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    costo_total DECIMAL(10, 2) NOT NULL, 
    estado VARCHAR(20) NOT NULL DEFAULT
);

INSERT INTO usuarios (nombre, email, password_hash, telefono, fecha_registro)
VALUES 
('Jordan Silva', 'jordan.silva@fmail.com', 'hasheado_jordan_1234', '+54 9 11 5555-1234', '2025-11-11'),
('Alexis Martinez', 'alexis.m@fmail.com', 'hash_alexis_3456', '+54 9 11 1234-0001', '2025-12-10'),
('Sofía Torres', 'sofia.t@fmail.com', 'hash_sofia_7890', '+54 9 11 1234-0002', '2025-12-13');
--no le pongo fecha de registro porque asigna la fecha actual aunque lo podria poner 
