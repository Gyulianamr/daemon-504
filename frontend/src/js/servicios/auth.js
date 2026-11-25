/* ═══════════════════════════════════════════════════════════════════
 * ESTA PARTE LA TIENE QUE INTEGRAR: Genesis Medina
 * Tarea A4-01 · Rama: feature/a4-base · Fecha límite: miércoles 25 de noviembre
 * Commit: "feat(acceso): sesión con token en el Front-End"
 * ═══════════════════════════════════════════════════════════════════ */
// Registro, inicio y cierre de sesión contra la API (/api/acceso).
// La API responde { usuario: { id, correo }, token }; se guarda en el navegador y api.js envía el token en cada petición.
import { api, ErrorJuego, leerSesion, guardarSesion, borrarSesion } from '../api.js';

const CORREO_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SIN_SESION = { usuario: null, personaje: null };

// Validación rápida en el navegador para avisar sin esperar al servidor (el servidor vuelve a validar).
function validar(correo, contrasena) {
  if (!CORREO_VALIDO.test(correo)) throw new ErrorJuego(400, 'Escribe un correo válido.');
  if (!contrasena || contrasena.length < 8) throw new ErrorJuego(400, 'La contraseña debe tener al menos 8 caracteres.');
}

// El personaje puede no existir todavía (404): en ese caso la app envía a la pantalla de crear personaje.
async function buscarPersonaje() {
  try {
    return await api.get('/personaje');
  } catch (err) {
    if (err.status === 404) return null;
    throw err;
  }
}

// Sesión guardada en el navegador + resumen de su personaje (GET /api/personaje).
export async function obtenerSesion() {
  const sesion = leerSesion();
  if (!sesion?.token) return SIN_SESION;
  try {
    return { usuario: sesion.usuario, personaje: await buscarPersonaje() };
  } catch (err) {
    if (err.status === 401) return SIN_SESION; // api.js ya borró la sesión vencida
    throw err;
  }
}

async function entrar(ruta, correo, contrasena) {
  validar(correo, contrasena);
  const { usuario, token } = await api.post(ruta, { correo, contrasena });
  guardarSesion({ usuario, token });
  return { usuario, personaje: await buscarPersonaje() };
}

// POST /api/acceso/iniciar-sesion
export const iniciarSesion = (correo, contrasena) => entrar('/acceso/iniciar-sesion', correo, contrasena);

// POST /api/acceso/registro
export const registrarse = (correo, contrasena) => entrar('/acceso/registro', correo, contrasena);

// POST /api/acceso/cerrar-sesion: el servidor borra el token; la sesión local se borra aunque la API no responda.
export async function cerrarSesion() {
  try {
    await api.post('/acceso/cerrar-sesion');
  } catch {
    // sin conexión o token ya vencido: igual se cierra la sesión local
  } finally {
    borrarSesion();
  }
}
