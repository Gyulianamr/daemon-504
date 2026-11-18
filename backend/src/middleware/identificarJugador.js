/* ═══════════════════════════════════════════════════════════════════
 * ESTA PARTE LA TIENE QUE INTEGRAR: Genesis Medina
 * Tarea A3-03 · Rama: feature/a3-jugador · Turno 1 (fecha máxima: miércoles 18 de noviembre)
 * Commit: "feat(api): identificar al jugador y exigir personaje"
 * ═══════════════════════════════════════════════════════════════════ */
// Identificación PROVISIONAL: el usuario llega en el encabezado X-Usuario-Id y debe existir.
// En el Avance 5 solo cambia este archivo (validará el token de Supabase Auth); el resto sigue usando req.usuarioId.
import { pool } from '../db/pool.js';
import * as usuarios from '../models/usuarios.js';
import { fallar } from './ErrorApi.js';

const FORMATO_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MENSAJE = 'Inicia sesión para continuar.';

export async function identificarJugador(req, res, next) {
  const id = req.get('X-Usuario-Id')?.trim();
  // Un id con formato inválido se rechaza antes de llegar a la base (si no, PostgreSQL daría error 500).
  if (!id || !FORMATO_UUID.test(id)) fallar(401, MENSAJE);
  const usuario = await usuarios.buscarPorId(pool, id);
  if (!usuario) fallar(401, MENSAJE);
  req.usuarioId = usuario.id;
  next();
}
