CREATE TABLE canchas (
    id SERIAL PRIMARY KEY,
    nombre varchar(100) not null,
    tipo varchar(50) not null,
    precio_por_hora decimal(10,2) not null,
    ubicacion varchar(255),
    capacidad int not null,
);