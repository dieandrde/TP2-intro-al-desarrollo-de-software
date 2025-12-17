import express from "express";
import cors from "cors";
import { pool } from "./db/db.js";
import { crearReserva, obtenerReservas } from "./controllers/reservas.controller.js";


const app = express();

app.use(express.json());

app.use(cors()); 

app.get("/", (req, res) => {
    res.json({ message: "Backend funcionando" });
});
//
app.get("/api/reservas", obtenerReservas);

app.post("/api/reservas", crearReserva);


const PORT = 3000;
app.listen(PORT, () => {
    console.log("Servidor corriendo en http://localhost:" + PORT);
});

