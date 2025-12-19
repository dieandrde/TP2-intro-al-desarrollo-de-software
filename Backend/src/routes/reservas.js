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


// POST /reservas
router.post("/reservas", verifyToken, async (req, res) => {
    const { cancha_id, fecha, hora_inicio, hora_fin  } = req.body;
    const usuario_id = req.user.id; // Obtenemos el ID del usuario autenticado desde el token

    // Validación básica: la hora de inicio no puede ser igual o posterior a la hora de fin.
    if (hora_inicio >= hora_fin) {
        return res.status(400).json({ 
            mensaje: "La hora de inicio debe ser estrictamente anterior a la hora de fin." 
        });
    }

    try {
        
        // --- 2. VALIDACIONES DE TIEMPO ---
        const ahora = moment();
        const fechaReserva = moment(fecha);
        const inicio = moment(`${fecha} ${hora_inicio}`, "YYYY-MM-DD HH:mm");
        const fin = moment(`${fecha} ${hora_fin}`, "YYYY-MM-DD HH:mm");

        // Validar que la fecha no sea pasada
        if (fechaReserva.isBefore(ahora, 'day')) {
            return res.status(400).json({ mensaje: "No puedes reservar en una fecha pasada." });
        }

        // Validar que la hora de inicio no sea pasada (si es hoy)
        if (fechaReserva.isSame(ahora, 'day') && inicio.isBefore(ahora)) {
            return res.status(400).json({ mensaje: "La hora de inicio ya pasó." });
        }

        // Validar lógica de duración
        const duracionHoras = fin.diff(inicio, 'hours', true);
        if (duracionHoras <= 0) {
            return res.status(400).json({ mensaje: "La hora de fin debe ser posterior al inicio." });
        }

        // --- 3. CÁLCULO DE COSTO REAL (Backend maneja el precio) ---
        const canchaInfo = await pool.query("SELECT precio_por_hora FROM canchas WHERE id = $1", [cancha_id]);
        
        if (canchaInfo.rowCount === 0) {
            return res.status(404).json({ mensaje: "La cancha especificada no existe." });
        }

        const precioHora = parseFloat(canchaInfo.rows[0].precio_por_hora);
        const costo_total = precioHora * duracionHoras;
        
        
        // 2. Lógica de Verificación de Disponibilidad (Solapamiento)
        // Buscamos si ya existe una reserva para esta cancha en el rango de tiempo.
        // Usamos un WHERE complejo para cubrir todos los casos de solapamiento.
        const CHECK_AVAILABILITY = `
            SELECT id
            FROM reservas
            WHERE cancha_id = $1 
              AND fecha = $2 
              AND estado = 'confirmada'
              AND (
                  -- Caso 1: El nuevo inicio ($3) está dentro de una reserva existente
                  ($3 < hora_fin AND $3 >= hora_inicio) 
                  -- Caso 2: El nuevo fin ($4) está dentro de una reserva existente
               OR ($4 > hora_inicio AND $4 <= hora_fin)
                  -- Caso 3: La nueva reserva envuelve completamente una reserva existente
               OR ($3 <= hora_inicio AND $4 >= hora_fin)
              )
            LIMIT 1;
        `;
        
        const availabilityCheck = await pool.query(CHECK_AVAILABILITY, [
            cancha_id, 
            fecha, 
            hora_inicio, // Corresponde a $3
            hora_fin       // Corresponde a $4
        ]);
        if (availabilityCheck.rows.length > 0) {
            // 409 Conflict: El horario ya está ocupado.
            return res.status(409).json({ 
                mensaje: "Error: La cancha no está disponible en el horario solicitado." 
            });
        }

        // 3. Inserción de la Reserva (Si pasa la validación de disponibilidad)
        const CREATE_RESERVA = `
            INSERT INTO reservas (usuario_id, cancha_id, fecha, hora_inicio, hora_fin, costo_total)
            VALUES ($1, $2, $3, $4, $5, $6 )
            RETURNING *; -- Retorna la reserva recién creada
        `;

        const resultado = await pool.query(CREATE_RESERVA, [
            usuario_id,
            cancha_id,
            fecha,
            hora_inicio,
            hora_fin,
            costo_total
        ]);

        // 201 Created: Respuesta estándar para una creación exitosa
        res.status(201).json(resultado.rows[0]);

    } catch (error) {
        console.error("Error al crear la reserva:", error);
        
        // 4. Manejo de Errores Específicos de la BD (Foreign Key)
        if (error.code === '23503') { // Código de error de PostgreSQL para Violación de FK
            return res.status(400).json({ 
                mensaje: "Error de datos: El usuario o la cancha especificada no existen." 
            });
        }
        
        // 500 Internal Server Error para cualquier otro problema no controlado
        res.status(500).json({ mensaje: "Error interno del servidor al procesar la reserva." });
    }
});

router.put("/reservas/:id", verifyToken, async (req, res) => {
    const id = req.params.id;
    const { cancha_id, fecha, hora_inicio, hora_fin } = req.body;
    const usuario_id_token = req.user.id; // ID de quien hace la petición
    const esAdmin = req.user.es_admin;      // ¿Es administrador?

    try {
        // 1. PRIMERO: Verificar si la reserva existe y a quién pertenece
        const reservaExistente = await pool.query("SELECT usuario_id FROM reservas WHERE id = $1", [id]);

        if (reservaExistente.rowCount === 0) {
            return res.status(404).json({ mensaje: "Reserva no encontrada." });
        }

        const dueñoDeLaReserva = reservaExistente.rows[0].usuario_id;

        //  VALIDACIÓN DE PROPIEDAD:
        // Si no es el dueño Y no es administrador, prohibir la acción.
        if (dueñoDeLaReserva !== usuario_id_token && !esAdmin) {
            return res.status(403).json({ mensaje: "No tienes permiso para modificar esta reserva." });
        }

        // 2. VALIDACIONES DE TIEMPO (Usando moment igual que en el POST)
        const inicio = moment(`${fecha} ${hora_inicio}`, "YYYY-MM-DD HH:mm");
        const fin = moment(`${fecha} ${hora_fin}`, "YYYY-MM-DD HH:mm");
        const duracionHoras = fin.diff(inicio, 'hours', true);

        if (duracionHoras <= 0) {
            return res.status(400).json({ mensaje: "La hora de fin debe ser posterior al inicio." });
        }

        // 3. RE-CALCULAR COSTO (En caso de que cambien de cancha o de horario)
        const canchaInfo = await pool.query("SELECT precio_por_hora FROM canchas WHERE id = $1", [cancha_id]);
        if (canchaInfo.rowCount === 0) {
            return res.status(404).json({ mensaje: "La cancha especificada no existe." });
        }
        const costo_total = parseFloat(canchaInfo.rows[0].precio_por_hora) * duracionHoras;

        // 4. VERIFICAR DISPONIBILIDAD (Excluyendo la reserva actual)
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

        // 5. EJECUTAR ACTUALIZACIÓN
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

