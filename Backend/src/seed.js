import bcrypt from 'bcryptjs';
import { pool } from './db/db.js';
import dotenv from "dotenv";
dotenv.config();
const crearAdminInicial = async () => {
    // Usamos variables de entorno o valores por defecto
    const email = process.env.ADMIN_EMAIL || 'admin@sistema.com';
    const password = process.env.ADMIN_PASSWORD || 'AdminPassword123';
    const nombre = 'Administrador Global';

    try {
        // 1. Verificar si ya existe un admin con ese email
        const existe = await pool.query("SELECT id FROM usuarios WHERE email = $1", [email]);

        if (existe.rowCount > 0) {
            console.log(" El administrador ya se encuentra registrado.");
            return; // Salimos sin intentar insertar
        }

        // 2. Hashear la contraseña
        const hash = await bcrypt.hash(password, 10);

        // 3. Insertar
        await pool.query(
            "INSERT INTO usuarios (nombre, email, password_hash, telefono, es_admin) VALUES ($1, $2, $3, $4, $5)",
            [nombre, email, hash, '0000000000', true]
        );
        
        console.log(` Administrador creado con éxito: ${email}`);

    } catch (err) {
        console.error(" Error al crear el administrador:", err.message);
    } finally {
        // Cerramos la conexión a la base de datos antes de salir
        await pool.end();
        process.exit();
    }
};

crearAdminInicial();

