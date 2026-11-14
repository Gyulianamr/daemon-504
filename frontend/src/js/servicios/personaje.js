/* ═══════════════════════════════════════════════════════════════════
 * ESTA PARTE LA TIENE QUE INTEGRAR: Genesis Medina
 * Tarea A2-08 · Rama: feature/a2-personaje · Fecha límite: sábado 14 de noviembre
 * Commit: "feat(personaje): crear personaje con criatura inicial"
 * ═══════════════════════════════════════════════════════════════════ */
// Crea la partida de un usuario nuevo: 300 bytes, 5 TamaBall, 3 Curaball y la criatura inicial elegida en Nv 5.
// Futuro endpoint: POST /api/personaje
import { conEstado, fallar, resumenPersonaje } from '../partida.js';
import { buscarCriatura } from '../datos.js';
import { crearCriatura } from './equipo.js';
import { registrar } from './historial.js';

export const INICIALES = [1, 2, 3]; // Flamix, Aquabit, Terrox

export function crearPersonaje(nombre, criaturaInicialId) {
  return conEstado(({ datos, estado }) => {
    if (!estado.sesion) fallar(401, 'Inicia sesión para continuar.');
    if (estado.partidas[estado.sesion]) fallar(409, 'Ya tienes un personaje.');
    const limpio = (nombre || '').trim();
    if (limpio.length < 3 || limpio.length > 20) fallar(400, 'El nombre debe tener entre 3 y 20 caracteres.');
    if (!INICIALES.includes(criaturaInicialId)) fallar(400, 'Elige una de las tres criaturas iniciales.');

    const partida = {
      nombre: limpio,
      bytes: 300,
      zonaActual: 'valle',
      ultimaLocalidad: 'valle',
      sellos: [],
      criaturas: [],
      inventario: { 1: 5, 3: 3 }, // 5 TamaBall y 3 Curaball
      historial: [],
      encuentro: null,
      siguienteId: 1,
    };
    const inicial = crearCriatura(datos, partida, criaturaInicialId, 5);
    const especie = buscarCriatura(datos, inicial.criaturaId);
    registrar(partida, 'CAPTURA', `${limpio} comienza su aventura junto a ${especie.nombre}.`);
    estado.partidas[estado.sesion] = partida;
    return resumenPersonaje(datos, partida);
  });
}
