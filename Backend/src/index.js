
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import usuariosRoutes from './routes/usuarios.js';
import canchasRoutes from './routes/canchas.js';
import reservasRoutes from './routes/reservas.js';
dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());


app.use(usuariosRoutes);
app.use(canchasRoutes);
app.use(reservasRoutes);




const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Servidor corriendo en http://localhost:" + PORT);
});
