-- ═══════════════════════════════════════════════════════════════════
-- ESTA PARTE LA TIENE QUE INTEGRAR: Genesis Medina
-- Tarea A4-01 · Rama: feature/a4-base · Fecha límite: miércoles 25 de noviembre
-- Commit: "feat(db): contraseña cifrada y tabla de sesiones"
-- ═══════════════════════════════════════════════════════════════════
-- Modelo de datos de DAEMON 504: 10 tablas de catálogo (datos fijos del juego) y 8 de partida
-- (lo de cada jugador). npm run db:preparar ejecuta este archivo: borra todo y lo vuelve a crear.

-- Se borra en orden inverso a las dependencias; CASCADE quita también las claves foráneas.
DROP TABLE IF EXISTS historial, encuentros, inventario, criaturas_jugador, sellos, personajes, sesiones, usuarios,
  eventos, tienda, objetos, apariciones, conexiones, guardianes, zonas, criaturas, efectividades, tipos CASCADE;

-- ─────────────────────────────── CATÁLOGO ───────────────────────────────

-- Los 6 tipos de criatura. "orden" conserva el orden de tipos.json.
CREATE TABLE tipos (
  nombre TEXT PRIMARY KEY,
  orden  SMALLINT NOT NULL
);

-- Quién es fuerte contra quién: el atacante hace daño ×1.5 al defensor.
-- "orden" conserva el orden de cada lista de tipos.json.
CREATE TABLE efectividades (
  atacante TEXT NOT NULL REFERENCES tipos (nombre),
  defensor TEXT NOT NULL REFERENCES tipos (nombre),
  orden    SMALLINT NOT NULL,
  PRIMARY KEY (atacante, defensor)
);

-- Las 20 especies con sus estadísticas base (nivel 0). Las del jugador viven en criaturas_jugador.
CREATE TABLE criaturas (
  id                INTEGER PRIMARY KEY,
  nombre            TEXT NOT NULL UNIQUE,
  tipo              TEXT NOT NULL REFERENCES tipos (nombre),
  rol               TEXT NOT NULL CHECK (rol IN ('inicial', 'salvaje', 'guardián')),
  hp                INTEGER NOT NULL CHECK (hp > 0),
  ataque            INTEGER NOT NULL CHECK (ataque > 0),
  defensa           INTEGER NOT NULL CHECK (defensa >= 0),
  -- 0 = imposible de capturar (guardianes), 1 = muy fácil.
  facilidad_captura NUMERIC(3, 2) NOT NULL CHECK (facilidad_captura BETWEEN 0 AND 1),
  descripcion       TEXT NOT NULL
);

-- Los 8 lugares del mapa. Los pesos deciden qué pasa al explorar (nada, criatura, objeto o evento).
CREATE TABLE zonas (
  id            TEXT PRIMARY KEY,
  orden         SMALLINT NOT NULL,
  nombre        TEXT NOT NULL,
  tipo          TEXT NOT NULL CHECK (tipo IN ('localidad', 'zona')),
  descripcion   TEXT NOT NULL,
  nivel_min     INTEGER NOT NULL CHECK (nivel_min >= 1),
  nivel_max     INTEGER NOT NULL,
  -- Guardián que hay que vencer para entrar (NULL = siempre abierta). La FK se agrega abajo,
  -- porque guardianes a su vez apunta a zonas.
  requiere      TEXT,
  peso_nada     INTEGER NOT NULL CHECK (peso_nada >= 0),
  peso_criatura INTEGER NOT NULL CHECK (peso_criatura >= 0),
  peso_objeto   INTEGER NOT NULL CHECK (peso_objeto >= 0),
  peso_evento   INTEGER NOT NULL CHECK (peso_evento >= 0),
  CHECK (nivel_max >= nivel_min),
  -- Si todos los pesos fueran 0, explorar no podría elegir nada.
  CHECK (peso_nada + peso_criatura + peso_objeto + peso_evento > 0)
);

-- Los 4 guardianes: uno por zona como máximo. Vencerlo da su sello y abre la zona "abre".
CREATE TABLE guardianes (
  id          TEXT PRIMARY KEY,
  zona_id     TEXT NOT NULL UNIQUE REFERENCES zonas (id),
  criatura_id INTEGER NOT NULL REFERENCES criaturas (id),
  nivel       INTEGER NOT NULL CHECK (nivel >= 1),
  sello       TEXT NOT NULL UNIQUE,
  recompensa  INTEGER NOT NULL CHECK (recompensa >= 0),
  abre        TEXT REFERENCES zonas (id)
);

