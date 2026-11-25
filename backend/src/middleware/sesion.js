/* ═══════════════════════════════════════════════════════════════════
 * ESTA PARTE LA TIENE QUE INTEGRAR: Genesis Medina
 * Tarea A4-01 · Rama: feature/a4-base · Fecha límite: miércoles 25 de noviembre
 * Commit: "feat(auth): endpoints de /api/acceso con sesión por token"
 * ═══════════════════════════════════════════════════════════════════ */
// Identifica al jugador por su token (encabezado Authorization: Bearer <token>) y deja su id en
// req.usuarioId. Reemplaza al antiguo X-Usuario-Id: el resto del código sigue usando req.usuarioId.
import { pool } from '../db/pool.js';
import { buscarUsuarioId } from '../models/sesiones.js';
import { fallar } from './ErrorApi.js';

export function leerToken(req) {
  const [tipo, token] = (req.get('Authorization') || '').split(' ');
  return tipo === 'Bearer' && token ? token : null;
}

export async function requiereSesion(req, res, next) {
  const token = leerToken(req);
  if (!token) fallar(401, 'Inicia sesión para continuar.');
  const usuarioId = await buscarUsuarioId(pool, token);
  if (!usuarioId) fallar(401, 'Tu sesión venció o no es válida. Inicia sesión de nuevo.');
  req.usuarioId = usuarioId;
  next();
}
