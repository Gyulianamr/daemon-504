// Identifica al jugador por su token (encabezado Authorization: Bearer <token>) y deja su id en
// req.usuarioId. Un token ausente, inexistente o vencido responde 401 (el vencido se borra).
import { buscarUsuarioId } from '../models/sesiones.js';
import { fallar } from './ErrorApi.js';

export function leerToken(req) {
  const [tipo, token] = (req.get('Authorization') || '').split(' ');
  return tipo === 'Bearer' && token ? token : null;
}

export async function requiereSesion(req, res, next) {
  const token = leerToken(req);
  if (!token) fallar(401, 'Inicia sesión para continuar.');
  const usuarioId = await buscarUsuarioId(token);
  if (!usuarioId) fallar(401, 'Tu sesión venció o no es válida. Inicia sesión de nuevo.');
  req.usuarioId = usuarioId;
  next();
}
