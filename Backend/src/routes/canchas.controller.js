const db = require("../db");

const {
    GET_CANCHAS,
    GET_CANCHA_BY_ID,
    CREATE_CANCHA,
    UPDATE_CANCHA,
    DELETE_CANCHA
} = require("./canchas.queries");


const obtener_canchas = async (req, res) => {
    try {
        const resultado = await db.query(GET_CANCHAS);
        res.json(resultado.rows);
    } catch (error) {
        console.error("error al obtener la canhca:", error);
        res.status(500).json({ mensaje: "error interno del servidor" });
    }
};

const obtener_cancha_id = async (req, res) => {
    const id = req.params.id;

    try {
        const resultado = await db.query(GET_CANCHA_BY_ID, [id]);

        if (resultado.rows.length === 0) {
            return res.status(404).json({ mensaje: "la cancha no se encontro" });
        }

        res.json(resultado.rows[0]);
    } catch (error) {
        console.error("error al obtener cancha:", error);
        res.status(500).json({ mensaje: "error interno del servidor" });
    }
};


const crear_cancha = async (req, res) => {
    const { nombre, tipo, precio_por_hora, ubicacion, capacidad } = req.body;

    try {
        const resultado = await db.query(CREATE_CANCHA, [
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
};


const actualizar_cancha = async (req, res) => {
    const id = req.params.id;
    const { nombre, tipo, precio_por_hora, ubicacion, capacidad } = req.body;

    try {
        const resultado = await db.query(UPDATE_CANCHA, [
            nombre,
            tipo,
            precio_por_hora,
            ubicacion,
            capacidad,
            id
        ]);

        if (resultado.rowCount === 0) {
            return res.status(404).json({ mensaje: "no se encontro la cancha" });
        }

        res.json(resultado.rows[0]);
    } catch (error) {
        console.error("error al actualizar cancha:", error);
        res.status(500).json({ mensaje: "error interno del servidor" });
    }
};

const eliminar_cancha = async (req, res) => {
    const id = req.params.id;

    try {
        const resultado = await db.query(DELETE_CANCHA, [id]);

        if (resultado.rowCount === 0) {
            return res.status(404).json({ mensaje: "no se encontro la cancha" });
        }

        res.json({ mensaje: "cancha eliminada" });
    } catch (error) {
        console.error("error al eliminar la canhca:", error);
        res.status(500).json({ mensaje: "error interno del servidor" });
    }
};

module.exports = {
    obtener_canchas,
    obtener_cancha_id,
    crear_cancha,
    actualizar_cancha,
    eliminar_cancha
};
