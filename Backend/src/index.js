
import express from "express";
import cors from "cors";
import { pool } from "./db/db.js";
import bcrypt from "bcryptjs";
const app = express();
app.use(express.json());
app.use(cors());



//CREATE TABLE usuarios (
//  id SERIAL PRIMARY KEY,
//  nombre VARCHAR(100) NOT NULL,
//  email VARCHAR(100) UNIQUE NOT NULL,
//  password_hash VARCHAR(255) NOT NULL, 
//  telefono VARCHAR(20),
//  fecha_registro DATE NOT NULL DEFAULT CURRENT_DATE,
//);


app.get("/usuarios", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM usuarios " );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "DB error" });
    }
});




app.get("/usuarios/:id", async (req, res) => {
    const userId = req.params.id; 
    
    try {
        const result = await pool.query("SELECT id, nombre, email,password_hash, telefono, fecha_registro FROM usuarios WHERE id = $1", [userId]); 

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Usuario no encontrado." });
        }
        console.log(result.rows[0]);
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "DB error al obtener usuario." });
    }
});


app.post("/usuarios", async (req, res) => {

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
            INSERT INTO usuarios (nombre, email, password_hash, telefono)
            VALUES ($1, $2, $3, $4)
            RETURNING id, nombre, email, telefono, fecha_registro`;
        const result = await pool.query(sql, [nombre, email, password_hash, telefono]); 

        res.status(201).json({ message: 'Usuario creado exitosamente', usuario: result.rows[0] });

    } catch (error) {
        
        if (error.code === '23505') { 
             return res.status(409).json({ message: 'Ya existe un usuario con este email.' });
        }
        
        res.status(500).json({ message: 'Error interno del servidor al crear usuario.', error: error.message });
    }
})





app.put("/usuarios/:id", async (req, res) => {

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
            UPDATE usuarios
            SET nombre = $1, email = $2, password_hash = $3, telefono = $4
            WHERE id = $5
            RETURNING id, nombre, email, telefono, fecha_registro;
        `;

        const updated = await pool.query(sql, [
            nombre,
            email,
            password_hash,
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

app.delete("/usuarios/:id", async (req, res) => {
    const userId = req.params.id;

    try {
        const query = `DELETE FROM usuarios WHERE id = $1 RETURNING id, nombre, email`;
        const result = await pool.query(query, [userId]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Usuario no encontrado." });
        }

        res.json({
            message: `Usuario con id ${userId} borrado exitosamente.`,
            usuario: result.rows[0]
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error en la base de datos." });
    }
});



