import bcrypt from 'bcryptjs';
import { pool } from './db/db.js';
import dotenv from "dotenv";
dotenv.config();


const crearAdminInicial = async () => {
    const email = 'admin@sistema.com';
    const password = 'AdminPassword123';
    const hash = await bcrypt.hash(password, 10);

    try {
        await pool.query(
            "INSERT INTO usuarios (nombre, email, password_hash, telefono, es_admin) VALUES ($1, $2, $3, $4, $5)",
            ['Administrador Global', email, hash, '0000000000', true]
        );
        console.log("✅ Administrador creado con éxito");
    } catch (err) {
        console.log("⚠️ El admin ya existe o hubo un error:", err.message);
    } finally {
        process.exit();
    }
};

crearAdminInicial();



