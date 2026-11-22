import { pool, transaccion } from '../db/pool.js';
import { buscarCriatura, buscarZona, obtenerCatalogo, guardianes } from '../models/catalogo.js';
import * as criaturasJugador from '../models/criaturasJugador.js';
import * as encuentros from '../models/encuentros.js';
import * as inventario from '../models/inventario.js';
import * as personajes from '../models/personajes.js';
import { fallar } from '../middleware/ErrorApi.js';
import { registrar } from './historial.js';
import { iniciarEncuentro } from './exploracion.js';
import { equipoActivo, vistaCriatura } from './equipo.js';
import { estadisticas } from './reglas.js';

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
const RECOMPENSA_SIN_GUARDIAN = 0;

export function calcularEfectividad(tipoAtacante, tipoDefensor, tablaTipos) {
  const fuertes = tablaTipos.fuerteContra[tipoAtacante] || [];
  return fuertes.includes(tipoDefensor) ? EFECTIVIDAD_FUERTE : EFECTIVIDAD_NORMAL;
}

export function calcularDano(atacante, defensor, efectividad, azar) {
  return Math.max(
    DANO_MINIMO,
    Math.round((atacante.ataque - defensor.defensa / 2) * efectividad * azar),
  );
}

function convertirFila(fila) {
  return {
    id: fila.id,
    rival: {
      criaturaId: fila.criaturaId,
      nivel: fila.nivel,
      vida: fila.vida,
    },
    guardianId: fila.guardianId,
    activaId: fila.activaId,
    turno: fila.turno,
  };
}

function vistaRival(catalogo, encuentro) {
  const especie = buscarCriatura(catalogo, encuentro.rival.criaturaId);
  return {
    ...encuentro.rival,
    nombre: especie.nombre,
    tipo: especie.tipo,
    rol: especie.rol,
    ...estadisticas(especie, encuentro.rival.nivel),
  };
}

function inventarioComoMapa(filas) {
  return Object.fromEntries(filas.map(({ objetoId, cantidad }) => [objetoId, cantidad]));
}

async function actualizarVidaCriatura(ctx, criatura, vida) {
  await ctx.db.query(
    `UPDATE criaturas_jugador SET vida = $1
     WHERE personaje_id = $2 AND id = $3`,
    [vida, ctx.personajeId, criatura.id],
  );
  criatura.vida = vida;
}

async function actualizarEncuentro(ctx, cambios) {
  const { rowCount } = await ctx.db.query(
    `UPDATE encuentros
     SET rival_vida = $1, activa_id = $2, turno = $3
     WHERE personaje_id = $4 AND id = $5`,
    [
      cambios.rivalVida ?? ctx.encuentro.rival.vida,
      cambios.activaId ?? ctx.encuentro.activaId,
      cambios.turno ?? ctx.encuentro.turno,
      ctx.personajeId,
      ctx.encuentro.id,
    ],
  );
  if (rowCount !== 1) throw new Error('No se pudo actualizar el combate activo.');
  if (cambios.rivalVida !== undefined) ctx.encuentro.rival.vida = cambios.rivalVida;
  if (cambios.activaId !== undefined) ctx.encuentro.activaId = cambios.activaId;
  if (cambios.turno !== undefined) ctx.encuentro.turno = cambios.turno;
}

