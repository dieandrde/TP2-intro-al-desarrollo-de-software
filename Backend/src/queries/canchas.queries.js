export const GET_CANCHAS = `
    SELECT id, nombre, tipo, precio_por_hora, ubicacion, capacidad
    FROM canchas
    ORDER BY id ASC;
`;

export const GET_CANCHA_BY_ID = 
    `
    SELECT id, nombre, tipo, precio_por_hora, ubicacion, capacidad
    FROM canchas
    WHERE id = $1;`;

export const CREATE_CANCHA = `
    INSERT INTO canchas (nombre, tipo, precio_por_hora, ubicacion, capacidad)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;`;

export const UPDATE_CANCHA = `
    UPDATE canchas
    SET nombre = $1,
        tipo = $2,
        precio_por_hora = $3,
        ubicacion = $4,
        capacidad = $5
    WHERE id = $6
    RETURNING *;
`;

export const DELETE_CANCHA = `
    DELETE FROM canchas
    WHERE id = $1
    RETURNING *;
`;