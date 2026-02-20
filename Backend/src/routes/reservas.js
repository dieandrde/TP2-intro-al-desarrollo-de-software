import moment from "moment";
import { Router } from 'express';
import { pool } from "../db/db.js";
import dotenv from "dotenv";
import { verifyToken, requireAdmin } from '../middlewares/middlewares.js';
dotenv.config();
const router = Router();

router.get("/reservas",verifyToken, requireAdmin, async (req, res) => {
    
    let query = `
        SELECT 
            r.id   ,
            r.fecha, 
            r.hora_inicio, 
            r.hora_fin, 
            r.costo_total, 
            r.cancha_id, 
            r.usuario_id,
            c.nombre AS cancha_nombre,     -- Nombre de la cancha
            u.nombre AS usuario_nombre     -- Nombre del usuario
        FROM reservas r
        LEFT JOIN canchas c ON r.cancha_id = c.id
        LEFT JOIN usuarios u ON r.usuario_id = u.id
    `;


    try {
        const resultado = await pool.query(query);
        res.json(resultado.rows);
    } catch (error) {
        console.error("Error al obtener reservas:", error);
        res.status(500).json({ mensaje: "Error interno del servidor." });
    }
});
router.get("/reservas/:id", async (req, res) => {
    const id = req.params.id;

    try {
        const GET_RESERVA_BY_ID = `
            SELECT 
                r.id, 
                r.fecha, 
                r.hora_inicio, 
                r.hora_fin, 
                r.costo_total, 
                r.cancha_id, 
                r.usuario_id,
                c.nombre AS cancha_nombre,
                u.nombre AS usuario_nombre
            FROM reservas r
            JOIN canchas c ON r.cancha_id = c.id
            JOIN usuarios u ON r.usuario_id = u.id
            WHERE r.id = $1;
        `;
        const resultado = await pool.query(GET_RESERVA_BY_ID, [id]);

        if (resultado.rowCount === 0) {
            return res.status(404).json({ mensaje: "Reserva no encontrada." });
        }
        res.json(resultado.rows[0]); 
    } catch (error) {
        console.error("Error al obtener reserva por ID:", error);
        res.status(500).json({ mensaje: "Error interno del servidor." });
    }
});
//reservas
router.post("/reservas", verifyToken, async (req, res) => {
    const { cancha_id, fecha, hora_inicio, hora_fin  } = req.body;
    const usuario_id = req.user.id; // obtencion id

    // VALIDACION la hora de inicio no puede ser igual o posterior a la hora de fin
    if (hora_inicio >= hora_fin) {
        return res.status(400).json({ 
            mensaje: "La hora de inicio debe ser anterior a la hora de fin." 
        });
    }

    try {
        
        // VALIDACIONES DE TIEMPO
        const ahora = moment();
        const fechaReserva = moment(fecha);
        const inicio = moment(`${fecha} ${hora_inicio}`, "YYYY-MM-DD HH:mm");
        const fin = moment(`${fecha} ${hora_fin}`, "YYYY-MM-DD HH:mm");

        // LA FECHA NO DEBE SER PASADA
        if (fechaReserva.isBefore(ahora, 'day')) {
            return res.status(400).json({ mensaje: "No puedes reservar en una fecha pasada." });
        }

        // SI ESTAMOS EN EL DIA DE HOY, LA HORA NO DEBE SER PASADA
        if (fechaReserva.isSame(ahora, 'day') && inicio.isBefore(ahora)) {
            return res.status(400).json({ mensaje: "La hora de inicio ya pasó." });
        }

        //  LOGICA DE DURACION DE RESERVAS
        const duracionHoras = fin.diff(inicio, 'hours', true);
        if (duracionHoras <= 0) {
            return res.status(400).json({ mensaje: "La hora de fin debe ser posterior al inicio." });
        }
        const apertura = moment(`${fecha} 08:00`, "YYYY-MM-DD HH:mm");
        const cierre = moment(`${fecha} 22:00`, "YYYY-MM-DD HH:mm");

        if (inicio.isBefore(apertura) || fin.isAfter(cierre)) {
            return res.status(400).json({ 
                mensaje: "Solo se permiten reservas entre las 08:00 y las 22:00." 
            });
        }
        // CALCULO DE COSTO
        const canchaInfo = await pool.query("SELECT precio_por_hora FROM canchas WHERE id = $1", [cancha_id]);
        
        if (canchaInfo.rowCount === 0) {
            return res.status(404).json({ mensaje: "La cancha especificada no existe." });
        }

        const precioHora = parseFloat(canchaInfo.rows[0].precio_por_hora);
        const costo_total = precioHora * duracionHoras;
        
        
        // LOGICA DE DISPONIBILIDAD DE CANCHAS
        // se busca si ya existe una reserva para esta cancha en ese rango de tiempo
        // WHERE complejo para cubrir todos los casos 
        const CHECK_AVAILABILITY = `
            SELECT id
            FROM reservas
            WHERE cancha_id = $1 
              AND fecha = $2 
              AND estado = 'confirmada'
              AND (
                  -- CASO 1
                  ($3 < hora_fin AND $3 >= hora_inicio) 
                  -- caso2 
               OR ($4 > hora_inicio AND $4 <= hora_fin)
                  --  caso 3
               OR ($3 <= hora_inicio AND $4 >= hora_fin)
              )
            LIMIT 1;
        `;
        
        const availabilityCheck = await pool.query(CHECK_AVAILABILITY, [
            cancha_id, 
            fecha, 
            hora_inicio,
            hora_fin      
        ]);
        if (availabilityCheck.rows.length > 0) {
            // horario ocupado
            return res.status(409).json({ 
                mensaje: "Error: La cancha no está disponible en el horario solicitado" 
            });
        }

        // se añade resrva
        const CREATE_RESERVA = `
            INSERT INTO reservas (usuario_id, cancha_id, fecha, hora_inicio, hora_fin, costo_total)
            VALUES ($1, $2, $3, $4, $5, $6 )
            RETURNING *; -- returning reserva
        `;

        const resultado = await pool.query(CREATE_RESERVA, [
            usuario_id,
            cancha_id,
            fecha,
            hora_inicio,
            hora_fin,
            costo_total
        ]);

        // creacion exitosa201
        res.status(201).json(resultado.rows[0]);

    } catch (error) {
        console.error("Error al crear la reserva:", error);
        
        // manejo errores foreign key
        if (error.code === '23503') {
            return res.status(400).json({ 
                mensaje: "Error de datos: El usuario o la cancha no existen" 
            });
        }
        
        res.status(500).json({ mensaje: "Error interno del servidor al procesar la reserva" });
    }
});
router.put("/reservas/:id", verifyToken, async (req, res) => {
    const id = req.params.id;
    const { cancha_id, fecha, hora_inicio, hora_fin } = req.body;
    const usuario_id_token = req.user.id; // ID quien hace peticion
    const esAdmin = req.user.es_admin;      //se verifica si es admin

    try {
        // VERIFICACION RESERVA.EXISTE? QUIEN LA HIZO?
        const reservaExistente = await pool.query("SELECT usuario_id FROM reservas WHERE id = $1", [id]);

        if (reservaExistente.rowCount === 0) {
            return res.status(404).json({ mensaje: "Reserva no encontrada." });
        }

        const dueñoDeLaReserva = reservaExistente.rows[0].usuario_id;

        //  OTRA VALIDACION
        // se prohibe accion si no es dueño de la reserva y si no es admin
        if (dueñoDeLaReserva !== usuario_id_token && !esAdmin) {
            return res.status(403).json({ mensaje: "No tienes permiso para modificar esta reserva" });
        }

        // validacions de tiempo
        const inicio = moment(`${fecha} ${hora_inicio}`, "YYYY-MM-DD HH:mm");
        const fin = moment(`${fecha} ${hora_fin}`, "YYYY-MM-DD HH:mm");
        const duracionHoras = fin.diff(inicio, 'hours', true);

        if (duracionHoras <= 0) {
            return res.status(400).json({ mensaje: "La hora de fin debe ser posterior al inicio" });
        }

        const apertura = moment(`${fecha} 08:00`, "YYYY-MM-DD HH:mm");
        const cierre = moment(`${fecha} 22:00`, "YYYY-MM-DD HH:mm");

        if (inicio.isBefore(apertura) || fin.isAfter(cierre)) {
            return res.status(400).json({ 
                mensaje: "Solo se permiten reservas entre las 08:00 y las 22:00." 
            });
        }

        // re calcular costo
        const canchaInfo = await pool.query("SELECT precio_por_hora FROM canchas WHERE id = $1", [cancha_id]);
        if (canchaInfo.rowCount === 0) {
            return res.status(404).json({ mensaje: "La cancha especificada no existe" });
        }
        const costo_total = parseFloat(canchaInfo.rows[0].precio_por_hora) * duracionHoras;

        //verificacion, se ve si hay disponibilidad
        const CHECK_AVAILABILITY = `
            SELECT id FROM reservas
            WHERE cancha_id = $1 AND fecha = $2 AND id != $3 AND estado = 'confirmada'
            AND (($4 < hora_fin AND $4 >= hora_inicio) 
              OR ($5 > hora_inicio AND $5 <= hora_fin)
              OR ($4 <= hora_inicio AND $5 >= hora_fin))
            LIMIT 1;
        `;
        const availabilityCheck = await pool.query(CHECK_AVAILABILITY, [cancha_id, fecha, id, hora_inicio, hora_fin]);

        if (availabilityCheck.rows.length > 0) {
            return res.status(409).json({ mensaje: "Conflicto: El nuevo horario ya está ocupado." });
        }

        const UPDATE_RESERVA = `
            UPDATE reservas
            SET cancha_id = $1, fecha = $2, hora_inicio = $3, hora_fin = $4, costo_total = $5
            WHERE id = $6
            RETURNING *;
        `;
        const resultado = await pool.query(UPDATE_RESERVA, [cancha_id, fecha, hora_inicio, hora_fin, costo_total, id]);

        res.json({ mensaje: "Reserva actualizada con éxito", reserva: resultado.rows[0] });

    } catch (error) {
        console.error("Error al actualizar reserva:", error);
        res.status(500).json({ mensaje: "Error interno del servidor." });
    }
});    
router.delete("/reservas/:id", verifyToken, async (req, res) => {
    const id = req.params.id;         
    const usuario_id_token = req.user.id; 
    const esAdmin = req.user.es_admin;     

    try {
        // a quien le pertenece la rerserva
        const reservaExistente = await pool.query(
            "SELECT usuario_id FROM reservas WHERE id = $1", 
            [id]
        );

        // error 404 en caso de no existir
        if (reservaExistente.rowCount === 0) {
            return res.status(404).json({ mensaje: "No se encontró la reserva con ese ID." });
        }

        const dueñoDeLaReserva = reservaExistente.rows[0].usuario_id;

        if (dueñoDeLaReserva !== usuario_id_token && !esAdmin) {
            return res.status(403).json({ 
                mensaje: "No tienes permiso para cancelar esta reserva. Solo el dueño o un administrador puede hacerlo" 
            });
        }

        // delete reserva
        const DELETE_RESERVA = `
            DELETE FROM reservas
            WHERE id = $1
            RETURNING id;
        `;
        
        await pool.query(DELETE_RESERVA, [id]);

        res.status(200).json({ 
            mensaje: "Reserva con ID ${id} cancelada exitosamente. el horario ha sido liberado"
        });

    } catch (error) {
        console.error("Error al eliminar la reserva:", error);
        res.status(500).json({ mensaje: "error interno del servidor al intentar cancelar la reserva" });
    }
});
//me devuelve las reservas del usuario logueado
router.get("/mis_reservas", verifyToken, async (req, res) => {
    const usuario_id = req.user.id; //middleware VERIFYTOKEN logica importante

    try {
        const query = `
            SELECT 
                r.id, r.fecha, r.hora_inicio, r.hora_fin, r.costo_total, r.cancha_id,
                c.nombre AS cancha_nombre
            FROM reservas r
            JOIN canchas c ON r.cancha_id = c.id
            WHERE r.usuario_id = $1
            ORDER BY r.fecha DESC;
        `;
        const resultado = await pool.query(query, [usuario_id]);
        res.json(resultado.rows);
    } catch (error) {
        console.error("Error al obtener mis reservas:", error);
        res.status(500).json({ mensaje: "Error al obtener tus reservas" });
    }
});

export default router;