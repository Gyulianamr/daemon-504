/* ═══════════════════════════════════════════════════════════════════
 * ESTA PARTE LA TIENE QUE INTEGRAR: Genesis Medina
 * Tarea A4-01 · Rama: feature/a4-base · Fecha límite: miércoles 25 de noviembre
 * Commit: "feat(auth): cifrar contraseñas con scrypt"
 * ═══════════════════════════════════════════════════════════════════ */
// Hash de contraseñas con scrypt (módulo crypto de Node, sin dependencias nuevas).
// Se guarda como "sal:hash", los dos en hexadecimal.
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const LARGO_SAL = 16;
const LARGO_LLAVE = 64;

export function hashContrasena(contrasena) {
  const sal = randomBytes(LARGO_SAL).toString('hex');
  const hash = scryptSync(contrasena, sal, LARGO_LLAVE).toString('hex');
  return `${sal}:${hash}`;
}

export function verificarContrasena(contrasena, guardado) {
  const [sal, hash] = guardado.split(':');
  if (!sal || !hash) return false;
  const intento = scryptSync(contrasena, sal, LARGO_LLAVE);
  const esperado = Buffer.from(hash, 'hex');
  return intento.length === esperado.length && timingSafeEqual(intento, esperado);
}