export async function cargarCombate(db, personajeId, encuentroId, turno) {
  const personaje = await personajes.bloquear(db, personajeId);
  if (!personaje) fallar(404, 'No existe tu personaje.');

  const { rows } = await db.query(
    `SELECT id, rival_criatura_id AS "criaturaId", rival_nivel AS nivel, rival_vida AS vida,
            guardian_id AS "guardianId", activa_id AS "activaId", turno
     FROM encuentros
     WHERE personaje_id = $1 AND id = $2
     FOR UPDATE`,
    [personajeId, encuentroId],
  );
  if (!rows[0]) fallar(404, 'No hay un combate activo.');

  const encuentro = convertirFila(rows[0]);
  if (encuentro.turno !== turno) {
    fallar(409, 'Ese turno ya pasó. Actualiza el combate.');
  }

  const [catalogo, listaCriaturas, objetos] = await Promise.all([
    obtenerCatalogo(db),
    criaturasJugador.listar(db, personajeId),
    inventario.listar(db, personajeId),
  ]);
  const activa = listaCriaturas.find((criatura) => criatura.id === encuentro.activaId);
  if (!activa) fallar(409, 'No se encontró la criatura activa del combate.');
  const rivalEspecie = buscarCriatura(catalogo, encuentro.rival.criaturaId);
  if (!rivalEspecie) throw new Error('No se encontró la especie del rival.');

  return {
    db,
    personajeId,
    personaje,
    catalogo,
    encuentro,
    criaturas: listaCriaturas,
    equipo: equipoActivo(listaCriaturas),
    inventario: inventarioComoMapa(objetos),
    activa: {
      criatura: activa,
      vista: vistaCriatura(catalogo, activa),
    },
    rival: vistaRival(catalogo, encuentro),
  };
}

export async function turnoDelRival(ctx, mensajes) {
  const { criatura } = ctx.activa;
  const efectividad = calcularEfectividad(
    ctx.rival.tipo,
    ctx.activa.vista.tipo,
    ctx.catalogo.tipos,
  );
  const azar = Math.random() * (AZAR_MAXIMO - AZAR_MINIMO) + AZAR_MINIMO;
  const dano = calcularDano(ctx.rival, ctx.activa.vista, efectividad, azar);
  const vida = Math.max(VIDA_MINIMA, criatura.vida - dano);

  await actualizarVidaCriatura(ctx, criatura, vida);
  mensajes.push(`${ctx.rival.nombre} causó ${dano} de daño a ${ctx.activa.vista.nombre}.`);

  const turno = ctx.encuentro.turno + INCREMENTO_TURNO;
  if (vida === VIDA_MINIMA) {
    const siguiente = ctx.equipo.find(
      (elemento) => elemento.id !== criatura.id && elemento.vida > VIDA_MINIMA,
    );
    if (!siguiente) {
      await actualizarEncuentro(ctx, { turno });
      return 'derrota';
    }

    await actualizarEncuentro(ctx, { activaId: siguiente.id, turno });
    ctx.activa = {
      criatura: siguiente,
      vista: vistaCriatura(ctx.catalogo, siguiente),
    };
    mensajes.push(`${ctx.activa.vista.nombre} entra al combate.`);
    return null;
  }

  await actualizarEncuentro(ctx, { turno });
  return null;
}

export async function terminar(ctx, resultado, mensajes) {
  const encuentro = ctx.encuentro;
  if (resultado === 'victoria') {
    const activa = ctx.activa.criatura;
    const experienciaGanada = encuentro.rival.nivel * EXP_RIVAL_POR_NIVEL;
    let experiencia = activa.experiencia + experienciaGanada;
    let nivel = activa.nivel;
    mensajes.push(`Ganaste ${experienciaGanada} puntos de experiencia.`);

    while (experiencia >= EXP_POR_NIVEL) {
      experiencia -= EXP_POR_NIVEL;
      nivel += INCREMENTO_NIVEL;
      mensajes.push(
        `${vistaCriatura(ctx.catalogo, { ...activa, nivel }).nombre} subió al nivel ${nivel}.`,
      );
    }

    await ctx.db.query(
      `UPDATE criaturas_jugador SET experiencia = $1, nivel = $2
       WHERE personaje_id = $3 AND id = $4`,
      [experiencia, nivel, ctx.personajeId, activa.id],
    );
    activa.experiencia = experiencia;
    activa.nivel = nivel;

    const guardian = encuentro.guardianId
      ? guardianes(ctx.catalogo).find((elemento) => elemento.id === encuentro.guardianId)
      : null;
    const recompensa = guardian ? guardian.recompensa : RECOMPENSA_SIN_GUARDIAN;
    const bytesGanados = encuentro.rival.nivel * BYTES_RIVAL_POR_NIVEL + recompensa;
    await personajes.actualizar(ctx.db, ctx.personajeId, {
      bytes: ctx.personaje.bytes + bytesGanados,
    });
    ctx.personaje.bytes += bytesGanados;
    mensajes.push(`Ganaste ${bytesGanados} bytes.`);

    if (guardian && (await personajes.agregarSello(ctx.db, ctx.personajeId, guardian.id))) {
      await registrar(ctx.db, ctx.personajeId, 'DESBLOQUEO', `Obtuviste el ${guardian.sello}.`);
    }
    return;
  }

  if (resultado === 'derrota') {
    await personajes.actualizar(ctx.db, ctx.personajeId, {
      zonaActual: ctx.personaje.ultimaLocalidad,
    });
    ctx.personaje.zonaActual = ctx.personaje.ultimaLocalidad;
    for (const criatura of ctx.criaturas) {
      const vidaMax = vistaCriatura(ctx.catalogo, criatura).vidaMax;
      await actualizarVidaCriatura(ctx, criatura, vidaMax);
    }
    mensajes.push('Tu equipo fue derrotado. Regresaste a la última localidad y fue curado.');
  }
}

