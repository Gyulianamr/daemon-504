// Hash de contraseñas con bcrypt (10 rondas de sal). bcrypt solo lee los primeros 72 bytes,
// por eso el servicio de acceso limita el largo de la contraseña.
// Las cuentas creadas antes con scrypt ("sal:hash") se siguen aceptando.
import bcrypt from 'bcrypt';
import { scryptSync, timingSafeEqual } from 'node:crypto';

const RONDAS = 10;
const LARGO_LLAVE_SCRYPT = 64;

export const hashContrasena = (contrasena) => bcrypt.hash(contrasena, RONDAS);

function verificarScrypt(contrasena, guardado) {
  const [sal, hash] = guardado.split(':');
  if (!sal || !hash) return false;
  const intento = scryptSync(contrasena, sal, LARGO_LLAVE_SCRYPT);
  const esperado = Buffer.from(hash, 'hex');
  return intento.length === esperado.length && timingSafeEqual(intento, esperado);
}

export async function verificarContrasena(contrasena, guardado) {
  if (guardado.startsWith('$2')) return bcrypt.compare(contrasena, guardado);
  return verificarScrypt(contrasena, guardado);
}
