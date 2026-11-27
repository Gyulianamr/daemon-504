<!-- ═══════════════════════════════════════════════════════════════════
     ESTA PARTE LA TIENE QUE INTEGRAR: Jenifer Padilla
     Tarea A3-12 · Rama: docs/a3-api · Turno 5 (fecha máxima: domingo 22 de noviembre)
     Commit: "docs(api): endpoints, reglas y modelo de datos"
     ═══════════════════════════════════════════════════════════════════ -->

# DAEMON 504: Guardianes del Umbral · API del Avance 3

API REST en Node.js + Express con persistencia en PostgreSQL (Supabase). Todas las reglas del juego se calculan en el servidor: el navegador solo envía la acción y el servidor decide el resultado.

Prefijo de todas las rutas: `http://localhost:3000/api`

## 1. Convenciones

### 1.1 Identificación del jugador (provisional)

Hasta el Avance 5 (Supabase Auth), el usuario se identifica con el encabezado `X-Usuario-Id`.

| Usuario | X-Usuario-Id | Estado |
| --- | --- | --- |
| demo@daemon504.hn | `00000000-0000-4000-8000-000000000001` | Con partida (Bosque del Guerrero, 1 sello, 5 criaturas) |
| nuevo@daemon504.hn | `00000000-0000-4000-8000-000000000002` | Sin personaje |

- Todas las rutas requieren `X-Usuario-Id`, excepto `GET /salud` y `GET /catalogo`.
- Todas las rutas del jugador requieren además un personaje creado, excepto `POST /personaje`.
- El servicio siempre toma el personaje del middleware (`req.personajeId`), nunca del cuerpo de la solicitud.

### 1.2 Formato de errores

Todo error responde `{ "error": "mensaje para el usuario" }` con el código que corresponda.

| Código | Cuándo |
| --- | --- |
| 200 / 201 / 204 | Correcto / creado / borrado sin contenido |
| 400 | Formato o dato inválido (id que no es número, nombre corto, cantidad fuera de rango, JSON inválido) |
| 401 | No se identificó al usuario |
| 403 | No permitido en ese lugar (zona bloqueada, santuario fuera de localidad) |
| 404 | No existe o no es del jugador (personaje, criatura, encuentro, ruta) |
| 409 | Conflicto con el estado (combate pendiente, turno ya procesado, sin objetos, equipo lleno) |
| 500 | Error inesperado: se registra completo en la consola del servidor y al cliente se le da un mensaje general |

### 1.3 Combate por turnos

Cada encuentro tiene un número de `turno` que empieza en 1. Toda acción de combate (`atacar`, `curar`, `huir`, `capturar`) envía el turno actual en el cuerpo. Si el turno no coincide con el del servidor, se rechaza con 409; así un doble clic no repite la acción. Cada respuesta trae el nuevo turno en `encuentro.turno`.

Las acciones de combate responden siempre (valores de ejemplo):

```json
{
  "mensajes": ["Flamix causó 14 de daño a Brizna."],
  "final": null,
  "encuentro": { "id": 7, "turno": 2, "rival": { "criaturaId": 12, "nivel": 4, "vida": 18 }, "guardianId": null, "activaId": 3 }
}
```

`final` es `null` mientras el combate sigue, o `"victoria"`, `"derrota"`, `"huida"` o `"captura"` cuando termina (entonces `encuentro` es `null` y el combate se borra).

## 2. Resumen de endpoints

