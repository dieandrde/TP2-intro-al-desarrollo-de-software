import { pool } from "../db/db.js";
import { canchaDisponible } from "../services/disponibilidad.service.js";


export const crearReserva = async (req, res) => {
    try {
        const { usuario_id, cancha_id, fecha, hora_inicio, hora_fin, precio_por_hora } = req.body;

        console.log("Intentando insertar:", req.body);

        //Validacion: si esta libre 
        const disponible = await canchaDisponible(cancha_id, fecha, hora_inicio, hora_fin);

        if (!disponible) {
            console.log("BLOQUEADO: Cancha ocupada"); // Agregá este log para ver en tu terminal
            return res.status(409).json({ error: 'La cancha ya está ocupada en ese horario' });
        }

        //INSERT con sintaxis de Postgres ($1, $2, etc.)
        const query = `
            INSERT INTO reservas (usuario_id, cancha_id, fecha, hora_inicio, hora_fin, costo_total)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `;
        
        const costo_total = precio_por_hora || 5000;
        const values = [usuario_id, cancha_id, fecha, hora_inicio, hora_fin, costo_total];
        
        const resultado = await pool.query(query, values);
        //
        res.status(201).json({
            mensaje: 'Reserva creada exitosamente',
            reserva: resultado.rows[0]
        });

    } catch (error) {
        console.error("ERROR REAL:", error.message);
        res.status(500).json({ error: 'Error en el servidor', detalle: error.message });
    }
};