ALTER TABLE zonas ADD CONSTRAINT zonas_requiere_fkey FOREIGN KEY (requiere) REFERENCES guardianes (id);

-- A dónde se puede viajar desde cada lugar. "orden" conserva el orden de la lista de destinos.
CREATE TABLE conexiones (
  origen  TEXT NOT NULL REFERENCES zonas (id),
  destino TEXT NOT NULL REFERENCES zonas (id),
  orden   SMALLINT NOT NULL,
  PRIMARY KEY (origen, destino),
  CHECK (origen <> destino)
);

-- Qué criaturas salvajes aparecen en cada lugar y con qué peso (probabilidad relativa).
-- "orden" conserva el orden de la tabla de apariciones de zonas.json.
CREATE TABLE apariciones (
  zona_id     TEXT NOT NULL REFERENCES zonas (id),
  criatura_id INTEGER NOT NULL REFERENCES criaturas (id),
  peso        INTEGER NOT NULL CHECK (peso > 0),
  orden       SMALLINT NOT NULL,
  PRIMARY KEY (zona_id, criatura_id)
);

-- TamaBall, MegaBall y Curaball. "valor" es el multiplicador de captura o los HP que cura.
CREATE TABLE objetos (
  id             INTEGER PRIMARY KEY,
  nombre         TEXT NOT NULL UNIQUE,
  tipo           TEXT NOT NULL CHECK (tipo IN ('captura', 'curacion')),
  valor          NUMERIC(5, 2) NOT NULL CHECK (valor > 0),
  precio         INTEGER NOT NULL CHECK (precio >= 0),
  peso_hallazgo  INTEGER NOT NULL CHECK (peso_hallazgo >= 0),
  descripcion    TEXT NOT NULL
);

-- Qué vende la tienda de cada localidad. El precio siempre sale de objetos, nunca del navegador.
CREATE TABLE tienda (
  zona_id   TEXT NOT NULL REFERENCES zonas (id),
  objeto_id INTEGER NOT NULL REFERENCES objetos (id),
  PRIMARY KEY (zona_id, objeto_id)
);

-- Textos de los eventos especiales que pueden salir al explorar.
CREATE TABLE eventos (
  id    INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  texto TEXT NOT NULL
);

-- ─────────────────────────────── PARTIDA ───────────────────────────────

