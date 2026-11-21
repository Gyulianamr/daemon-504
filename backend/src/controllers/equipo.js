/* ═══════════════════════════════════════════════════════════════════
 * ESTA PARTE LA TIENE QUE INTEGRAR: Jatniel Oliva
 * Tarea A3-04 · Rama: feature/a3-equipo · Turno 2 (fecha máxima: jueves 19 de noviembre)
 * Commit: "feat(equipo): endpoints de /api/equipo"
 * ═══════════════════════════════════════════════════════════════════ */
// Lee y valida el formato de la solicitud (id de la criatura y apodo) y llama al servicio.
import * as servicio from '../services/equipo.js';
import { enteroPositivo } from '../middleware/validar.js';
import { fallar } from '../middleware/ErrorApi.js';

const idCriatura = (req) =>
  enteroPositivo(req.params.id, 'El id de la criatura debe ser un número entero mayor que 0.');

// GET /api/equipo
export async function listar(req, res) {
  res.json(await servicio.listarEquipo(req.personajeId));
}

// PATCH /api/equipo/:id/activa
export async function hacerActiva(req, res) {
  res.json(await servicio.hacerActiva(req.personajeId, idCriatura(req)));
}

// PATCH /api/equipo/:id/reserva
export async function moverAReserva(req, res) {
  res.json(await servicio.moverAReserva(req.personajeId, idCriatura(req)));
}

// PATCH /api/equipo/:id/equipo
export async function moverAlEquipo(req, res) {
  res.json(await servicio.moverAlEquipo(req.personajeId, idCriatura(req)));
}

// PATCH /api/equipo/:id/apodo { apodo }
export async function ponerApodo(req, res) {
  const id = idCriatura(req);
  const apodo = req.body?.apodo;
  if (apodo !== null && typeof apodo !== 'string') {
    fallar(400, 'El apodo debe ser un texto (o null para quitarlo).');
  }
  res.json(await servicio.ponerApodo(req.personajeId, id, apodo));
}

// DELETE /api/equipo/:id
export async function liberar(req, res) {
  res.json(await servicio.liberar(req.personajeId, idCriatura(req)));
}
