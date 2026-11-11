/* ═══════════════════════════════════════════════════════════════════
 * ESTA PARTE LA TIENE QUE INTEGRAR: Genesis Medina
 * Tarea A2-01 · Rama: feature/a2-base · Fecha límite: miércoles 11 de noviembre
 * Commit: "feat(datos): guardar la partida y responder como la API"
 * ═══════════════════════════════════════════════════════════════════ */
// Guarda la partida en el navegador (localStorage) mientras no exista el Back-End.
// Todos los servicios de js/servicios/ usan conPartida(): así responden y fallan
// igual que lo hará la API, y en el Avance 4 solo se cambia el interior de cada servicio por fetch().
import { cargarDatos, buscarZona, guardianes } from './datos.js';

const CLAVE = 'daemon504-partida';

// Error con el mismo formato que usará la API: código HTTP + mensaje para el usuario.
export class ErrorJuego extends Error {
  constructor(status, mensaje) {
    super(mensaje);
    this.status = status;
  }
}
export const fallar = (status, mensaje) => {
  throw new ErrorJuego(status, mensaje);
};

// Si no hay nada guardado, se crea la cuenta de prueba (demo@daemon504.hn / demo1234).
async function leerEstado() {
  const guardado = localStorage.getItem(CLAVE);
  if (guardado) return JSON.parse(guardado);
  const demo = await fetch('/data/partida-demo.json').then((r) => r.json());
  return { usuarios: [demo.usuario], sesion: demo.usuario.id, partidas: { [demo.usuario.id]: demo.partida } };
}
const guardarEstado = (estado) => localStorage.setItem(CLAVE, JSON.stringify(estado));
const esperar = () => new Promise((r) => setTimeout(r, 250)); // simula el tiempo de respuesta de un servidor

// Ejecuta una acción del juego: carga datos y estado, ejecuta, guarda y devuelve una copia.
export async function conEstado(accion) {
  await esperar();
  const datos = await cargarDatos();
  const estado = await leerEstado();
  const resultado = await accion({ datos, estado });
  guardarEstado(estado);
  return resultado === undefined ? undefined : structuredClone(resultado);
}

// Igual que conEstado, pero exige sesión iniciada y personaje creado.
export function conPartida(accion) {
  return conEstado(({ datos, estado }) => {
    if (!estado.sesion) fallar(401, 'Inicia sesión para continuar.');
    const partida = estado.partidas[estado.sesion];
    if (!partida) fallar(404, 'Aún no has creado tu personaje.');
    return accion({ datos, estado, partida });
  });
}

// Datos que muestra la barra superior.
export function resumenPersonaje(datos, partida) {
  return {
    nombre: partida.nombre,
    bytes: partida.bytes,
    zona: buscarZona(datos, partida.zonaActual).nombre,
    sellos: partida.sellos.length,
    totalSellos: guardianes(datos).length,
  };
}
