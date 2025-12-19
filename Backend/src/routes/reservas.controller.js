const crearReserva = async (req, res) => {
    const {
        ususario_id,
        canchas_id,
        fecha,
        hora_inicio,
        hora_fin
    } = req.body;

    if (!ususario_id || !canchas_id || !fecha || !hora_inicio || !hora_fin) {
        return res.status(400).json({ error: 'Datos incompletos'});
    }

    if (hora_inicio >= hora_fin) {
        return res.status(400).json({
            error: 'Hora inicio debe ser menor a hora fin'
        });
    }

    const disponible = await canchaDisponible(
        canchas_id,
        fecha,
        hora_inicio,
        hora_fin
    );

    if (!disponible) {
        return res.status(409).json({
            error: 'La cancha no esta disponible en ese horario'
        });
    }

    await db.query(
         `
    INSERT INTO reservas
      (usuario_id, canchas_id, fecha, hora_inicio, hora_fin)
    VALUES (?, ?, ?, ?, ?)
    `,
    [ususario_id, canchas_id, fecha, hora_inicio, hora_fin]
    );

    res.status(201).json({
        mensaje: 'Reserva creada en estado pendiente'
    })
};