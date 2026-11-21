/* ═══════════════════════════════════════════════════════════════════
 * ESTA PARTE LA TIENE QUE INTEGRAR: Jatniel Oliva
 * Tarea A3-05 · Rama: feature/a3-personaje · Turno 2 (fecha máxima: jueves 19 de noviembre)
 * Commit: "feat(personaje): crear, consultar, renombrar y borrar personaje"
 * ═══════════════════════════════════════════════════════════════════ */
// CRUD del personaje. Los 300 bytes, los objetos, la zona y el nivel iniciales los pone el SERVIDOR:
// lo que mande el navegador (por ejemplo "bytes") se ignora. Misma lógica que js/servicios/personaje.js del Front-End.
import { pool, transaccion } from '../db/pool.js';
import * as personajes from '../models/personajes.js';
import * as inventario from '../models/inventario.js';
import { obtenerCatalogo, buscarCriatura, buscarZona, guardianes } from '../models/catalogo.js';
import { agregarCriatura } from './equipo.js';
import { registrar } from './historial.js';
import { fallar } from '../middleware/ErrorApi.js';

const BYTES_INICIALES = 300;
const NIVEL_INICIAL = 5;
const ZONA_INICIAL = 'valle';
const OBJETOS_INICIALES = { 1: 5, 3: 3 }; // 5 TamaBall y 3 Curaball
const NOMBRE_MINIMO = 3;
const NOMBRE_MAXIMO = 20;
const UNIQUE_VIOLATION = '23505';

// { nombre, bytes, zonaId, zona, sellos, totalSellos }: lo que muestra la barra superior del Front-End.
export function resumenPersonaje(catalogo, personaje, sellos) {
  return {
    nombre: personaje.nombre,
    bytes: personaje.bytes,
    zonaId: personaje.zonaActual,
    zona: buscarZona(catalogo, personaje.zonaActual).nombre,
    sellos: sellos.length,
    totalSellos: guardianes(catalogo).length,
  };
}

function validarNombre(nombre) {
  if (nombre.length < NOMBRE_MINIMO || nombre.length > NOMBRE_MAXIMO) {
    fallar(400, `El nombre debe tener entre ${NOMBRE_MINIMO} y ${NOMBRE_MAXIMO} caracteres.`);
  }
}

// POST /api/personaje { nombre, criaturaInicialId } → 201
export const crearPersonaje = (usuarioId, nombre, criaturaInicialId) =>
  transaccion(async (db) => {
    const catalogo = await obtenerCatalogo();
    if (await personajes.buscarPorUsuario(db, usuarioId)) fallar(409, 'Ya tienes un personaje.');
    validarNombre(nombre);
    // Las iniciales salen del catálogo (rol 'inicial'): Flamix, Aquabit y Terrox.
    const inicial = buscarCriatura(catalogo, criaturaInicialId);
    if (inicial?.rol !== 'inicial') fallar(400, 'Elige una de las tres criaturas iniciales.');

    let personaje;
    try {
      personaje = await personajes.crear(db, {
        usuarioId,
        nombre,
        bytes: BYTES_INICIALES,
        zonaActual: ZONA_INICIAL,
        ultimaLocalidad: ZONA_INICIAL,
      });
    } catch (err) {
      // Dos solicitudes iguales a la vez: la segunda choca con el UNIQUE de usuario_id.
      if (err.code === UNIQUE_VIOLATION) fallar(409, 'Ya tienes un personaje.');
      throw err;
    }
    for (const [objetoId, unidades] of Object.entries(OBJETOS_INICIALES)) {
      await inventario.sumar(db, personaje.id, Number(objetoId), unidades);
    }
    await agregarCriatura(db, catalogo, personaje.id, criaturaInicialId, NIVEL_INICIAL);
    await registrar(db, personaje.id, 'CAPTURA', `${nombre} comienza su aventura junto a ${inicial.nombre}.`);
    return resumenPersonaje(catalogo, personaje, []);
  });

// GET /api/personaje
export async function consultarPersonaje(personajeId) {
  const catalogo = await obtenerCatalogo();
  const personaje = await personajes.buscarPorId(pool, personajeId);
  return resumenPersonaje(catalogo, personaje, await personajes.listarSellos(pool, personajeId));
}

// PATCH /api/personaje { nombre }
export const renombrarPersonaje = (personajeId, nombre) =>
  transaccion(async (db) => {
    validarNombre(nombre);
    const catalogo = await obtenerCatalogo();
    const personaje = await personajes.bloquear(db, personajeId);
    await personajes.actualizar(db, personajeId, { nombre });
    return resumenPersonaje(catalogo, { ...personaje, nombre }, await personajes.listarSellos(db, personajeId));
  });

// DELETE /api/personaje → borra el personaje y, en cascada, toda su partida (criaturas, inventario, sellos, historial).
export const eliminarPersonaje = (personajeId) =>
  transaccion(async (db) => {
    await personajes.bloquear(db, personajeId);
    await personajes.eliminar(db, personajeId);
  });
