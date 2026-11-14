import { conPartida, fallar } from '../partida.js';
import { buscarCriatura, buscarZona, estadisticas } from '../datos.js';
import { equipoActivo, vistaCriatura } from './equipo.js';
import { registrar } from './historial.js';

const EFECTIVIDAD_NORMAL = 1;
const EFECTIVIDAD_FUERTE = 1.5;
const AZAR_MINIMO = 0.85;
const AZAR_MAXIMO = 1;
const DANO_MINIMO = 1;
const EXP_POR_NIVEL = 100;
const EXP_RIVAL_POR_NIVEL = 10;
const BYTES_RIVAL_POR_NIVEL = 5;
const CURACION_CURABALL = 20;
const PROBABILIDAD_HUIDA = 0.7;
const TURNO_INICIAL = 1;
const INCREMENTO_TURNO = 1;
const INCREMENTO_NIVEL = 1;
const CURABALL_USADA = 1;
const VIDA_MINIMA = 0;
const ID_CURABALL = 3;

export function calcularEfectividad(tipoAtacante, tipoDefensor, datos) {
  const fuertes = datos.tipos.fuerteContra[tipoAtacante] || [];
  return fuertes.includes(tipoDefensor)
    ? EFECTIVIDAD_FUERTE
    : EFECTIVIDAD_NORMAL;
}

export function calcularDano(atacante, defensor, efectividad, azar) {
  return Math.max(
    DANO_MINIMO,
    Math.round((atacante.ataque - defensor.defensa / 2) * efectividad * azar)
  );
}

function obtenerActiva(datos, partida) {
  const criatura = partida.criaturas.find(
    (elemento) => elemento.id === partida.encuentro.activaId
  );

  if (!criatura) fallar(409, 'No se encontró la criatura activa del combate.');

  return { criatura, vista: vistaCriatura(datos, criatura) };
}

function obtenerRival(datos, encuentro) {
  const criatura = buscarCriatura(datos, encuentro.rival.criaturaId);
  return {
    ...encuentro.rival,
    nombre: criatura.nombre,
    tipo: criatura.tipo,
    ...estadisticas(criatura, encuentro.rival.nivel),
  };
}

function calcularDanoAleatorio(atacante, defensor, efectividad) {
  const azar = Math.random() * (AZAR_MAXIMO - AZAR_MINIMO) + AZAR_MINIMO;
  return calcularDano(atacante, defensor, efectividad, azar);
}

export function iniciarEncuentro(
  datos,
  partida,
  criaturaId,
  nivel,
  guardianId = null
) {
  if (partida.encuentro) {
    fallar(409, 'Ya tienes un combate pendiente.');
  }

  const activa = equipoActivo(partida).find(
    (criatura) => criatura.vida > VIDA_MINIMA
  );
  if (!activa) fallar(409, 'No puedes combatir con todo el equipo debilitado.');

  const rival = buscarCriatura(datos, criaturaId);
  const vidaRival = estadisticas(rival, nivel).vidaMax;
  partida.encuentro = {
    id: Date.now() + Math.random(),
    rival: { criaturaId, nivel, vida: vidaRival },
    guardianId,
    activaId: activa.id,
    turno: TURNO_INICIAL,
  };

  registrar(
    partida,
    'ENCUENTRO',
    `Apareció ${rival.nombre} de nivel ${nivel}.`
  );
}

export function validarTurno(partida, turno) {
  if (!partida.encuentro) fallar(404, 'No hay un combate activo.');
  if (partida.encuentro.turno !== turno) {
    fallar(409, 'Ese turno ya pasó. Actualiza el combate.');
  }
  return partida.encuentro;
}

export function respuesta(datos, partida, mensajes, final = null) {
  if (mensajes.length > 0) {
    registrar(partida, 'COMBATE', mensajes.join(' '));
  }

  if (final) partida.encuentro = null;

  return {
    mensajes,
    final,
    encuentro: final ? null : partida.encuentro,
  };
}

export function turnoDelRival(datos, partida, mensajes) {
  const encuentro = partida.encuentro;
  const activa = obtenerActiva(datos, partida);
  const rival = obtenerRival(datos, encuentro);
  const efectividad = calcularEfectividad(
    rival.tipo,
    activa.vista.tipo,
    datos
  );
  const dano = calcularDanoAleatorio(rival, activa.vista, efectividad);

  activa.criatura.vida = Math.max(
    VIDA_MINIMA,
    activa.criatura.vida - dano
  );
  mensajes.push(
    `${rival.nombre} causó ${dano} de daño a ${activa.vista.nombre}.`
  );
  encuentro.turno += INCREMENTO_TURNO;

  if (activa.criatura.vida === VIDA_MINIMA) {
    const siguiente = equipoActivo(partida).find(
      (criatura) =>
        criatura.id !== activa.criatura.id && criatura.vida > VIDA_MINIMA
    );

    if (!siguiente) return 'derrota';

    encuentro.activaId = siguiente.id;
    mensajes.push(
      `${vistaCriatura(datos, siguiente).nombre} entra al combate.`
    );
  }

  return null;
}

