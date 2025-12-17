import { pool } from '../db/db.js';

//usamos 'export' para que el controlador lo pueda encontrar
export const canchaDisponible = async (canchaId, fecha, horaInicio, horaFin) => {
    const query = `
        SELECT id 
        FROM reservas 
        WHERE cancha_id = $1 
        AND fecha = $2 
        AND estado != 'Cancelada'
        AND NOT (
            hora_fin <= $3 OR hora_inicio >= $4
        );
    `;
    //es igual pero por las dudas 

    const res = await pool.query(query, [canchaId, fecha, horaInicio, horaFin]);
    
    // si no hay filas,la cancha está disponible
    return res.rows.length === 0;
};