/* ═══════════════════════════════════════════════════════════════════
 * ESTA PARTE LA TIENE QUE INTEGRAR: Genesis Medina
 * Tarea A3-03 · Rama: feature/a3-jugador · Turno 1 (fecha máxima: miércoles 18 de noviembre)
 * Commit: "feat(api): identificar al jugador y exigir personaje"
 * ═══════════════════════════════════════════════════════════════════ */
// Va después de identificarJugador: busca el personaje del usuario y deja su id en req.personajeId.
// Los servicios usan SIEMPRE req.personajeId, nunca un id que venga en el body.
import { pool } from '../db/pool.js';
import * as personajes from '../models/personajes.js';
import { fallar } from './ErrorApi.js';

export async function exigirPersonaje(req, res, next) {
  const personaje = await personajes.buscarPorUsuario(pool, req.usuarioId);
  if (!personaje) fallar(404, 'Aún no has creado tu personaje.');
  req.personajeId = personaje.id;
  next();
}