function terminar(datos, partida, resultado, mensajes) {
  const encuentro = partida.encuentro;

  if (resultado === 'victoria') {
    const activa = obtenerActiva(datos, partida).criatura;
    const experienciaGanada =
      encuentro.rival.nivel * EXP_RIVAL_POR_NIVEL;
    activa.experiencia += experienciaGanada;
    mensajes.push(`Ganaste ${experienciaGanada} puntos de experiencia.`);

    while (activa.experiencia >= EXP_POR_NIVEL) {
      activa.experiencia -= EXP_POR_NIVEL;
      activa.nivel += INCREMENTO_NIVEL;
      mensajes.push(
        `${vistaCriatura(datos, activa).nombre} subió al nivel ${activa.nivel}.`
      );
    }

    const guardian = encuentro.guardianId
      ? datos.zonas
          .map((zona) => zona.guardian)
          .find(
            (elemento) => elemento && elemento.id === encuentro.guardianId
          )
      : null;
    const recompensa = guardian ? guardian.recompensa : VIDA_MINIMA;
    const bytesGanados =
      encuentro.rival.nivel * BYTES_RIVAL_POR_NIVEL + recompensa;
    partida.bytes += bytesGanados;
    mensajes.push(`Ganaste ${bytesGanados} bytes.`);

    if (guardian && !partida.sellos.includes(guardian.id)) {
      partida.sellos.push(guardian.id);
      registrar(partida, 'DESBLOQUEO', `Obtuviste el ${guardian.sello}.`);
    }
  } else {
    partida.zonaActual = partida.ultimaLocalidad;
    partida.criaturas.forEach((criatura) => {
      criatura.vida = vistaCriatura(datos, criatura).vidaMax;
    });
    mensajes.push(
      'Tu equipo fue derrotado. Regresaste a la última localidad y fue curado.'
    );
  }

  partida.encuentro = null;
}

function completarTurno(datos, partida, mensajes) {
  if (turnoDelRival(datos, partida, mensajes) === 'derrota') {
    terminar(datos, partida, 'derrota', mensajes);
    return respuesta(datos, partida, mensajes, 'derrota');
  }

  return respuesta(datos, partida, mensajes);
}

export function obtenerEncuentro() {
  return conPartida(({ datos, partida }) => {
    const encuentro = partida.encuentro;
    if (!encuentro) return null;

    const activa = obtenerActiva(datos, partida);
    const esferas = datos.objetos
      .filter((objeto) => objeto.tipo === 'captura')
      .map((objeto) => ({
        id: objeto.id,
        nombre: objeto.nombre,
        cantidad: partida.inventario[objeto.id] || VIDA_MINIMA,
      }));

    return {
      id: encuentro.id,
      turno: encuentro.turno,
      esGuardian: Boolean(encuentro.guardianId),
      rival: obtenerRival(datos, encuentro),
      activa: activa.vista,
      curaballs: partida.inventario[ID_CURABALL] || VIDA_MINIMA,
      esferas,
    };
  });
}

export function desafiarGuardian() {
  return conPartida(({ datos, partida }) => {
    const zona = buscarZona(datos, partida.zonaActual);
    if (!zona.guardian) fallar(404, 'No hay un guardián en esta localidad.');
    if (partida.sellos.includes(zona.guardian.id)) {
      fallar(409, 'Ya venciste al guardián de esta localidad.');
    }
    if (partida.encuentro) fallar(409, 'Ya tienes un combate pendiente.');
    if (
      !equipoActivo(partida).some(
        (criatura) => criatura.vida > VIDA_MINIMA
      )
    ) {
      fallar(409, 'No puedes combatir con todo el equipo debilitado.');
    }

    iniciarEncuentro(
      datos,
      partida,
      zona.guardian.criaturaId,
      zona.guardian.nivel,
      zona.guardian.id
    );
  });
}

export function atacar(turno) {
  return conPartida(({ datos, partida }) => {
    const encuentro = validarTurno(partida, turno);
    const activa = obtenerActiva(datos, partida);
    const rival = obtenerRival(datos, encuentro);
    const efectividad = calcularEfectividad(
      activa.vista.tipo,
      rival.tipo,
      datos
    );
    const dano = calcularDanoAleatorio(activa.vista, rival, efectividad);
    const mensajes = [
      `${activa.vista.nombre} causó ${dano} de daño a ${rival.nombre}.`,
    ];

    encuentro.rival.vida = Math.max(
      VIDA_MINIMA,
      encuentro.rival.vida - dano
    );

    if (encuentro.rival.vida === VIDA_MINIMA) {
      mensajes.push(`${rival.nombre} fue derrotado.`);
      terminar(datos, partida, 'victoria', mensajes);
      return respuesta(datos, partida, mensajes, 'victoria');
    }

    return completarTurno(datos, partida, mensajes);
  });
}

export function usarCuraball(turno) {
  return conPartida(({ datos, partida }) => {
    validarTurno(partida, turno);
    const activa = obtenerActiva(datos, partida);
    const cantidad = partida.inventario[ID_CURABALL] || VIDA_MINIMA;

    if (activa.criatura.vida >= activa.vista.vidaMax) {
      fallar(409, 'La criatura activa ya tiene la vida completa.');
    }
    if (cantidad <= VIDA_MINIMA) fallar(409, 'No tienes curaballs.');

    const vidaAnterior = activa.criatura.vida;
    activa.criatura.vida = Math.min(
      activa.vista.vidaMax,
      activa.criatura.vida + CURACION_CURABALL
    );
    partida.inventario[ID_CURABALL] = cantidad - CURABALL_USADA;
    const curado = activa.criatura.vida - vidaAnterior;
    const mensajes = [
      `${activa.vista.nombre} recuperó ${curado} puntos de vida.`,
    ];

    return completarTurno(datos, partida, mensajes);
  });
}

export function huir(turno) {
  return conPartida(({ datos, partida }) => {
    const encuentro = validarTurno(partida, turno);
    if (encuentro.guardianId) {
      fallar(409, 'No puedes huir de un combate contra un guardián.');
    }

    const mensajes = [];
    if (Math.random() < PROBABILIDAD_HUIDA) {
      mensajes.push('Lograste huir del combate.');
      return respuesta(datos, partida, mensajes, 'huida');
    }

    mensajes.push('No lograste huir del combate.');
    return completarTurno(datos, partida, mensajes);
  });
}