export async function respuesta(ctx, mensajes, final = null) {
  if (mensajes.length > 0) {
    await registrar(ctx.db, ctx.personajeId, 'COMBATE', mensajes.join(' '));
  }

  if (final) {
    const { rowCount } = await ctx.db.query(
      'DELETE FROM encuentros WHERE personaje_id = $1 AND id = $2',
      [ctx.personajeId, ctx.encuentro.id],
    );
    if (rowCount !== 1) throw new Error('No se pudo cerrar el combate activo.');
    ctx.encuentro = null;
  }

  return {
    mensajes,
    final,
    encuentro: final ? null : ctx.encuentro,
  };
}

function vistaEncuentro(ctx) {
  return {
    id: ctx.encuentro.id,
    turno: ctx.encuentro.turno,
    esGuardian: Boolean(ctx.encuentro.guardianId),
    rival: ctx.rival,
    activa: ctx.activa.vista,
    curaballs: ctx.inventario[ID_CURABALL] || VIDA_MINIMA,
    esferas: ctx.catalogo.objetos
      .filter((objeto) => objeto.tipo === 'captura')
      .map((objeto) => ({
        id: objeto.id,
        nombre: objeto.nombre,
        cantidad: ctx.inventario[objeto.id] || VIDA_MINIMA,
      })),
  };
}

export async function obtenerEncuentro(personajeId) {
  const encuentro = await encuentros.buscarPorPersonaje(pool, personajeId);
  if (!encuentro) return null;

  const [catalogo, listaCriaturas, objetos] = await Promise.all([
    obtenerCatalogo(),
    criaturasJugador.listar(pool, personajeId),
    inventario.listar(pool, personajeId),
  ]);
  const activa = listaCriaturas.find((criatura) => criatura.id === encuentro.activaId);
  if (!activa) fallar(409, 'No se encontró la criatura activa del combate.');

  const ctx = {
    personajeId,
    catalogo,
    encuentro,
    activa: { vista: vistaCriatura(catalogo, activa) },
    rival: vistaRival(catalogo, encuentro),
    inventario: inventarioComoMapa(objetos),
  };
  return vistaEncuentro(ctx);
}

export const desafiarGuardian = (personajeId) =>
  transaccion(async (db) => {
    const personaje = await personajes.bloquear(db, personajeId);
    if (!personaje) fallar(404, 'No existe tu personaje.');

    const catalogo = await obtenerCatalogo(db);
    const zona = buscarZona(catalogo, personaje.zonaActual);
    if (!zona?.guardian) fallar(404, 'No hay un guardián en esta localidad.');
    const sellos = await personajes.listarSellos(db, personajeId);
    if (sellos.includes(zona.guardian.id)) {
      fallar(409, 'Ya venciste al guardián de esta localidad.');
    }
    if (await encuentros.buscarPorPersonaje(db, personajeId)) {
      fallar(409, 'Ya tienes un combate pendiente.');
    }

    const equipo = equipoActivo(await criaturasJugador.listar(db, personajeId));
    if (!equipo.some((criatura) => criatura.vida > VIDA_MINIMA)) {
      fallar(409, 'No puedes combatir con todo el equipo debilitado.');
    }

    const encuentro = await iniciarEncuentro(
      db,
      catalogo,
      personajeId,
      zona.guardian.criaturaId,
      zona.guardian.nivel,
      zona.guardian.id,
    );
    const rival = buscarCriatura(catalogo, zona.guardian.criaturaId);
    await registrar(
      db,
      personajeId,
      'ENCUENTRO',
      `Apareció ${rival.nombre} de nivel ${zona.guardian.nivel}.`,
    );
    const ctx = await cargarCombate(db, personajeId, encuentro.id, TURNO_INICIAL);
    return vistaEncuentro(ctx);
  });

