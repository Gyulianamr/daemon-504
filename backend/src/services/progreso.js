/* ═══════════════════════════════════════════════════════════════════
 * ESTA PARTE LA TIENE QUE INTEGRAR: Dinora Padilla
 * Tarea A4-12 · Rama: feature/a4-progreso · Fecha límite: miércoles 25 de noviembre
 * Commit: "feat(progreso): servicio del progreso entre zonas"
 * ═══════════════════════════════════════════════════════════════════ */
// Progreso entre zonas: sellos, estado de cada zona y siguiente objetivo.
// Usa solo reglas que ya existen: zona.requiere y el sello de cada guardián.
import { pool } from '../db/pool.js';
import { obtenerCatalogo, buscarZona, buscarCriatura } from '../models/catalogo.js';
import * as personajes from '../models/personajes.js';
import { buscarPorPersonaje as buscarEncuentro } from '../models/encuentros.js';
import { estaBloqueada } from './mundo.js';

// Guardián que entrega un sello y la zona donde está.
function datosGuardian(catalogo, guardianId) {
  const zona = catalogo.zonas.find((z) => z.guardian && z.guardian.id === guardianId);
  return { guardian: zona.guardian, zona };
}

function vistaGuardian(catalogo, { guardian, zona }) {
  return {
    id: guardian.id,
    nombre: buscarCriatura(catalogo, guardian.criaturaId).nombre,
    nivel: guardian.nivel,
    zonaId: zona.id,
    zonaNombre: zona.nombre,
  };
}

function vistaZona(catalogo, zona, personaje, sellos) {
  let estado = 'desbloqueada';
  if (zona.id === personaje.zonaActual) estado = 'actual';
  else if (estaBloqueada(zona, sellos)) estado = 'bloqueada';

  const vista = {
    id: zona.id,
    nombre: zona.nombre,
    tipo: zona.tipo,
    estado,
    bloqueada: estado === 'bloqueada',
    requisito: null,
    guardian: null,
  };
  if (vista.bloqueada) {
    const datos = datosGuardian(catalogo, zona.requiere);
    vista.requisito = datos.guardian.sello;
    vista.guardian = vistaGuardian(catalogo, datos);
  }
  return vista;
}

// La primera zona bloqueada (por orden) define el siguiente objetivo.
function calcularSiguiente(catalogo, personaje, sellos, combatePendiente) {
  const zona = catalogo.zonas.find((z) => estaBloqueada(z, sellos));
  if (!zona) return null;

  const { guardian, zona: zonaGuardian } = datosGuardian(catalogo, zona.requiere);
  const estasEnLaZonaDelGuardian = personaje.zonaActual === zonaGuardian.id;
  const meta = `al guardián de nivel ${guardian.nivel} para conseguir el ${guardian.sello}.`;

  let accion = `Ve a ${zonaGuardian.nombre} y desafía ${meta}`;
  if (estasEnLaZonaDelGuardian) accion = `Desafía ${meta}`;
  if (combatePendiente) accion = 'Termina tu combate.';

  return {
    zona: { id: zona.id, nombre: zona.nombre },
    selloFaltante: guardian.sello,
    guardian: {
      id: guardian.id,
      nivel: guardian.nivel,
      zonaId: zonaGuardian.id,
      zonaNombre: zonaGuardian.nombre,
    },
    estasEnLaZonaDelGuardian,
    accion,
  };
}

// GET /api/progreso
export async function obtenerProgreso(personajeId) {
  const catalogo = await obtenerCatalogo();
  const personaje = await personajes.buscarPorId(pool, personajeId);
  const sellos = await personajes.listarSellos(pool, personajeId);
  const combatePendiente = (await buscarEncuentro(pool, personajeId)) !== null;
  const zonaActual = buscarZona(catalogo, personaje.zonaActual);

  return {
    sellos: { obtenidos: sellos.length, total: catalogo.zonas.filter((z) => z.guardian).length },
    zonaActual: { id: zonaActual.id, nombre: zonaActual.nombre },
    zonas: catalogo.zonas.map((z) => vistaZona(catalogo, z, personaje, sellos)),
    siguiente: calcularSiguiente(catalogo, personaje, sellos, combatePendiente),
    combatePendiente,
  };
}
