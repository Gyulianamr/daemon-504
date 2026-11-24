# DAEMON 504 · Guardianes del Umbral

Aventura web de exploración, captura y combate por turnos.
Proyecto Integrador · ISC-305 Programación Web · III PAC 2026 · UNAH Campus Comayagua · Ing. Claudio Paz.

## Equipo

| Integrante | Cuenta | Módulos |
|---|---|---|
| Genesis Yuliana Medina Ramos | 20231900117 | Base del proyecto, personaje, historial, integración |
| Dinora Roxana Padilla Ortiz | 20181900411 | Exploración |
| Jenifer Michel Padilla Lara | 20241900042 | Mundo y movimiento |
| Jatniel Isai Oliva Padilla | 20221900248 | Componentes, equipo, captura, inventario |
| Luis Felipe Ortiz López | 20231900242 | Acceso, sesión y combate |
| Heysser Javier Machado Mejía | 20191031271 | Tienda y santuario |

## Cómo ejecutarlo

Requiere Node.js 20.

```bash
cd frontend
npm install
npm run dev        # abre http://localhost:5173
```

Cuenta de prueba: **demo@daemon504.hn / demo1234** (personaje en el Bosque del Guerrero con 5 criaturas).
También se puede registrar una cuenta nueva y crear un personaje desde cero.

Otros comandos: `npm run lint` (revisión de código) y `npm run build` (versión para publicar).

## Estructura

```
daemon-504/
├── frontend/                React + Vite
│   ├── public/data/         Datos fijos del juego (JSON)
│   └── src/
│       ├── pages/           Una pantalla por archivo
│       ├── components/      Piezas reutilizables (botón, tarjeta, barra de vida…)
│       ├── css/             Todos los estilos
│       └── js/
│           ├── servicios/   Reglas del juego; en el Avance 4 llamarán a la API
│           ├── sesion/      Quién inició sesión
│           └── utils/       Funciones de apoyo
├── backend/                 API REST en Node.js + Express + PostgreSQL (Avance 3)
│   ├── pruebas/             Una prueba .http por módulo + flujo-completo.http
│   └── src/
│       ├── config/          Lectura del .env
│       ├── db/              pool.js (conexión y transacciones), esquema.sql, semilla.js
│       ├── middleware/      Registro, identificación del jugador, validaciones y errores
│       ├── routes/          Método + URL → controlador (un archivo por módulo)
│       ├── controllers/     Leen la solicitud, validan el formato y responden
│       ├── services/        Reglas del juego (el servidor decide el resultado)
│       └── models/          Consultas SQL parametrizadas
├── docs/                    Informes y evidencias por avance
│   └── avance3/             API.md (endpoints y reglas) y pruebas.md (registro de pruebas)
└── QUIEN-SUBE-QUE.md        Responsable de cada archivo
```

Cada archivo empieza con el encabezado **ESTA PARTE LA TIENE QUE INTEGRAR**, que indica responsable, tarea, rama y commit.

## Back-End (Avance 3)

API REST propia con persistencia real en PostgreSQL (Supabase). Las reglas del juego (exploración, combate, captura, equipo, inventario, tienda, santuario, movimiento e historial) se calculan en el servidor: el navegador solo envía la acción y el servidor decide el resultado. El Front-End no cambia en este avance; en el Avance 4 sus servicios pasarán a llamar a esta API con `fetch()`.

Requiere Node.js 20 y el archivo `backend/.env` (se crea copiando `backend/.env.example`; la cadena de conexión de la base se recibe por mensaje privado y **nunca** se sube a GitHub).

```bash
cd backend
npm install
cp .env.example .env        # en Windows: copy .env.example .env  (luego pegar DATABASE_URL)
npm run db:preparar         # crea las 17 tablas y carga el catálogo y los usuarios de prueba
npm run dev                 # http://localhost:3000/api/salud
```

Otros comandos: `npm run lint` (revisión de código) y `npm start` (sin recarga automática).

Cada solicitud recorre siempre el mismo camino: `Ruta → Middleware → Controlador → Servicio → Modelo → PostgreSQL`.

- Endpoints, códigos de respuesta, reglas y modelo de datos: [`docs/avance3/API.md`](docs/avance3/API.md).
- Registro de pruebas y evidencia: [`docs/avance3/pruebas.md`](docs/avance3/pruebas.md).
- Pruebas manuales con la extensión REST Client de VS Code: archivos `backend/pruebas/*.http` (el recorrido completo está en `flujo-completo.http`).
- Usuarios de prueba (se identifican con el encabezado `X-Usuario-Id`): `demo@daemon504.hn` (`00000000-0000-4000-8000-000000000001`, con partida) y `nuevo@daemon504.hn` (`00000000-0000-4000-8000-000000000002`, sin personaje).

### Módulos del Back-End por integrante

| Turno | Integrante | Módulos |
|---|---|---|
| 1 | Genesis Yuliana Medina Ramos | Servidor Express, base de datos en Supabase y catálogo, identificación del jugador e historial |
| 2 | Jatniel Isai Oliva Padilla | Equipo, personaje e inventario |
| 3 | Dinora Roxana Padilla Ortiz | Mundo y movimiento, exploración |
| 4 | Luis Felipe Ortiz López | Motor de combate y endpoints de combate |
| 5 | Jenifer Michel Padilla Lara | Captura y documentación de la API |
| 6 | Heysser Javier Machado Mejía | Tienda y santuario, prueba completa de la API y cierre del Avance 3 |

## Ramas

- `main`: versión entregada (una etiqueta por avance: `v0.1-avance1`, `v0.2-avance2`…).
- `develop`: integración del equipo.
- `feature/…`, `fix/…`, `docs/…`, `test/…`, `chore/…`: una rama por tarea; al terminar se une a `develop` con `git merge --no-ff`.

Commits en español con el formato `tipo(módulo): descripción`, por ejemplo `feat(combate): motor de combate por turnos`.

## Mejoras previstas al final del período

- **API Manager (+2):** publicar la API detrás de Kong (plan gratuito) con límite de peticiones y clave por cliente.
- **Estilo RPG (+3):** aplicar NES.css. Como todos los colores salen de `src/css/global.css`, el cambio se concentra ahí y en las clases de botones y tarjetas.
