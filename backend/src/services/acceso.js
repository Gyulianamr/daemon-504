/* ═══════════════════════════════════════════════════════════════════
 * ESTA PARTE LA TIENE QUE INTEGRAR: Genesis Medina
 * Tarea A4-01 · Rama: feature/a4-base · Fecha límite: miércoles 25 de noviembre
 * Commit: "feat(auth): registro, inicio y cierre de sesión con token"
 * ═══════════════════════════════════════════════════════════════════ */
// Registro, inicio y cierre de sesión. Igual que los demás servicios de B, abre su propia conexión
// (pool / transaccion). La contraseña se guarda cifrada y el token es aleatorio, con vencimiento.
import { randomUUID, randomBytes } from 'node:crypto';
import { pool, transaccion } from '../db/pool.js';
import { fallar } from '../middleware/ErrorApi.js';
import { hashContrasena, verificarContrasena } from './contrasenas.js';
import * as usuarios from '../models/usuarios.js';
import * as sesiones from '../models/sesiones.js';

const LONGITUD_MINIMA_CONTRASENA = 8;
const DURACION_SESION_MS = 7 * 24 * 60 * 60 * 1000; // 7 días
const CORREO_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UNIQUE_VIOLATION = '23505';

function validar(correo, contrasena) {
  const correoNormalizado = String(correo).trim().toLowerCase();
  if (!CORREO_VALIDO.test(correoNormalizado)) fallar(400, 'Escribe un correo válido.');
  if (String(contrasena).length < LONGITUD_MINIMA_CONTRASENA) {
    fallar(400, `La contraseña debe tener al menos ${LONGITUD_MINIMA_CONTRASENA} caracteres.`);
  }
  return correoNormalizado;
}

async function crearToken(db, usuarioId) {
  const token = randomBytes(32).toString('hex');
  await sesiones.crear(db, { token, usuarioId, expiraEn: new Date(Date.now() + DURACION_SESION_MS) });
  return token;
}

export async function registrar(correo, contrasena) {
  const correoNormalizado = validar(correo, contrasena);
  try {
    return await transaccion(async (db) => {
      if (await usuarios.buscarPorCorreo(db, correoNormalizado)) fallar(409, 'Ese correo ya está registrado.');
      const usuario = await usuarios.crear(db, {
        id: randomUUID(), correo: correoNormalizado, contrasenaHash: hashContrasena(contrasena),
      });
      return { usuario, token: await crearToken(db, usuario.id) };
    });
  } catch (err) {
    if (err.code === UNIQUE_VIOLATION) fallar(409, 'Ese correo ya está registrado.'); // dos registros a la vez
    throw err;
  }
}

export async function iniciarSesion(correo, contrasena) {
  const correoNormalizado = validar(correo, contrasena);
  const usuario = await usuarios.buscarPorCorreo(pool, correoNormalizado);
  // El mismo mensaje para "no existe" y "contraseña mala": no revela qué correos tienen cuenta.
  if (!usuario || !verificarContrasena(contrasena, usuario.contrasenaHash)) {
    fallar(401, 'Correo o contraseña incorrectos.');
  }
  const token = await crearToken(pool, usuario.id);
  return { usuario: { id: usuario.id, correo: usuario.correo }, token };
}

export const cerrarSesion = (token) => sesiones.eliminar(pool, token);

export const consultarUsuario = (usuarioId) => usuarios.buscarPorId(pool, usuarioId);
