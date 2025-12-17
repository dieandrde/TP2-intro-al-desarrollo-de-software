import { Router } from 'express';
import { crearReserva } from '../controllers/reservas.controller.js';

const router = Router();

// Esta es la ruta POST que mencionabas
router.post('/', crearReserva);

export default router;