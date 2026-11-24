<!-- ═══════════════════════════════════════════════════════════════════
     ESTA PARTE LA TIENE QUE INTEGRAR: Heysser Machado
     Tarea A3-14 · Rama: test/a3-pruebas · Turno 6 (fecha máxima: lunes 23 de noviembre)
     Commit: "docs(api): registro de pruebas del Avance 3"
     ═══════════════════════════════════════════════════════════════════ -->

# DAEMON 504 · Registro de pruebas del Avance 3

Evidencia de las pruebas de reglas y seguridad de la API (Anexo A de la guía de trabajo), más la prueba de tienda y santuario (A3-13) y el recorrido completo del juego.

| Dato | Valor |
| --- | --- |
| Fecha | 22 de noviembre de 2026 |
| Responsable | Heysser Machado |
| Entorno | Node.js 22, API en `http://localhost:3000/api`, PostgreSQL 16 con la misma semilla (`npm run db:preparar`) |
| Datos de partida | Base recién preparada con `npm run db:preparar`; usuarios `demo` y `nuevo` |
| Archivos usados | `backend/pruebas/flujo-completo.http` y `backend/pruebas/tienda.http` |

## 1. Pruebas de reglas y seguridad (Anexo A)

| # | Intento | Esperado | Obtenido | ✔/✘ |
| --- | --- | --- | --- | --- |
| 1 | Solicitud sin usuario | 401 | 401 «Inicia sesión para continuar.» | ✔ |
| 2 | Usuario sin personaje | 404 | 404 «Aún no has creado tu personaje.» | ✔ |
| 3 | Crear personaje con nombre de 2 letras | 400 | 400 «El nombre debe tener entre 3 y 20 caracteres.» | ✔ |
| 4 | Regalarse bytes al crear el personaje | 201 con 300 bytes | 201 con 300 bytes (se envió `bytes: 99999`) | ✔ |
| 5 | Crear un segundo personaje | 409 | 409 «Ya tienes un personaje.» | ✔ |
| 6 | Mover o curar una criatura de otro jugador | 404 | 404 en las tres acciones (reserva, Curaball y apodo sobre una criatura ajena) | ✔ |
| 7 | Dejar el equipo vacío | 409 | 409 «Tu equipo debe tener al menos una criatura.» | ✔ |
| 8 | Moverse a una zona no conectada | 400 | 400 «Esa zona no está conectada con tu ubicación.» | ✔ |
| 9 | Moverse a una zona bloqueada | 403 | 403 «Montaña de la Tormenta está bloqueada: necesitas el Sello del Bosque.» | ✔ |
| 10 | Explorar o moverse con combate pendiente | 409 | 409 al explorar y 409 al moverse: «Tienes un combate pendiente.» | ✔ |
| 11 | Repetir una acción del mismo turno | 409 | Primer ataque 200; al repetir el turno 1: 409 «Ese turno ya pasó. Actualiza el combate.» | ✔ |
| 12 | Actuar en un encuentro que no es suyo | 404 | 404 «No hay un combate activo.» | ✔ |
| 13 | Huir de un guardián | 409 | 409 «No puedes huir de un combate contra un guardián.» | ✔ |
| 14 | Capturar con un objeto que no es esfera | 400 | 400 «Ese objeto no es una esfera de captura.» | ✔ |
| 15 | Capturar a un guardián | 409 | 409 «No puedes capturar a un guardián.» | ✔ |
| 16 | Comprar con precio falso | 200, cobra el del catálogo | 200; se envió `precio: 1` y cobró 100 bytes (precio del catálogo) | ✔ |
| 17 | Comprar más de 10 unidades | 400 | 400 «La cantidad debe estar entre 1 y 10.» (con 11 unidades) | ✔ |
| 18 | Santuario fuera de una localidad | 403 | 403 «El santuario solo está en las localidades.» | ✔ |
| 19 | Datos tras reiniciar el servidor | Se conservan | Tras detener y volver a iniciar el servidor, el personaje (zona, bytes y sellos) y el equipo (5 activos y 1 en reserva) eran idénticos | ✔ |

**Resultado: 19 de 19 pruebas con ✔.**

## 2. Tienda y santuario (A3-13)