-- Cada jugador. La contraseña se guarda cifrada (bcrypt), nunca en texto plano.
CREATE TABLE usuarios (
  id              UUID PRIMARY KEY,
  correo          TEXT NOT NULL UNIQUE,
  contrasena_hash TEXT NOT NULL,
  creado_en       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Un token por inicio de sesión (cerrar sesión borra la fila). Vence a los 7 días.
CREATE TABLE sesiones (
  token      TEXT PRIMARY KEY,
  usuario_id UUID NOT NULL REFERENCES usuarios (id) ON DELETE CASCADE,
  creado_en  TIMESTAMPTZ NOT NULL DEFAULT now(),
  expira_en  TIMESTAMPTZ NOT NULL
);
CREATE INDEX sesiones_usuario_idx ON sesiones (usuario_id);

-- Un personaje (guardián) por usuario. Borrar el personaje borra toda su partida (CASCADE).
CREATE TABLE personajes (
  id               INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  usuario_id       UUID NOT NULL UNIQUE REFERENCES usuarios (id) ON DELETE CASCADE,
  nombre           TEXT NOT NULL CHECK (char_length(nombre) BETWEEN 3 AND 20),
  bytes            INTEGER NOT NULL DEFAULT 300 CHECK (bytes >= 0),
  zona_actual      TEXT NOT NULL REFERENCES zonas (id),
  ultima_localidad TEXT NOT NULL REFERENCES zonas (id),
  creado_en        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Guardianes vencidos por cada personaje: es el progreso y lo que desbloquea zonas.
CREATE TABLE sellos (
  personaje_id INTEGER NOT NULL REFERENCES personajes (id) ON DELETE CASCADE,
  guardian_id  TEXT NOT NULL REFERENCES guardianes (id),
  obtenido_en  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (personaje_id, guardian_id)
);

-- Las criaturas que tiene cada jugador. posicion 1..6 = equipo activo (la 1 es la activa); NULL = reserva.
CREATE TABLE criaturas_jugador (
  id           INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  personaje_id INTEGER NOT NULL REFERENCES personajes (id) ON DELETE CASCADE,
  criatura_id  INTEGER NOT NULL REFERENCES criaturas (id),
  apodo        TEXT CHECK (apodo IS NULL OR char_length(apodo) BETWEEN 1 AND 20),
  nivel        INTEGER NOT NULL CHECK (nivel >= 1),
  experiencia  INTEGER NOT NULL DEFAULT 0 CHECK (experiencia >= 0),
  vida         INTEGER NOT NULL CHECK (vida >= 0),
  posicion     SMALLINT CHECK (posicion BETWEEN 1 AND 6),
  -- Permite que encuentros apunte a (personaje_id, id): así la criatura activa siempre es del mismo jugador.
  UNIQUE (personaje_id, id),
  -- Dos criaturas no pueden ocupar el mismo puesto. Se revisa al final de la transacción (DEFERRABLE)
  -- para poder intercambiar posiciones sin chocar a mitad del cambio.
  UNIQUE (personaje_id, posicion) DEFERRABLE INITIALLY DEFERRED
);

-- Cuántas unidades de cada objeto tiene cada jugador.
CREATE TABLE inventario (
  personaje_id INTEGER NOT NULL REFERENCES personajes (id) ON DELETE CASCADE,
  objeto_id    INTEGER NOT NULL REFERENCES objetos (id),
  cantidad     INTEGER NOT NULL DEFAULT 0 CHECK (cantidad >= 0),
  PRIMARY KEY (personaje_id, objeto_id)
);

-- El combate activo. Máximo uno por personaje (UNIQUE); al terminar el combate la fila se borra.
CREATE TABLE encuentros (
  id                INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  personaje_id      INTEGER NOT NULL UNIQUE REFERENCES personajes (id) ON DELETE CASCADE,
  rival_criatura_id INTEGER NOT NULL REFERENCES criaturas (id),
  rival_nivel       INTEGER NOT NULL CHECK (rival_nivel >= 1),
  rival_vida        INTEGER NOT NULL CHECK (rival_vida >= 0),
  -- NULL = criatura salvaje; si tiene valor, es un combate contra ese guardián.
  guardian_id       TEXT REFERENCES guardianes (id),
  activa_id         INTEGER NOT NULL,
  turno             INTEGER NOT NULL DEFAULT 1 CHECK (turno >= 1),
  creado_en         TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Clave foránea compuesta: la criatura activa debe ser del MISMO personaje del encuentro.
  FOREIGN KEY (personaje_id, activa_id) REFERENCES criaturas_jugador (personaje_id, id)
);

-- Lo que va pasando en la partida, para la pantalla Historial.
CREATE TABLE historial (
  id           BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  personaje_id INTEGER NOT NULL REFERENCES personajes (id) ON DELETE CASCADE,
  tipo         TEXT NOT NULL CHECK (tipo IN ('MOVIMIENTO', 'EXPLORACION', 'ENCUENTRO', 'COMBATE', 'CAPTURA',
                                             'OBJETO', 'CURACION', 'COMPRA', 'DESBLOQUEO', 'EQUIPO')),
  texto        TEXT NOT NULL,
  fecha        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- La pantalla Historial pide los eventos de un personaje del más nuevo al más viejo.
CREATE INDEX historial_personaje_fecha_idx ON historial (personaje_id, fecha DESC, id DESC);

-- ─────────────────────────────── SEGURIDAD ───────────────────────────────
-- RLS activo y sin políticas: nadie puede leer ni escribir desde la API pública de Supabase.
-- Solo nuestra API, que se conecta como dueña de las tablas, tiene acceso.
ALTER TABLE tipos             ENABLE ROW LEVEL SECURITY;
ALTER TABLE efectividades     ENABLE ROW LEVEL SECURITY;
ALTER TABLE criaturas         ENABLE ROW LEVEL SECURITY;
ALTER TABLE zonas             ENABLE ROW LEVEL SECURITY;
ALTER TABLE guardianes        ENABLE ROW LEVEL SECURITY;
ALTER TABLE conexiones        ENABLE ROW LEVEL SECURITY;
ALTER TABLE apariciones       ENABLE ROW LEVEL SECURITY;
ALTER TABLE objetos           ENABLE ROW LEVEL SECURITY;
ALTER TABLE tienda            ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos           ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios          ENABLE ROW LEVEL SECURITY;
ALTER TABLE sesiones          ENABLE ROW LEVEL SECURITY;
ALTER TABLE personajes        ENABLE ROW LEVEL SECURITY;
ALTER TABLE sellos            ENABLE ROW LEVEL SECURITY;
ALTER TABLE criaturas_jugador ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventario        ENABLE ROW LEVEL SECURITY;
ALTER TABLE encuentros        ENABLE ROW LEVEL SECURITY;
ALTER TABLE historial         ENABLE ROW LEVEL SECURITY;
