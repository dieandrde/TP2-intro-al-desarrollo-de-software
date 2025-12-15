
import { Router } from 'express';
import { pool } from "../db/db.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import jwt from 'jsonwebtoken';
import { verifyToken, requireAdmin } from '../middlewares/middlewares.js';
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;
const router = Router();



// Te devuelve todos los usuarios (sin password_hash)
router.get("/usuarios", verifyToken, requireAdmin, async (req, res) => {
    try {
        const sql = "SELECT id, nombre, email, telefono, fecha_registro, es_admin FROM usuarios"; 
        const result = await pool.query(sql);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "DB error" });
    }
});


// Te devuelve un usuario por ID (sin password_hash)
router.get("/usuarios/:id", verifyToken, async (req, res) => {
    const userId = req.params.id; 
    
    try {
        const sql = "SELECT id, nombre, email, telefono, fecha_registro, es_admin FROM usuarios WHERE id = $1";
        const result = await pool.query( sql, [userId]); 

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Usuario no encontrado." });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "DB error al obtener usuario." });
    }
});

// Crea un nuevo usuario
router.post("/usuarios", async (req, res) => {

  if ( req.body === undefined){
    return res.status(400).json({ error: "No hay body" });
  }

  const nombre = req.body.nombre;
  const email = req.body.email;
  const telefono = req.body.telefono;
  const password = req.body.password;

  if (!nombre) {
        return res.status(400).json({ message: 'Nombre es obligatorio para el registro.' });
  }
  if ( !email) {
        return res.status(400).json({ message: 'email es obligatorio para el registro.' });
  }
  if ( !password) {
        return res.status(400).json({ message: 'password es obligatorio para el registro.' });
  }
  if ( !telefono) {
        return res.status(400).json({ message: 'telefono es obligatorio para el registro.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const telefonoRegex = /^\d{10}$/

  if (!emailRegex.test(email)) {
        return res.status(400).json({ 
            message: 'El formato del email es inválido (debe ser usuario@dominio.com).' 
        });
  }
  
  if (!telefonoRegex.test(String(telefono))) {
    return res.status(400).json({ error: 'El número debe tener exactamente 10 dígitos' });
  }

    try {
        const password_hash = await bcrypt.hash(password, 10);
        
        const sql = `
            INSERT INTO usuarios (nombre, email, password_hash, telefono, es_admin, fecha_registro)
            VALUES ($1, $2, $3, $4, FALSE, CURRENT_DATE) 
            RETURNING id, nombre, email, telefono, es_admin, fecha_registro`;
        const result = await pool.query(sql, [nombre, email, password_hash, telefono]);
        res.status(201).json({ message: 'Usuario creado exitosamente', usuario: result.rows[0] });
    } catch (error) {
        
        if (error.code === '23505') { 
             return res.status(409).json({ message: 'Ya existe un usuario con este email.' });
        }
        
        res.status(500).json({ message: 'Error interno del servidor al crear usuario.', error: error.message });
    }
})




// Actualizar un usuario existente
router.put("/usuarios/:id", verifyToken, async (req, res) => {

    const userId = req.params.id;
    if ( !req.body){
        return res.status(400).json({ error: "No hay body" });
    }
    let result = await pool.query("SELECT id, nombre, email,password_hash, telefono, fecha_registro FROM usuarios WHERE id = $1", [userId]); 

    if (result.rows.length === 0) {
        return res.status(404).json({ message: "Usuario no encontrado." });
    }
    const nombre = req.body.nombre;
    const email = req.body.email;
    const telefono = req.body.telefono;
    const password = req.body.password;

    if (!nombre) {
            return res.status(400).json({ message: 'Nombre es obligatorio para el registro.' });
    }
    if ( !email) {
            return res.status(400).json({ message: 'email es obligatorio para el registro.' });
    }
    
    if ( !telefono) {
            return res.status(400).json({ message: 'telefono es obligatorio para el registro.' });
    }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const telefonoRegex = /^\d{10}$/

  if (!emailRegex.test(email)) {
        return res.status(400).json({ 
            message: 'El formato del email es inválido (debe ser usuario@dominio.com).' 
        });
  }
  
  if (!telefonoRegex.test(String(telefono))) {
    return res.status(400).json({ error: 'El número debe tener exactamente 10 dígitos' });
  }

    try {


        const userCheck = await pool.query("SELECT password_hash FROM usuarios WHERE id = $1", [userId]);
        
        if (userCheck.rows.length === 0) {
            return res.status(404).json({ message: "Usuario no encontrado." });
        }

        let finalPasswordHash = userCheck.rows[0].password_hash;

        if (password && password.trim() !== "") {
            // Si el admin escribió algo en el campo password, lo hasheamos
            finalPasswordHash = await bcrypt.hash(password, 10);
        }
        
        const sql = `
            UPDATE usuarios
            -- CRÍTICO: No incluimos 'es_admin' en el SET. No se puede auto-asignar admin.
            SET nombre = $1, email = $2, password_hash = $3, telefono = $4
            WHERE id = $5
            RETURNING id, nombre, email, telefono, fecha_registro, es_admin;
        `;

        const updated = await pool.query(sql, [
            nombre,
            email,
            finalPasswordHash,
            telefono,
            userId
        ]);
        
        res.status(200).json({
            message: "Usuario actualizado correctamente.",
            usuario: updated.rows[0]
        });
        
        

    } catch (error) {
        
        if (error.code === "23505") {
            return res.status(409).json({
                message: "Ya existe un usuario con este email."
            });
        }

        res.status(500).json({
            message: "Error interno del servidor al actualizar usuario.",
            error: error.message
        });
    }
})
// Borra un usuario
router.delete("/usuarios/:id", verifyToken, requireAdmin, async (req, res) => {
    const userId = req.params.id;

    try {
        const query = `DELETE FROM usuarios WHERE id = $1 RETURNING id, nombre, email, es_admin`;
        const result = await pool.query(query, [userId]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Usuario no encontrado." });
        }

        res.json({
            message: `Usuario con id ${userId} borrado exitosamente.`,
            usuario: result.rows[0]
        });

    } catch (err) {
        res.status(500).json({ error: "Error en la base de datos." });
    }
});

// Login de usuario
router.post("/login", async (req, res) => {


    
    const email = req.body.email ? req.body.email.trim() : null; 
    const password = req.body.password ? req.body.password.trim() : null; // <-- ¡AQUÍ!

    if ( !email) {

        return res.status(400).json({ message: 'email es obligatorio para el registro.' });
    }
    if ( !password) {
            return res.status(400).json({ message: 'password es obligatorio para el registro.' });
    }

    try {
        const userQuery = 'SELECT id, password_hash, es_admin FROM usuarios WHERE email = $1';
        const result = await pool.query(userQuery, [email]);

        if (result.rows.length === 0) {
            return res.status(401).json({ message: "Credenciales incorrectas." });
        }

        const user = result.rows[0];

        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatch) {
            return res.status(401).json({ message: "Credenciales incorrectas." });
        }

        const token = jwt.sign(
            { 
                id: user.id, 
                es_admin: user.es_admin 
            },
            JWT_SECRET, 
            { expiresIn: '1h' } 
        );


        res.status(200).json({
            message: "Login exitoso.",
            token: token,
            userId: user.id, 
            esAdmin: user.es_admin
        });

    } catch (error) {
        res.status(500).json({ message: "Error interno del servidor." });
    }
});


export default router;