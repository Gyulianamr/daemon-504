/* ═══════════════════════════════════════════════════════════════════
 * ESTA PARTE LA TIENE QUE INTEGRAR: Jatniel Oliva
 * Tarea A3-04 · Rama: feature/a3-equipo · Turno 2 (fecha máxima: jueves 19 de noviembre)
 * Commit: "feat(equipo): equipo activo, reserva, apodo y liberar"
 * ═══════════════════════════════════════════════════════════════════ */
// Equipo del jugador: máximo 6 criaturas activas (la primera es la criatura activa) y el resto en reserva.
// Mismas reglas que frontend/src/js/servicios/equipo.js; aquí el servidor es quien decide.
import { pool, transaccion } from '../db/pool.js';
import * as personajes from '../models/personajes.js';
import * as encuentros from '../models/encuentros.js';
import * as criaturasJugador from '../models/criaturasJugador.js';
import { obtenerCatalogo, buscarCriatura } from '../models/catalogo.js';
import { estadisticas, MAXIMO_EQUIPO, MAXIMO_APODO } from './reglas.js';
import { fallar } from '../middleware/ErrorApi.js';

// Combina la especie del catálogo con la criatura del jugador. "nombre" es el apodo si tiene
// (o el de la especie) y "especie" siempre es el de la especie.
export function vistaCriatura(catalogo, c) {
  const especie = buscarCriatura(catalogo, c.criaturaId);
  return {
    ...c,
    nombre: c.apodo ?? especie.nombre,
    especie: especie.nombre,
    tipo: especie.tipo,
    rol: especie.rol,
    ...estadisticas(especie, c.nivel),
  };
}

// Las criaturas del equipo (posición 1..6), ordenadas por posición.
export const equipoActivo = (lista) =>
  lista.filter((c) => c.posicion !== null).sort((a, b) => a.posicion - b.posicion);

// Crea una criatura con vida completa (o con la vida indicada). Si hay espacio entra al equipo; si no, a la reserva.
// La usan personaje (criatura inicial) y captura. El que llama ya debe tener bloqueado el personaje.
export async function agregarCriatura(db, catalogo, personajeId, criaturaId, nivel, vida) {
  const especie = buscarCriatura(catalogo, criaturaId);
  if (!especie) throw new Error(`La criatura ${criaturaId} no existe en el catálogo.`);
  const enEquipo = equipoActivo(await criaturasJugador.listar(db, personajeId)).length;
  return criaturasJugador.crear(db, personajeId, {
    criaturaId,
    nivel,
    vida: vida ?? estadisticas(especie, nivel).vidaMax,
    posicion: enEquipo < MAXIMO_EQUIPO ? enEquipo + 1 : null,
  });
}

// { activo, reserva, maximo } con la vista de cada criatura.
async function armarEquipo(db, catalogo, personajeId) {
  const lista = await criaturasJugador.listar(db, personajeId);
  return {
    activo: equipoActivo(lista).map((c) => vistaCriatura(catalogo, c)),
    reserva: lista.filter((c) => c.posicion === null).map((c) => vistaCriatura(catalogo, c)),
    maximo: MAXIMO_EQUIPO,
  };
}

// Primer paso de toda acción que cambia el equipo: bloquea la partida (si llegan dos solicitudes
// iguales a la vez, la segunda espera y ve el resultado de la primera), comprueba que la criatura
// sea del jugador (404) y que no haya combate (409).
async function prepararCambio(db, personajeId, id) {
  await personajes.bloquear(db, personajeId);
  const criatura = await criaturasJugador.buscar(db, personajeId, id);
  if (!criatura) fallar(404, 'Esa criatura no es tuya.');
  if (await encuentros.buscarPorPersonaje(db, personajeId)) {
    fallar(409, 'No puedes cambiar el equipo durante un combate.');
  }
  const activo = equipoActivo(await criaturasJugador.listar(db, personajeId));
  return { criatura, activo };
}

// GET /api/equipo
export async function listarEquipo(personajeId) {
  return armarEquipo(pool, await obtenerCatalogo(), personajeId);
}

// PATCH /api/equipo/:id/activa → la pasa a la posición 1
export const hacerActiva = (personajeId, id) =>
  transaccion(async (db) => {
    const catalogo = await obtenerCatalogo();
    const { criatura, activo } = await prepararCambio(db, personajeId, id);
    if (criatura.posicion === null) fallar(409, 'Primero pásala al equipo.');
    const resto = activo.filter((c) => c.id !== id).map((c) => c.id);
    await criaturasJugador.fijarEquipo(db, personajeId, [id, ...resto]);
    return armarEquipo(db, catalogo, personajeId);
  });

// PATCH /api/equipo/:id/reserva
export const moverAReserva = (personajeId, id) =>
  transaccion(async (db) => {
    const catalogo = await obtenerCatalogo();
    const { criatura, activo } = await prepararCambio(db, personajeId, id);
    if (criatura.posicion === null) fallar(409, 'Esa criatura ya está en la reserva.');
    if (activo.length === 1) fallar(409, 'Tu equipo debe tener al menos una criatura.');
    await criaturasJugador.enviarAReserva(db, personajeId, id);
    await criaturasJugador.fijarEquipo(db, personajeId, activo.filter((c) => c.id !== id).map((c) => c.id));
    return armarEquipo(db, catalogo, personajeId);
  });

// PATCH /api/equipo/:id/equipo → entra al final del equipo (máximo 6)
export const moverAlEquipo = (personajeId, id) =>
  transaccion(async (db) => {
    const catalogo = await obtenerCatalogo();
    const { criatura, activo } = await prepararCambio(db, personajeId, id);
    if (criatura.posicion !== null) fallar(409, 'Esa criatura ya pertenece al equipo.');
    if (activo.length >= MAXIMO_EQUIPO) fallar(409, `El equipo ya tiene ${MAXIMO_EQUIPO} criaturas.`);
    await criaturasJugador.fijarEquipo(db, personajeId, [...activo.map((c) => c.id), id]);
    return armarEquipo(db, catalogo, personajeId);
  });

// PATCH /api/equipo/:id/apodo { apodo } → texto de 1 a 20 caracteres; null o vacío lo quita.
// Se puede cambiar el apodo aunque haya un combate: no afecta al equipo.
export const ponerApodo = (personajeId, id, apodo) =>
  transaccion(async (db) => {
    const limpio = apodo === null ? '' : apodo.trim();
    if (limpio.length > MAXIMO_APODO) fallar(400, `El apodo no puede pasar de ${MAXIMO_APODO} caracteres.`);
    const catalogo = await obtenerCatalogo();
    await personajes.bloquear(db, personajeId);
    if (!(await criaturasJugador.buscar(db, personajeId, id))) fallar(404, 'Esa criatura no es tuya.');
    await criaturasJugador.actualizar(db, id, { apodo: limpio === '' ? null : limpio });
    return armarEquipo(db, catalogo, personajeId);
  });

// DELETE /api/equipo/:id → libera la criatura (se borra). El equipo nunca puede quedar vacío.
export const liberar = (personajeId, id) =>
  transaccion(async (db) => {
    const catalogo = await obtenerCatalogo();
    const { criatura, activo } = await prepararCambio(db, personajeId, id);
    if (criatura.posicion !== null && activo.length === 1) {
      fallar(409, 'Tu equipo debe tener al menos una criatura.');
    }
    await criaturasJugador.eliminar(db, personajeId, id);
    await criaturasJugador.fijarEquipo(db, personajeId, activo.filter((c) => c.id !== id).map((c) => c.id));
    return armarEquipo(db, catalogo, personajeId);
  });