| Método | Ruta | Cuerpo | Descripción |
| --- | --- | --- | --- |
| GET | /salud | — | Comprueba que la API responde |
| GET | /catalogo | — | Criaturas, zonas, objetos, tipos y eventos |
| POST | /personaje | { nombre, criaturaInicialId } | Crear personaje (201) |
| GET · PATCH · DELETE | /personaje | — · { nombre } · — | Consultar, renombrar, borrar (204) |
| GET | /mundo/actual | — | Zona actual, guardián y destinos |
| POST | /mundo/mover | { destino } | Moverse a una zona conectada y desbloqueada |
| POST | /exploracion | — | Explorar: nada, criatura, objeto o evento |
| GET | /encuentros/actual | — | Combate activo o null |
| POST | /encuentros/guardian | — | Desafiar al guardián de la zona (201) |
| POST | /encuentros/:id/atacar · curar · huir | { turno } | Acciones de combate |
| POST | /encuentros/:id/capturar | { turno, objetoId } | Lanzar una esfera |
| GET | /equipo | — | Equipo activo (máx. 6) y reserva |
| PATCH | /equipo/:id/activa · reserva · equipo | — | Cambiar la posición de una criatura |
| PATCH | /equipo/:id/apodo | { apodo } | Poner o quitar apodo |
| DELETE | /equipo/:id | — | Liberar la criatura |
| GET | /inventario | — | Objetos y cantidades |
| POST | /inventario/usar | { objetoId, criaturaId } | Usar Curaball fuera de combate |
| GET | /tienda | — | Productos de la localidad y bytes |
| POST | /tienda/comprar | { objetoId, cantidad } | Comprar (1 a 10) |
| POST | /santuario/curar | — | Curar a todo el equipo |
| GET | /historial?tipo=&pagina= | — | Eventos de la partida, 10 por página |

## 3. Sistema

### GET /salud

`200` → `{ "estado": "ok", "fecha": "2026-11-22T15:00:00.000Z" }`

### GET /catalogo

Público, no requiere usuario. `200` → catálogo completo con la misma forma que los JSON del Front-End:
`{ criaturas, zonas, objetos, tipos, eventos }`.

## 4. Personaje

El servidor pone los 300 bytes, los objetos, la zona y el nivel iniciales: si el cuerpo trae `bytes`, se ignora.

### POST /personaje

Cuerpo: `{ "nombre": "Aria", "criaturaInicialId": 2 }`. No requiere personaje (solo usuario).

- `201` → `{ nombre, bytes, zonaId, zona, sellos, totalSellos }`
- `400` nombre de menos de 3 o más de 20 caracteres, nombre vacío, o criatura inicial que no es Flamix, Aquabit ni Terrox
- `409` el usuario ya tiene un personaje

### GET /personaje

`200` → `{ nombre, bytes, zonaId, zona, sellos, totalSellos }`

### PATCH /personaje

Cuerpo: `{ "nombre": "Nuevo nombre" }`. `200` → mismo resumen. `400` nombre vacío o fuera de 3 a 20 caracteres.

### DELETE /personaje

`204` sin contenido. Borra el personaje y, en cascada, toda su partida (criaturas, inventario, sellos, historial).

## 5. Mundo y exploración

### GET /mundo/actual

`200` → (valores de ejemplo)

```json
{
  "zona": { "id": "bosque", "nombre": "Bosque del Guerrero", "tipo": "zona", "descripcion": "...", "nivelMin": 5, "nivelMax": 8,
            "tieneTienda": false, "guardian": { "nombre": "...", "nivel": 8, "sello": "...", "derrotado": false } },
  "destinos": [ { "id": "pradera", "nombre": "...", "nivelMin": 3, "nivelMax": 6, "bloqueada": false, "requisito": null } ],
  "combatePendiente": false
}
```

`guardian` es `null` si la zona no tiene guardián. `requisito` es el nombre del sello necesario si la zona está bloqueada.

### POST /mundo/mover

Cuerpo: `{ "destino": "pradera" }`. `200` → misma forma que `GET /mundo/actual`.

- `400` falta el destino o la zona no está conectada con la ubicación actual
- `403` la zona está bloqueada (falta el sello)
- `409` hay un combate pendiente

Si el destino es una localidad, pasa a ser la última localidad visitada (a donde vuelve el jugador si pierde un combate).

### POST /exploracion

Sin cuerpo. `200` → `{ tipo, texto, encuentroId? }` donde `tipo` es `nada`, `criatura`, `objeto` o `evento`. Si es `criatura`, también trae `encuentroId` y queda un combate activo.

- `409` hay un combate pendiente o todo el equipo está debilitado

## 6. Combate

### GET /encuentros/actual

`200` → el combate activo o `null` (valores de ejemplo, la criatura activa se abrevia):

```json
{
  "id": 7, "turno": 1, "esGuardian": false,
  "rival": { "criaturaId": 12, "nivel": 4, "vida": 30, "nombre": "...", "tipo": "...", "rol": "salvaje", "vidaMax": 30, "ataque": 10, "defensa": 6 },
  "activa": { "id": 3, "nombre": "...", "tipo": "...", "nivel": 5, "vida": 40, "vidaMax": 40, "ataque": 12, "defensa": 8 },
  "curaballs": 3,
  "esferas": [ { "id": 1, "nombre": "TamaBall", "cantidad": 5 }, { "id": 2, "nombre": "MegaBall", "cantidad": 0 } ]
}
```