export const atacar = (personajeId, encuentroId, turno) =>
  transaccion(async (db) => {
    const ctx = await cargarCombate(db, personajeId, encuentroId, turno);
    const efectividad = calcularEfectividad(
      ctx.activa.vista.tipo,
      ctx.rival.tipo,
      ctx.catalogo.tipos,
    );
    const azar = Math.random() * (AZAR_MAXIMO - AZAR_MINIMO) + AZAR_MINIMO;
    const dano = calcularDano(ctx.activa.vista, ctx.rival, efectividad, azar);
    const vidaRival = Math.max(VIDA_MINIMA, ctx.encuentro.rival.vida - dano);
    const mensajes = [`${ctx.activa.vista.nombre} causó ${dano} de daño a ${ctx.rival.nombre}.`];

    await actualizarEncuentro(ctx, { rivalVida: vidaRival });
    if (vidaRival === VIDA_MINIMA) {
      mensajes.push(`${ctx.rival.nombre} fue derrotado.`);
      await terminar(ctx, 'victoria', mensajes);
      return respuesta(ctx, mensajes, 'victoria');
    }

    if ((await turnoDelRival(ctx, mensajes)) === 'derrota') {
      await terminar(ctx, 'derrota', mensajes);
      return respuesta(ctx, mensajes, 'derrota');
    }
    return respuesta(ctx, mensajes);
  });

export const usarCuraball = (personajeId, encuentroId, turno) =>
  transaccion(async (db) => {
    const ctx = await cargarCombate(db, personajeId, encuentroId, turno);
    const cantidad = await inventario.cantidad(db, personajeId, ID_CURABALL);

    if (ctx.activa.criatura.vida >= ctx.activa.vista.vidaMax) {
      fallar(409, 'La criatura activa ya tiene la vida completa.');
    }
    if (cantidad <= VIDA_MINIMA) fallar(409, 'No tienes curaballs.');
    if (!(await inventario.gastar(db, personajeId, ID_CURABALL, CURABALL_USADA))) {
      fallar(409, 'No tienes curaballs.');
    }

    const vidaAnterior = ctx.activa.criatura.vida;
    const vida = Math.min(
      ctx.activa.vista.vidaMax,
      vidaAnterior + CURACION_CURABALL,
    );
    await actualizarVidaCriatura(ctx, ctx.activa.criatura, vida);
    ctx.inventario[ID_CURABALL] = cantidad - CURABALL_USADA;
    const curado = vida - vidaAnterior;
    const mensajes = [`${ctx.activa.vista.nombre} recuperó ${curado} puntos de vida.`];

    if ((await turnoDelRival(ctx, mensajes)) === 'derrota') {
      await terminar(ctx, 'derrota', mensajes);
      return respuesta(ctx, mensajes, 'derrota');
    }
    return respuesta(ctx, mensajes);
  });

export const huir = (personajeId, encuentroId, turno) =>
  transaccion(async (db) => {
    const ctx = await cargarCombate(db, personajeId, encuentroId, turno);
    if (ctx.encuentro.guardianId) {
      fallar(409, 'No puedes huir de un combate contra un guardián.');
    }

    const mensajes = [];
    if (Math.random() < PROBABILIDAD_HUIDA) {
      mensajes.push('Lograste huir del combate.');
      return respuesta(ctx, mensajes, 'huida');
    }

    mensajes.push('No lograste huir del combate.');
    if ((await turnoDelRival(ctx, mensajes)) === 'derrota') {
      await terminar(ctx, 'derrota', mensajes);
      return respuesta(ctx, mensajes, 'derrota');
    }
    return respuesta(ctx, mensajes);
  });