Archivo: `backend/pruebas/tienda.http`. El demo empieza en el Bosque del Guerrero con 650 bytes y viaja al Valle del Encanto.

| # | Intento | Esperado | Obtenido | ✔/✘ |
| --- | --- | --- | --- | --- |
| T1 | Tienda sin usuario | 401 | 401 | ✔ |
| T2 | Tienda con usuario sin personaje | 404 | 404 | ✔ |
| T3 | Tienda en el bosque (no es localidad) | 200 con `esLocalidad: false` y sin productos | 200, `esLocalidad: false`, `productos: []` | ✔ |
| T4 | Comprar fuera de una localidad | 400 | 400 «Ese objeto no se vende aquí.» | ✔ |
| T5 | Tienda del valle | 200 con TamaBall y Curaball | 200, `esLocalidad: true`, bytes 650, dos productos | ✔ |
| T6 | Comprar 2 Curaball | 200, bytes 530 | 200 «Compraste 2 Curaball por 120 bytes.», bytes 530 | ✔ |
| T7 | Comprar con precio falso (`precio: 1`) | 200, cobra 100 | 200, bytes 430 (cobró 100) | ✔ |
| T8 | Cantidad 50 / 0 / 1.5 | 400 | 400 «La cantidad debe estar entre 1 y 10.» en las tres | ✔ |
| T9 | Objeto que la localidad no vende (MegaBall) | 400 | 400 «Ese objeto no se vende aquí.» | ✔ |
| T10 | Sin `objetoId` | 400 | 400 «Indica qué objeto quieres comprar.» | ✔ |
| T11 | Bytes insuficientes (10 TamaBall = 1000) | 409 y los bytes no cambian | 409 «Necesitas 1000 bytes y tienes 430.»; la tienda siguió mostrando 430 | ✔ |
| T12 | Santuario fuera de una localidad | 403 | 403 «El santuario solo está en las localidades.» | ✔ |
| T13 | Santuario en el valle con dos criaturas heridas (vida 10) | 200 y todo el equipo con vida máxima | 200 «Tu equipo recuperó toda su vida.»; vidas 76, 67, 68, 67 y 71 (máximas) | ✔ |
| T14 | Santuario con un combate pendiente | 409 | 409 «Termina el combate primero.» | ✔ |
| T15 | Dos compras iguales a la vez (doble clic) con 700 bytes | Solo una se aplica | Una respondió 200 (quedaron 100 bytes) y la otra 409 «Necesitas 600 bytes y tienes 100.» | ✔ |
| T16 | Historial de compras y curaciones | Eventos `COMPRA` y `CURACION` | Ambos eventos aparecen en `GET /api/historial` | ✔ |

**Resultado: 16 de 16 pruebas con ✔.**

## 3. Recorrido completo del juego

Archivo: `backend/pruebas/flujo-completo.http` (50 solicitudes, en orden, con los ids y turnos leídos de la respuesta anterior).

| Parte | Qué recorre | Resultado |
| --- | --- | --- |
| 1 | Salud, catálogo, ruta inexistente (404) y ruta del jugador sin identificarse (401) | Todas con el código esperado |
| 2 | Jugador nuevo: crear personaje (201, 300 bytes), equipo, apodo, inventario inicial, tienda, compra, santuario y movimiento | Todas con el código esperado |
| 3 | Demo: zona bloqueada (403), combate contra el guardián hasta la victoria, 2 sellos, zona desbloqueada y viaje a la montaña | Victoria en 11 rondas; todas con el código esperado |
| 4 | Demo: explorar hasta encontrar una criatura y capturarla con TamaBall | Captura lograda; aparece en el equipo y la esfera se descontó |
| 5 | Historial (filtro, tipo inválido, página 0), renombrar y borrar el personaje nuevo | Todas con el código esperado (204 al borrar y 404 después) |

**Resultado: las 50 solicitudes dieron el resultado esperado.**

## 4. Verificaciones técnicas

- `npm run lint` en `backend/`: sin errores.
- `npm run db:preparar`: crea las 17 tablas y carga 20 criaturas, 8 zonas, 4 guardianes, 3 objetos, 6 tipos y 3 eventos.
- `npm run dev` arranca la API y `GET /api/salud` responde `{ "estado": "ok" }`.
