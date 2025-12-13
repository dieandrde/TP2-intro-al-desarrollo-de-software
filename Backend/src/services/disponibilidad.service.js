const db = require('../db')

const canchaDisponible = async (
    canchasId,
    fecha,
    horaInicio,
    horaFin
) => {
    const [reservas] = await  db.query(
        `
    SELECT id
    FROM reservas
    WHERE canchas_id = ?
      AND fecha = ?
      AND estado IN ('pendiente', 'confirmado')
      AND hora_inicio < ?
      AND hora_fin > ?
    `,
    [canchasId, fecha, horaFin, horaInicio]
    );

    return reservas.length === 0;
};

module.export = { canchaDisponible}