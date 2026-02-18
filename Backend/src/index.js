import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import usuariosRoutes from './routes/usuarios.js';
import canchasRoutes from './routes/canchas.js';
import reservasRoutes from './routes/reservas.js';

dotenv.config();
const app = express();

//cors front
app.use(cors({
  origin: ["https://tp2-intro-al-desarrollo-de-software-front.onrender.com","http://localhost:8081"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

//mensaje bienvenida de backend

app.get('/', (req, res) => {
  res.send(`
    <h1>BIENVENIDO AL SERVIDOR BACKEND - TP2 INTRODUCCIÓN AL DESARROLLO DE SOFTWARE</h1>
    <h2>Creamos un sistema de gestión de reservas para canchas deportivas</h2>
    <p>Estado: <span style="color: green;">Online</span></p>
    <p>Acceso acá: <a href="https://tp2-intro-al-desarrollo-de-software-front.onrender.com/">Ir al Frontend</a></p>
    <hr>
    <small>ENTIDADES: usuarios<-->reservas<-->canchas </small>
    <footer>Fideos con tuco's project</footer>
  `);
});

app.use(express.json());


app.use(usuariosRoutes);
app.use(canchasRoutes);
app.use(reservasRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
