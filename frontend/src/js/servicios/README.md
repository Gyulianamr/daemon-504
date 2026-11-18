# js/servicios/

Aquí están las reglas del juego. Las pantallas **nunca** cambian la partida directamente: siempre llaman a una función de este folder, que valida y responde o lanza un error con `status` y mensaje.

| Archivo | Futuro endpoint principal | Responsable |
|---|---|---|
| auth.js | /api/auth/* | Luis Felipe Ortiz |
| personaje.js | POST /api/personaje | Genesis Medina |
| mundo.js | GET /api/mundo/actual · POST /api/mundo/mover | Jenifer Padilla |
| exploracion.js | POST /api/exploracion | Dinora Padilla |
| combate.js | /api/encuentros/* | Luis Felipe Ortiz |
| captura.js | POST /api/encuentros/:id/capturar | Jatniel Oliva |
| equipo.js | /api/equipo | Jatniel Oliva |
| inventario.js | /api/inventario | Jatniel Oliva |
| tienda.js | /api/tienda · /api/santuario | Heysser Machado |
| historial.js | GET /api/historial | Genesis Medina |

En el Avance 4 se reemplaza el interior de cada función por `fetch()`; los nombres y las respuestas se mantienen.
