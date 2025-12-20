import bcrypt from "bcryptjs";
import { pool } from "./db/db.js";
import dotenv from "dotenv";

dotenv.config();

const crear_admin_inicio = async () => {
    const email = process.env.ADMIN_EMAIL || "admin@sistema.com";
    const password = process.env.ADMIN_PASSWORD || "AdminPassword123";
    const nombre = "administrador Global";

    try {
        //esto espera a q la base de datos este disponible
        let conectado = false;

    for (let i = 0; i < 5; i++) {
        try {
            await pool.query("SELECT 1");
            conectado = true;
            break;

        } catch (err) {
            console.log("esperando conexion con la base de datos...");
            await new Promise((res) => setTimeout(res, 3000));
        }
    }

    if (!conectado) {
        console.error("error. no se pudo conectar a la base de datos.");
        return;
    }

    //verifica si admin existe
    const existe = await pool.query(
        "SELECT id FROM usuarios WHERE email = $1",
        [email]
    );

    if (existe.rowCount > 0) {
        console.log("el administrador ya existe.");
        return;
    }

    // hashear contraseña
    const hash = await bcrypt.hash(password, 10);

    // crear admin
    await pool.query(
        `INSERT INTO usuarios (nombre, email, password_hash, telefono, es_admin)
        VALUES ($1, $2, $3, $4, $5)`,
        [nombre, email, hash, "0000000000", true]
    );

    console.log(`administrador creado correctamente: ${email}`);
    } catch (err) {
        console.error("error al crear el administrador:", err.message);
    }
};

crear_admin_inicio();


