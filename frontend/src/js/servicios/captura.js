
/* ═══════════════════════════════════════════════════════════════════
 * ESTA PARTE LA TIENE QUE INTEGRAR: Jatniel Oliva
 * Tarea A2-11 · Rama: feature/a2-captura · Fecha límite: domingo 15 de noviembre
 * Commit: "feat(captura): intento de captura con esferas"
 * ═══════════════════════════════════════════════════════════════════ */
// Captura. probabilidad = ((1 − vida/vidaMax) × 0.7 + 0.1) × facilidad × esfera, máximo 95 %.
// La esfera se gasta aunque falle. A los guardianes no se les puede capturar.
import { conPartida, fallar } from '../partida.js';
import { buscarCriatura, buscarObjeto, estadisticas } from '../datos.js';
import { validarTurno, turnoDelRival, respuesta, terminar } from './combate.js';
import { crearCriatura } from './equipo.js';
import { registrar } from './historial.js';

export function probabilidadCaptura(vida, vidaMax, facilidad, multiplicadorEsfera) {
  const base = (1 - vida / vidaMax) * 0.7 + 0.1;
  return Math.min(0.95, base * facilidad * multiplicadorEsfera);
}

// Futuro: POST /api/encuentros/:id/capturar  { turno, objetoId }
export function capturar(turno, objetoId) {
  return conPartida(({ datos, partida }) => {
    const e = validarTurno(partida, turno);
    if (e.guardianId) fallar(409, 'Los guardianes no se pueden capturar.');
    const esfera = buscarObjeto(datos, objetoId);
    if (!esfera || esfera.tipo !== 'captura') fallar(400, 'Ese objeto no sirve para capturar.');
    if (!partida.inventario[objetoId]) fallar(409, `No tienes ${esfera.nombre}.`);

    partida.inventario[objetoId]--;
    const base = buscarCriatura(datos, e.rival.criaturaId);
    const { vidaMax } = estadisticas(base, e.rival.nivel);
    const probabilidad = probabilidadCaptura(e.rival.vida, vidaMax, base.facilidadCaptura, esfera.valor);
    const mensajes = [`Lanzaste una ${esfera.nombre}…`];

    if (Math.random() < probabilidad) {
      const nueva = crearCriatura(datos, partida, e.rival.criaturaId, e.rival.nivel);
      nueva.vida = e.rival.vida;
      const destino = nueva.posicion ? 'se unió a tu equipo' : 'fue enviado a la reserva (equipo lleno)';
      mensajes.push(`¡${base.nombre} fue capturado y ${destino}!`);
      registrar(partida, 'CAPTURA', `Capturaste a ${base.nombre} (Nv ${e.rival.nivel}) con ${esfera.nombre}.`);
      partida.encuentro = null;
      return respuesta(datos, partida, mensajes, 'captura');
    }
   mensajes.push(`${base.nombre} escapó de la esfera.`);
   registrar(partida, 'CAPTURA', `Falló la captura de ${base.nombre}.`);

   const resultado = turnoDelRival(datos, partida, mensajes);

   if (resultado === 'derrota') {
    terminar(datos, partida, 'derrota', mensajes);
    return respuesta(datos, partida, mensajes, 'derrota');
   }

   return respuesta(datos, partida, mensajes);
    });
}
