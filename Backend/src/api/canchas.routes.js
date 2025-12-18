const express = require("express");
const router = express.Router();

const {
    obtener_canchas,
    obtener_cancha_id,
    crear_cancha,
    actualizar_cancha,
    eliminar_cancha
} = require("../controllers/canchas.controller");

router.get("/", obtener_canchas);

router.get("/:id", obtener_cancha_id);

router.post("/", crear_cancha);

router.put("/:id", actualizar_cancha);

router.delete("/:id", eliminar_cancha);

module.exports = router;