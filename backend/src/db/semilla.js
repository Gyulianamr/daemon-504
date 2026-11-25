/* ═══════════════════════════════════════════════════════════════════
 * ESTA PARTE LA TIENE QUE INTEGRAR: Genesis Medina
 * Tarea A4-01 · Rama: feature/a4-base · Fecha límite: miércoles 25 de noviembre
 * Commit: "feat(db): contraseña cifrada y tabla de sesiones"
 * ═══════════════════════════════════════════════════════════════════ */
// npm run db:preparar → borra y crea las 18 tablas (esquema.sql) y carga el catálogo desde los
// mismos JSON del Front-End (frontend/public/data) más los dos usuarios de prueba. Todo en una transacción.
import { readFile } from 'node:fs/promises';
import { pool, transaccion } from './pool.js';
import { hashContrasena } from '../services/contrasenas.js';

const DATOS = new URL('../../../frontend/public/data/', import.meta.url);
const leerJson = async (nombre) => JSON.parse(await readFile(new URL(`${nombre}.json`, DATOS), 'utf8'));

export const USUARIO_DEMO = '00000000-0000-4000-8000-000000000001';
export const USUARIO_NUEVO = '00000000-0000-4000-8000-000000000002';

// Algunos eventos para que el historial del demo tenga más de una página desde el inicio.
const HISTORIAL_DEMO = [
  ['CAPTURA', 'Aria comienza su aventura junto a Aquabit.'],
  ['MOVIMIENTO', 'Viajaste a La Pradera Misteriosa.'],
  ['EXPLORACION', 'La Pradera Misteriosa: No encontraste nada.'],
  ['ENCUENTRO', 'Apareció Brizna de nivel 3.'],
  ['CAPTURA', 'Capturaste a Brizna (Nv 3) con TamaBall.'],
  ['EXPLORACION', 'La Pradera Misteriosa: Encontraste un objeto: Curaball.'],
  ['ENCUENTRO', 'Apareció Voltix de nivel 4.'],
  ['CAPTURA', 'Capturaste a Voltix (Nv 4) con TamaBall.'],
  ['ENCUENTRO', 'Apareció Charquito de nivel 4.'],
  ['CAPTURA', 'Capturaste a Charquito (Nv 4) con MegaBall.'],
  ['ENCUENTRO', 'Apareció Musguito de nivel 5.'],
  ['CAPTURA', 'Capturaste a Musguito (Nv 5) con TamaBall.'],
  ['ENCUENTRO', 'Apareció Roblevigía de nivel 6.'],
  ['COMBATE', 'Aquabit causó 14 de daño a Roblevigía. Roblevigía fue derrotado.'],
  ['DESBLOQUEO', 'Obtuviste el Sello de la Pradera.'],
  ['MOVIMIENTO', 'Viajaste a Bosque del Guerrero.'],
];

async function cargarCatalogo(db, { criaturas, zonas, objetos, tipos, eventos }) {
  const nombresTipos = Object.keys(tipos.fuerteContra);
  for (const [i, nombre] of nombresTipos.entries()) {
    await db.query('INSERT INTO tipos (nombre, orden) VALUES ($1, $2)', [nombre, i + 1]);
  }
  for (const [atacante, defensores] of Object.entries(tipos.fuerteContra)) {
    for (const [i, defensor] of defensores.entries()) {
      await db.query('INSERT INTO efectividades (atacante, defensor, orden) VALUES ($1, $2, $3)', [
        atacante, defensor, i + 1,
      ]);
    }
  }

  for (const c of criaturas) {
    await db.query(
      `INSERT INTO criaturas (id, nombre, tipo, rol, hp, ataque, defensa, facilidad_captura, descripcion)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [c.id, c.nombre, c.tipo, c.rol, c.base.hp, c.base.ataque, c.base.defensa, c.facilidadCaptura, c.descripcion],
    );
  }

  for (const o of objetos) {
    await db.query(
      `INSERT INTO objetos (id, nombre, tipo, valor, precio, peso_hallazgo, descripcion)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [o.id, o.nombre, o.tipo, o.valor, o.precio, o.pesoHallazgo, o.descripcion],
    );
  }

  // Zonas sin "requiere" primero: esa columna apunta a guardianes, que todavía no existen.
  for (const [i, z] of zonas.entries()) {
    await db.query(
      `INSERT INTO zonas (id, orden, nombre, tipo, descripcion, nivel_min, nivel_max,
                          peso_nada, peso_criatura, peso_objeto, peso_evento)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [z.id, i + 1, z.nombre, z.tipo, z.descripcion, z.nivelMin, z.nivelMax,
        z.eventos.nada, z.eventos.criatura, z.eventos.objeto, z.eventos.evento],
    );
  }
  for (const z of zonas.filter((zona) => zona.guardian)) {
    const g = z.guardian;
    await db.query(
      `INSERT INTO guardianes (id, zona_id, criatura_id, nivel, sello, recompensa, abre)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [g.id, z.id, g.criaturaId, g.nivel, g.sello, g.recompensa, g.abre],
    );
  }
  for (const z of zonas) {
    if (z.requiere) await db.query('UPDATE zonas SET requiere = $1 WHERE id = $2', [z.requiere, z.id]);
    for (const [i, destino] of z.conexiones.entries()) {
      await db.query('INSERT INTO conexiones (origen, destino, orden) VALUES ($1, $2, $3)', [z.id, destino, i + 1]);
    }
    for (const [i, a] of z.apariciones.entries()) {
      await db.query('INSERT INTO apariciones (zona_id, criatura_id, peso, orden) VALUES ($1, $2, $3, $4)', [
        z.id, a.criaturaId, a.peso, i + 1,
      ]);
    }
    for (const objetoId of z.tienda) {
      await db.query('INSERT INTO tienda (zona_id, objeto_id) VALUES ($1, $2)', [z.id, objetoId]);
    }
  }

  for (const texto of eventos) {
    await db.query('INSERT INTO eventos (texto) VALUES ($1)', [texto]);
  }
}

