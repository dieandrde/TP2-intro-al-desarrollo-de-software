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

export const obtenerReservas = async (req, res) => {
    try {
    //Traemos todas las reservas y las ordenamos por fecha
        const query = 'SELECT * FROM reservas ORDER BY fecha DESC, hora_inicio DESC';
        const resultado = await pool.query(query);

    //  Respondemos con la lista de reservas en formato JSON(yeisson)
        res.status(200).json(resultado.rows);
    } catch (error) {
        console.error("ERROR AL OBTENER:", error.message);
        res.status(500).json({ error: 'Error al obtener las reservas' });
    }
};

export const eliminarReserva = async (req, res) => {
    try {
        const {id} = req.params; // Sacamos el ID de la URL
        const resultado = await pool.query('DELETE FROM reservas WHERE id = $1 RETURNING *', [id]);

        if (resultado.rowCount === 0) {
            return res.status(404).json({ error: 'Reserva no encontrada' });
        }
        res.status(200).json({ mensaje: 'Reserva cancelada exitosamente', reserva: resultado.rows[0] });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar la reserva' });
    }
};




