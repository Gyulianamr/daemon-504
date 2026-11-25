/* ═══════════════════════════════════════════════════════════════════
 * ESTA PARTE LA TIENE QUE INTEGRAR: Genesis Medina
 * Tarea A4-01 · Rama: feature/a4-base · Fecha límite: miércoles 25 de noviembre
 * Commit: "feat(api): cliente de la API con Bearer y manejo de errores"
 * ═══════════════════════════════════════════════════════════════════ */
// Cliente de la API: todas las peticiones del Front-End al Back-End pasan por aquí.
// Agrega la dirección de la API, envía y recibe JSON, identifica al usuario con su token
// (Authorization: Bearer) y convierte las respuestas { "error": "..." } en un ErrorJuego con su código HTTP.
const URL_API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const CLAVE_SESION = 'daemon504-sesion';
export const EVENTO_SESION_VENCIDA = 'daemon504:sesion-vencida';

// Error con código HTTP (status) y mensaje para mostrar al usuario. status 0 = no hubo respuesta.
export class ErrorJuego extends Error {
  constructor(status, mensaje) {
    super(mensaje);
    this.status = status;
  }
}

// La sesión { usuario, token } se guarda en el navegador para que siga al recargar la página.
// La partida NO se guarda aquí: vive en la base de datos.
export function leerSesion() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_SESION));
  } catch {
    return null;
  }
}
export const guardarSesion = (sesion) => localStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
export const borrarSesion = () => localStorage.removeItem(CLAVE_SESION);

async function pedir(metodo, ruta, cuerpo) {
  const encabezados = { 'Content-Type': 'application/json' };
  const sesion = leerSesion();
  if (sesion?.token) encabezados.Authorization = `Bearer ${sesion.token}`;

  let respuesta;
  try {
    respuesta = await fetch(URL_API + ruta, {
      method: metodo,
      headers: encabezados,
      body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
    });
  } catch {
    throw new ErrorJuego(0, 'No se pudo conectar con el servidor. Revisa que la API esté encendida.');
  }

  const datos = respuesta.status === 204 ? null : await respuesta.json().catch(() => null);
  if (!respuesta.ok) {
    // 401 con una sesión guardada = el token venció o ya no es válido: se borra y se avisa a la app.
    // (Un 401 al iniciar sesión sin sesión previa solo significa "contraseña incorrecta".)
    if (respuesta.status === 401 && sesion) {
      borrarSesion();
      window.dispatchEvent(new Event(EVENTO_SESION_VENCIDA));
    }
    throw new ErrorJuego(respuesta.status, datos?.error || 'Ocurrió un error inesperado.');
  }
  return datos;
}

export const api = {
  get: (ruta) => pedir('GET', ruta),
  post: (ruta, cuerpo) => pedir('POST', ruta, cuerpo),
  patch: (ruta, cuerpo) => pedir('PATCH', ruta, cuerpo),
  delete: (ruta) => pedir('DELETE', ruta),
};