### POST /encuentros/guardian

Sin cuerpo. `201` → misma forma que `GET /encuentros/actual`.

- `404` no hay guardián en la localidad
- `409` ya se venció a ese guardián, hay un combate pendiente o el equipo está debilitado

### POST /encuentros/:id/atacar

Cuerpo: `{ "turno": 1 }`. `200` → respuesta de combate (sección 1.3). Después del ataque responde el rival.

- `400` el id o el turno no son enteros mayores que 0
- `404` el encuentro no existe o no es del jugador
- `409` el turno ya pasó

### POST /encuentros/:id/curar

Cuerpo: `{ "turno": 1 }`. Usa una Curaball sobre la criatura activa (+20 HP) y luego responde el rival.

- `400` / `404` / `409` por turno, igual que atacar
- `409` la criatura activa ya tiene la vida completa o no hay Curaball

### POST /encuentros/:id/huir

Cuerpo: `{ "turno": 1 }`. 70 % de éxito; si falla, el rival ataca. Final `"huida"` si logra huir.

- `409` el combate es contra un guardián, o el turno ya pasó

### POST /encuentros/:id/capturar

Cuerpo: `{ "turno": 1, "objetoId": 1 }`, donde `objetoId` es una esfera (1 = TamaBall, 2 = MegaBall). `200` → respuesta de combate (sección 1.3).

- Si se captura: `final` es `"captura"`, el combate termina y la criatura entra al equipo (o a la reserva si el equipo tiene 6) con la vida que le quedaba al rival.
- Si falla: la criatura escapa, el rival ataca y `final` es `null` (o `"derrota"` si cae todo el equipo).
- La esfera se gasta siempre, aunque la captura falle.
- `400` falta el turno, falta `objetoId`, o el objeto no es una esfera de captura (por ejemplo, una Curaball)
- `404` el encuentro no existe o no es del jugador
- `409` el turno ya pasó, el rival es un guardián o el jugador no tiene esa esfera

La fórmula de la probabilidad de captura está en la sección 11.

## 7. Equipo

El equipo activo tiene entre 1 y 6 criaturas (la primera es la activa); las demás están en reserva. Los cambios de equipo no se permiten durante un combate (409), salvo el apodo.

Las rutas de `/equipo` responden `200` → `{ activo, reserva, maximo }`, donde cada criatura trae `id`, `criaturaId`, `apodo`, `nombre`, `especie`, `tipo`, `rol`, `nivel`, `experiencia`, `vida`, `posicion`, `vidaMax`, `ataque` y `defensa`.

| Ruta | Efecto | Errores |
| --- | --- | --- |
| GET /equipo | Lista el equipo y la reserva | — |
| PATCH /equipo/:id/activa | La pasa a la posición 1 | 409 si está en reserva |
| PATCH /equipo/:id/reserva | La manda a la reserva | 409 si ya está en reserva o es la única del equipo |
| PATCH /equipo/:id/equipo | La pasa al final del equipo | 409 si ya está en el equipo o el equipo tiene 6 |
| PATCH /equipo/:id/apodo | Cuerpo `{ "apodo": "Chispa" }`: pone el apodo; `null` o vacío lo quita | 400 si no es texto o pasa de 20 caracteres |
| DELETE /equipo/:id | Libera (borra) la criatura | 409 si es la única del equipo |

Errores comunes: `400` si el id no es un número entero mayor que 0, `404` si la criatura no es del jugador, `409` si hay un combate pendiente.

## 8. Inventario

### GET /inventario

`200` → lista de objetos que el jugador tiene (cantidad mayor que 0): `{ id, nombre, tipo, valor, precio, pesoHallazgo, descripcion, cantidad }`.

### POST /inventario/usar

Cuerpo: `{ "objetoId": 3, "criaturaId": 5 }`. Usa una Curaball fuera de combate. `200` → `{ "mensaje": "Flamix ahora tiene 35/40 HP." }`

