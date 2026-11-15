
/* ═══════════════════════════════════════════════════════════════════
 * ESTA PARTE LA TIENE QUE INTEGRAR: Jatniel Oliva
 * Tarea A2-11 · Rama: feature/a2-captura · Fecha límite: domingo 15 de noviembre
 * Commit: "feat(inventario): consultar y usar objetos"
 * ═══════════════════════════════════════════════════════════════════ */
// Inventario: consulta cantidades y permite usar objetos de curación.
import { conPartida, fallar } from '../partida.js';
import { buscarObjeto } from '../datos.js';
import { vistaCriatura } from './equipo.js';
import { registrar } from './historial.js';

// Futuro: GET /api/inventario
export function listarInventario() {
  return conPartida(({ datos, partida }) =>
    datos.objetos
      .map((objeto) => ({
        ...objeto,
        cantidad: partida.inventario[objeto.id] || 0,
      }))
      .filter((objeto) => objeto.cantidad > 0),
  );
}

// Futuro: POST /api/inventario/usar { objetoId, criaturaId }
export function usarObjeto(objetoId, criaturaId) {
  return conPartida(({ datos, partida }) => {

    if (partida.encuentro) {
      fallar(
        409,
        'Durante un combate usa los objetos desde la pantalla de combate.',
      );
    }

    const objeto = buscarObjeto(datos, objetoId);

    if (!objeto || objeto.tipo !== 'curacion') {
      fallar(400, 'Ese objeto no se puede usar aquí.');
    }

    if (!partida.inventario[objetoId]) {
      fallar(409, `No tienes ${objeto.nombre}.`);
    }

    const criatura = partida.criaturas.find(
      (c) => c.id === criaturaId,
    );

    if (!criatura) {
      fallar(404, 'Esa criatura no es tuya.');
    }

    const { nombre, vidaMax } = vistaCriatura(datos, criatura);

    if (criatura.vida === 0) {
      fallar(
        409,
        `${nombre} está debilitada: llévala al santuario.`,
      );
    }

    if (criatura.vida === vidaMax) {
      fallar(409, `${nombre} ya tiene la vida completa.`);
    }

    criatura.vida = Math.min(
      vidaMax,
      criatura.vida + objeto.valor,
    );

    partida.inventario[objetoId]--;

    registrar(
      partida,
      'CURACION',
      `Usaste ${objeto.nombre} en ${nombre}.`,
    );

    return `${nombre} ahora tiene ${criatura.vida}/${vidaMax} HP.`;
  });
}
