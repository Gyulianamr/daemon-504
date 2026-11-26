/* ═══════════════════════════════════════════════════════════════════
 * ESTA PARTE LA TIENE QUE INTEGRAR: Jatniel Oliva
 * Tarea A3-05 · Rama: feature/a3-personaje · Turno 2 (fecha máxima: jueves 19 de noviembre)
 * Commit: "feat(personaje): endpoints de /api/personaje"
 * ═══════════════════════════════════════════════════════════════════ */
// Lee y valida el formato del cuerpo (nombre y criatura inicial) y llama al servicio.
// Todo lo demás (bytes, zona, objetos) lo decide el servidor; si el cuerpo trae "bytes", se ignora.
import * as servicio from '../services/personaje.js';
import { enteroPositivo, textoRequerido } from '../middleware/validar.js';

// POST /api/personaje { nombre, criaturaInicialId } → 201
export async function crear(req, res) {
  const nombre = textoRequerido(req.body?.nombre, 'Escribe el nombre de tu jugador.');
  const criaturaInicialId = enteroPositivo(req.body?.criaturaInicialId, 'Elige una de las tres criaturas iniciales.');
  res.status(201).json(await servicio.crearPersonaje(req.usuarioId, nombre, criaturaInicialId));
}

// GET /api/personaje
export async function consultar(req, res) {
  res.json(await servicio.consultarPersonaje(req.personajeId));
}

// PATCH /api/personaje { nombre }
export async function renombrar(req, res) {
  const nombre = textoRequerido(req.body?.nombre, 'Escribe el nuevo nombre de tu jugador.');
  res.json(await servicio.renombrarPersonaje(req.personajeId, nombre));
}

// DELETE /api/personaje → 204
export async function eliminar(req, res) {
  await servicio.eliminarPersonaje(req.personajeId);
  res.status(204).end();
}