- `400` ids inválidos o el objeto no se puede usar aquí (no es de curación)
- `404` la criatura no es del jugador
- `409` hay un combate pendiente, no tiene el objeto, la criatura está debilitada o ya tiene la vida completa

## 9. Tienda y santuario

Documentados según el contrato de la tarea A3-13 (Heysser Machado); se integran en el último turno. El precio siempre sale del catálogo: el precio que mande el navegador se ignora. Los bytes nunca quedan negativos y el dinero se descuenta en la misma transacción de la compra.

| Método | Ruta | Cuerpo | Respuesta |
| --- | --- | --- | --- |
| GET | /tienda | — | `200` `{ zona, esLocalidad, bytes, productos }` |
| POST | /tienda/comprar | `{ objetoId, cantidad }` | `200` `{ mensaje, bytes }` |
| POST | /santuario/curar | — | `200` `{ mensaje }`; cura a todo el equipo |

- `POST /tienda/comprar`: `400` cantidad fuera de 1 a 10 u objeto que la localidad no vende.
- `POST /santuario/curar`: `403` fuera de una localidad.
- Comprar y curar solo se puede en localidades.

## 10. Historial

### GET /historial?tipo=&pagina=

Los dos parámetros son opcionales (tipo vacío = todos; página 1 por defecto). Del más nuevo al más viejo, 10 por página.

`200` → `{ eventos, pagina, totalPaginas, total }`, con cada evento `{ id, fecha, tipo, texto }`.

Tipos válidos: `MOVIMIENTO`, `EXPLORACION`, `ENCUENTRO`, `COMBATE`, `CAPTURA`, `OBJETO`, `CURACION`, `COMPRA`, `DESBLOQUEO`.

- `400` tipo inválido, o página que no es un entero mayor que 0

## 11. Reglas de negocio

### Personaje y progreso

- Un personaje por usuario, con nombre de 3 a 20 caracteres.
- Criatura inicial a elegir: Flamix (Fuego), Aquabit (Agua) o Terrox (Planta), en nivel 5.
- Comienza en el Valle del Encanto con 300 bytes, 5 TamaBall y 3 Curaball.
- El progreso son los sellos recuperados (4 guardianes). Cada acción guarda la partida.
- Si todo el equipo cae, el jugador vuelve a la última localidad visitada con el equipo curado y sin perder bytes.

### Mundo y exploración

- Solo se viaja a lugares conectados con el actual y desbloqueados (la zona pide el sello de un guardián).
- No se puede viajar ni explorar durante un combate.
- Se puede explorar en todos los lugares; comprar y curar solo en localidades.
- Al explorar se decide primero qué ocurre (nada, criatura, objeto o evento) con los pesos de la zona. Si sale criatura, se elige con la tabla de apariciones y su nivel al azar dentro del rango de la zona. Un objeto encontrado se suma al inventario.

### Combate

- Estadísticas por nivel: vida máxima = HP base + 3 × nivel; ataque y defensa = base + nivel.
- Daño = (ataque − defensa ÷ 2) × efectividad × azar (0.85 a 1), mínimo 1. La efectividad es ×1.5 si el tipo atacante es fuerte contra el defensor.
- Acciones: atacar, usar Curaball (+20 HP), capturar (solo salvajes) y huir (solo salvajes, 70 % de éxito). Después de cada acción responde el rival.
- Si la criatura activa cae, entra automáticamente la siguiente del equipo con vida.
- Al ganar, la criatura activa recibe nivel del rival × 10 de experiencia (sube de nivel cada 100) y el jugador nivel del rival × 5 bytes. Un guardián da además su recompensa y su sello.

### Captura

```
probabilidad = ((1 − vida actual ÷ vida máxima) × 0.7 + 0.1) × facilidad de la criatura × valor de la esfera
```

- Valor de la esfera: TamaBall ×1.0, MegaBall ×1.5. Máximo de 95 %.
- La esfera se gasta aunque falle; si falla, el rival ataca.
- Los guardianes no se pueden capturar.
- Una criatura capturada entra al equipo si hay espacio; si no, a la reserva.

### Equipo, inventario y localidades

- Equipo activo de máximo 6 criaturas y mínimo 1.
- La Curaball se usa en combate o desde el inventario; no sirve en criaturas debilitadas.
- La tienda vende según la localidad. El santuario cura gratis a todo el equipo.