// demo@daemon504.hn con la partida de partida-demo.json; nuevo@daemon504.hn sin personaje.
async function cargarUsuarios(db, demo) {
  await db.query('INSERT INTO usuarios (id, correo, contrasena_hash) VALUES ($1, $2, $3), ($4, $5, $6)', [
    USUARIO_DEMO, demo.usuario.correo, hashContrasena('demo1234'),
    USUARIO_NUEVO, 'nuevo@daemon504.hn', hashContrasena('nuevo1234'),
  ]);

  const p = demo.partida;
  const { rows } = await db.query(
    `INSERT INTO personajes (usuario_id, nombre, bytes, zona_actual, ultima_localidad)
     VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    [USUARIO_DEMO, p.nombre, p.bytes, p.zonaActual, p.ultimaLocalidad],
  );
  const personajeId = rows[0].id;

  for (const guardianId of p.sellos) {
    await db.query('INSERT INTO sellos (personaje_id, guardian_id) VALUES ($1, $2)', [personajeId, guardianId]);
  }
  // Se respetan los ids del JSON (1..5) para que las pruebas .http puedan usarlos.
  for (const c of p.criaturas) {
    await db.query(
      `INSERT INTO criaturas_jugador (id, personaje_id, criatura_id, nivel, experiencia, vida, posicion)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [c.id, personajeId, c.criaturaId, c.nivel, c.experiencia, c.vida, c.posicion],
    );
  }
  // Como los ids se pusieron a mano, el contador sigue después del mayor.
  await db.query(
    `SELECT setval(pg_get_serial_sequence('criaturas_jugador', 'id'), (SELECT MAX(id) FROM criaturas_jugador))`,
  );
  for (const [objetoId, cantidad] of Object.entries(p.inventario)) {
    await db.query('INSERT INTO inventario (personaje_id, objeto_id, cantidad) VALUES ($1, $2, $3)', [
      personajeId, Number(objetoId), cantidad,
    ]);
  }
  // Fechas separadas por un minuto, del más viejo al más nuevo.
  for (const [i, [tipo, texto]] of HISTORIAL_DEMO.entries()) {
    await db.query(
      `INSERT INTO historial (personaje_id, tipo, texto, fecha)
       VALUES ($1, $2, $3, now() - make_interval(mins => $4))`,
      [personajeId, tipo, texto, HISTORIAL_DEMO.length - i],
    );
  }
}

async function preparar() {
  const esquema = await readFile(new URL('./esquema.sql', import.meta.url), 'utf8');
  const [criaturas, zonas, objetos, tipos, eventos, demo] = await Promise.all(
    ['criaturas', 'zonas', 'objetos', 'tipos', 'eventos', 'partida-demo'].map(leerJson),
  );

  await transaccion(async (db) => {
    await db.query(esquema);
    const { rows } = await db.query(
      "SELECT count(*) AS total FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'",
    );
    console.info(`✔ Esquema creado: ${rows[0].total} tablas`);

    await cargarCatalogo(db, { criaturas, zonas, objetos, tipos, eventos });
    const guardianesTotal = zonas.filter((z) => z.guardian).length;
    console.info(
      `✔ Catálogo: ${criaturas.length} criaturas, ${zonas.length} zonas, ${guardianesTotal} guardianes, ` +
        `${objetos.length} objetos, ${Object.keys(tipos.fuerteContra).length} tipos, ${eventos.length} eventos`,
    );

    await cargarUsuarios(db, demo);
    console.info(
      `✔ Usuarios de prueba: ${demo.usuario.correo} (${USUARIO_DEMO}) con partida, ` +
        `nuevo@daemon504.hn (${USUARIO_NUEVO}) sin personaje`,
    );
  });
  console.info('✔ Base de datos lista');
}

try {
  await preparar();
} catch (err) {
  console.error('✘ No se pudo preparar la base de datos:', err.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
