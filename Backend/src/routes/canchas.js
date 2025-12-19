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

export default router;