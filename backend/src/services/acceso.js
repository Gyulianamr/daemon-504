// Registro, inicio y cierre de sesión. La contraseña se guarda cifrada con bcrypt y el token es
// aleatorio, con vencimiento configurable (SESION_DIAS). Usa los modelos Sequelize.
import { randomUUID, randomBytes } from 'node:crypto';
import { UniqueConstraintError } from 'sequelize';
import { sequelize } from '../db/sequelize.js';
import { config } from '../config/config.js';
import { fallar } from '../middleware/ErrorApi.js';
import { hashContrasena, verificarContrasena } from './contrasenas.js';
import * as usuarios from '../models/usuarios.js';
import * as sesiones from '../models/sesiones.js';

const LONGITUD_MINIMA_CONTRASENA = 8;
const LONGITUD_MAXIMA_CONTRASENA = 72; // bcrypt ignora lo que pase de 72 bytes
const CORREO_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DIA_MS = 24 * 60 * 60 * 1000;

function validar(correo, contrasena) {
  const correoNormalizado = String(correo).trim().toLowerCase();
  if (!CORREO_VALIDO.test(correoNormalizado)) fallar(400, 'Escribe un correo válido.');
  const largo = Buffer.byteLength(String(contrasena));
  if (largo < LONGITUD_MINIMA_CONTRASENA) {
    fallar(400, `La contraseña debe tener al menos ${LONGITUD_MINIMA_CONTRASENA} caracteres.`);
  }
  if (largo > LONGITUD_MAXIMA_CONTRASENA) {
    fallar(400, `La contraseña no puede pasar de ${LONGITUD_MAXIMA_CONTRASENA} caracteres.`);
  }
  return correoNormalizado;
}

async function crearToken(usuarioId, transaction) {
  const token = randomBytes(32).toString('hex');
  const expiraEn = new Date(Date.now() + config.sesionDias * DIA_MS);
  await sesiones.crear({ token, usuarioId, expiraEn }, transaction);
  return token;
}

export async function registrar(correo, contrasena) {
  const correoNormalizado = validar(correo, contrasena);
  const contrasenaHash = await hashContrasena(contrasena);
  try {
    return await sequelize.transaction(async (transaction) => {
      if (await usuarios.buscarPorCorreo(correoNormalizado, transaction)) {
        fallar(409, 'Ese correo ya está registrado.');
      }
      const usuario = await usuarios.crear({ id: randomUUID(), correo: correoNormalizado, contrasenaHash }, transaction);
      return { usuario, token: await crearToken(usuario.id, transaction) };
    });
  } catch (err) {
    if (err instanceof UniqueConstraintError) fallar(409, 'Ese correo ya está registrado.'); // dos registros a la vez
    throw err;
  }
}

export async function iniciarSesion(correo, contrasena) {
  const correoNormalizado = validar(correo, contrasena);
  const usuario = await usuarios.buscarPorCorreo(correoNormalizado);
  // El mismo mensaje para "no existe" y "contraseña mala": no revela qué correos tienen cuenta.
  if (!usuario || !(await verificarContrasena(contrasena, usuario.contrasenaHash))) {
    fallar(401, 'Correo o contraseña incorrectos.');
  }
  await sesiones.limpiarVencidas();
  const token = await crearToken(usuario.id);
  return { usuario: { id: usuario.id, correo: usuario.correo }, token };
}

export const cerrarSesion = (token) => sesiones.eliminar(token);

export const consultarUsuario = (usuarioId) => usuarios.buscarPorId(usuarioId);
