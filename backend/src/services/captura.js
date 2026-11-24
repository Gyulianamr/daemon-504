/* ═══════════════════════════════════════════════════════════════════
 * ESTA PARTE LA TIENE QUE INTEGRAR: Jenifer Padilla
 * Tarea A3-11 · Rama: feature/a3-captura · Turno 5 (fecha máxima: domingo 22 de noviembre)
 * Commit: "feat(captura): captura calculada en el servidor"
 * ═══════════════════════════════════════════════════════════════════ */
// Captura de una criatura salvaje durante un combate. El servidor valida el encuentro, el turno, la esfera y que
// el jugador la tenga; calcula la probabilidad, gasta la esfera y, si se captura, guarda la criatura.
// Si falla, el rival ataca. Misma fórmula que frontend/src/js/servicios/captura.js.
import { transaccion } from '../db/pool.js';
import { buscarCriatura, buscarObjeto } from '../models/catalogo.js';
import * as inventario from '../models/inventario.js';
import { fallar } from '../middleware/ErrorApi.js';
import { registrar } from './historial.js';
import { agregarCriatura } from './equipo.js';
import { cargarCombate, turnoDelRival, terminar, respuesta } from './combate.js';

const PROBABILIDAD_MINIMA = 0;
const PROBABILIDAD_MAXIMA = 0.95;
const PESO_VIDA_PERDIDA = 0.7;
const PROBABILIDAD_BASE = 0.1;
const ESFERAS_GASTADAS = 1;

// Probabilidad = ((1 − vida ÷ vidaMax) × 0.7 + 0.1) × facilidad de la criatura × valor de la esfera.
// Nunca pasa de 0.95 ni baja de 0.
export function probabilidadCaptura(vida, vidaMax, facilidad, multiplicador) {
  const base = (1 - vida / vidaMax) * PESO_VIDA_PERDIDA + PROBABILIDAD_BASE;
  return Math.min(PROBABILIDAD_MAXIMA, Math.max(PROBABILIDAD_MINIMA, base * facilidad * multiplicador));
}

// POST /api/encuentros/:id/capturar { turno, objetoId } → { mensajes, final: 'captura' | 'derrota' | null, encuentro }
export const capturar = (personajeId, encuentroId, turno, objetoId) =>
  transaccion(async (db) => {
    // 1. bloquear la partida y cargar el combate (404 si no es suyo, 409 si el turno ya pasó)
    const ctx = await cargarCombate(db, personajeId, encuentroId, turno);

    // 2. validar 
    const esfera = buscarObjeto(ctx.catalogo, objetoId);
    if (!esfera || esfera.tipo !== 'captura') fallar(400, 'Ese objeto no es una esfera de captura.');
    if (ctx.encuentro.guardianId) fallar(409, 'No puedes capturar a un guardián.');
    // La comprobación y la resta son una sola sentencia: la esfera se gasta aunque la captura falle.
    if (!(await inventario.gastar(db, personajeId, objetoId, ESFERAS_GASTADAS))) {
      fallar(409, `No tienes ${esfera.nombre}.`);
    }

    // 3. calcular y decidir
    const { rival } = ctx;
    const especie = buscarCriatura(ctx.catalogo, rival.criaturaId);
    const probabilidad = probabilidadCaptura(rival.vida, rival.vidaMax, especie.facilidadCaptura, esfera.valor);
    const mensajes = [`Lanzaste ${esfera.nombre}.`];

    // 4. si se captura: guardar la criatura (con la vida que le quedaba) e historial
    if (Math.random() < probabilidad) {
      const criatura = await agregarCriatura(db, ctx.catalogo, personajeId, rival.criaturaId, rival.nivel, rival.vida);
      mensajes.push(`¡Capturaste a ${rival.nombre}!`);
      if (criatura.posicion === null) mensajes.push(`Tu equipo está lleno: ${rival.nombre} pasó a la reserva.`);
      await registrar(db, personajeId, 'CAPTURA', `Capturaste a ${rival.nombre} (Nv ${rival.nivel}) con ${esfera.nombre}.`);
      return respuesta(ctx, mensajes, 'captura');
    }

    // 5. si falla: el rival ataca
    mensajes.push(`${rival.nombre} escapó de ${esfera.nombre}.`);
    if ((await turnoDelRival(ctx, mensajes)) === 'derrota') {
      await terminar(ctx, 'derrota', mensajes);
      return respuesta(ctx, mensajes, 'derrota');
    }
    return respuesta(ctx, mensajes);
  });