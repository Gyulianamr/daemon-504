/* ═══════════════════════════════════════════════════════════════════
 * ESTA PARTE LA TIENE QUE INTEGRAR: Genesis Medina
 * Tarea A4-01 · Rama: feature/a4-base · Fecha límite: miércoles 25 de noviembre
 * Commit: "feat(auth): endpoints de /api/acceso con sesión por token"
 * ═══════════════════════════════════════════════════════════════════ */
// Lee el cuerpo y llama al servicio. El token solo se devuelve al registrarse o iniciar sesión.
import * as servicio from '../services/acceso.js';
import { textoRequerido } from '../middleware/validar.js';
import { leerToken } from '../middleware/sesion.js';

function credenciales(req) {
  return {
    correo: textoRequerido(req.body?.correo, 'El correo es obligatorio.'),
    contrasena: textoRequerido(req.body?.contrasena, 'La contraseña es obligatoria.'),
  };
}

// POST /api/acceso/registro { correo, contrasena } → 201 { usuario, token }
export async function registro(req, res) {
  const { correo, contrasena } = credenciales(req);
  res.status(201).json(await servicio.registrar(correo, contrasena));
}

// POST /api/acceso/iniciar-sesion { correo, contrasena } → 200 { usuario, token }
export async function iniciarSesion(req, res) {
  const { correo, contrasena } = credenciales(req);
  res.json(await servicio.iniciarSesion(correo, contrasena));
}

// GET /api/acceso/sesion (con token) → 200 { usuario }
export async function sesion(req, res) {
  res.json({ usuario: await servicio.consultarUsuario(req.usuarioId) });
}

// POST /api/acceso/cerrar-sesion → 204 (borra la sesión del servidor)
export async function cerrarSesion(req, res) {
  const token = leerToken(req);
  if (token) await servicio.cerrarSesion(token);
  res.status(204).end();
}