## 12. Modelo de datos

17 tablas: 10 de catálogo (datos fijos) y 7 de partida (lo de cada jugador). Las crea `backend/src/db/esquema.sql`; `npm run db:preparar` las borra, las vuelve a crear y carga los datos desde los JSON del Front-End.

### Catálogo

| Tabla | Contenido |
| --- | --- |
| tipos · efectividades | Los 6 tipos y quién es fuerte contra quién (daño ×1.5) |
| criaturas | 20 especies: nombre, tipo, rol, hp, ataque, defensa, facilidad_captura |
| zonas | 8 lugares: tipo, niveles, zona requerida y pesos de exploración |
| guardianes | 4 guardianes: zona, criatura, nivel, sello, recompensa y zona que abre |
| conexiones · apariciones · tienda | A dónde se puede ir, qué criaturas aparecen (con peso) y qué vende cada localidad |
| objetos · eventos | TamaBall, MegaBall, Curaball y los textos de eventos |

### Partida

| Tabla | Contenido |
| --- | --- |
| usuarios | id (uuid) y correo. En el Avance 5 será el mismo id de Supabase Auth |
| personajes | Uno por usuario: nombre, bytes (nunca negativos), zona_actual, ultima_localidad |
| criaturas_jugador | Criaturas capturadas: especie, apodo, nivel, experiencia, vida, posicion (1–6 equipo, NULL reserva) |
| inventario | Cantidad de cada objeto |
| sellos | Guardianes vencidos (progreso y desbloqueo) |
| encuentros | Combate activo: rival, vida, guardián, criatura activa y turno. Máximo uno por personaje; al terminar se borra |
| historial | Eventos de la partida con tipo, texto y fecha |

- Al borrar un personaje se borra todo lo suyo (`ON DELETE CASCADE`).
- Todas las tablas tienen RLS activo sin políticas: solo esta API puede leerlas y modificarlas.

## 13. Cómo ejecutar el Back-End

Ver `backend/README.md`.

## 14. Progreso entre zonas

### GET /api/progreso

Dice qué le falta al jugador para llegar a la siguiente zona. Usa solo reglas que ya existen: no cambia los desbloqueos ni usa un nivel del jugador. El jugador sale de la sesión: no se envían ids.

**Requiere:** `Authorization: Bearer <token>` y personaje creado.

**Respuestas:** `200` con el progreso · `401` sin sesión o con token inválido · `404` sin personaje.

```json
{
  "sellos": { "obtenidos": 1, "total": 4 },
  "zonaActual": { "id": "bosque", "nombre": "Bosque del Guerrero" },
  "zonas": [
    {
      "id": "montana",
      "nombre": "Montaña de la Tormenta",
      "tipo": "zona",
      "estado": "bloqueada",
      "bloqueada": true,
      "requisito": "Sello del Bosque",
      "guardian": { "id": "g2", "nombre": "…", "nivel": 9, "zonaId": "bosque", "zonaNombre": "Bosque del Guerrero" }
    }
  ],
  "siguiente": {
    "zona": { "id": "montana", "nombre": "Montaña de la Tormenta" },
    "selloFaltante": "Sello del Bosque",
    "guardian": { "id": "g2", "nivel": 9, "zonaId": "bosque", "zonaNombre": "Bosque del Guerrero" },
    "estasEnLaZonaDelGuardian": true,
    "accion": "Desafía al guardián de nivel 9 para conseguir el Sello del Bosque."
  },
  "combatePendiente": false
}
```

| Campo | Significado |
|---|---|
| `sellos` | Sellos que tiene el jugador y el total del juego |
| `zonaActual` | Zona donde está el jugador |
| `zonas[].estado` | `actual`, `desbloqueada` o `bloqueada` |
| `zonas[].requisito` | Nombre del sello que pide; solo si la zona está bloqueada |
| `zonas[].guardian` | Guardián que entrega ese sello y la zona donde está; `null` si la zona no está bloqueada |
| `siguiente` | La primera zona bloqueada y lo que falta para abrirla; `null` si ya tiene todos los sellos |
| `siguiente.accion` | Texto para mostrar: «Termina tu combate», «Desafía al guardián…» o «Ve a <zona> y desafía…» |
| `combatePendiente` | `true` si hay un combate sin terminar |