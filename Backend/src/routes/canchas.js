import { Router } from 'express';
import { pool } from "../db/db.js";
import dotenv from "dotenv";
import { verifyToken, requireAdmin } from '../middlewares/middlewares.js';

dotenv.config();
const router = Router();

router.get("/canchas", async (req, res) => {
    try {
        const GET_CANCHAS = `
        SELECT id, nombre, tipo, precio_por_hora, ubicacion, capacidad
        FROM canchas
        ORDER BY id ASC;
        `;

        const resultado = await pool.query(GET_CANCHAS);
        res.json(resultado.rows);
    } catch (error) {
        console.error("error al obtener la cancha:", error);
        res.status(500).json({ mensaje: "error interno del servidor" });
    }
});

router.get("/canchas/:id", async (req, res) => {
    const id = req.params.id;

    try {
        const GET_CANCHA_BY_ID = `
        SELECT id, nombre, tipo, precio_por_hora, ubicacion, capacidad
        FROM canchas
        WHERE id = $1;
        `;

        const resultado = await pool.query(GET_CANCHA_BY_ID, [id]);

        if (resultado.rows.length === 0) {
            return res.status(404).json({ mensaje: "la cancha no se encontro" });
        }

        res.json(resultado.rows[0]);
    } catch (error) {
        console.error("error al obtener cancha:", error);
        res.status(500).json({ mensaje: "error interno del servidor" });
    }
});

router.post("/canchas", verifyToken, requireAdmin, async (req, res) => {
    const { nombre, tipo, precio_por_hora, ubicacion, capacidad } = req.body;

    try {
        const CREATE_CANCHA = `
        INSERT INTO canchas (nombre, tipo, precio_por_hora, ubicacion, capacidad)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
        `;

        const resultado = await pool.query(CREATE_CANCHA, [
            nombre,
            tipo,
            precio_por_hora,
            ubicacion,
            capacidad
        ]);

        res.status(201).json(resultado.rows[0]);
    } catch (error) {
        console.error("error al crear cancha:", error);
        res.status(500).json({ mensaje: "error interno del servidor" });
    }
});


export default router;