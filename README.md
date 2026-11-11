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
├── backend/                 API REST (Avance 3)
├── docs/                    Informes y evidencias por avance
└── QUIEN-SUBE-QUE.md        Responsable de cada archivo
```

Cada archivo empieza con el encabezado **ESTA PARTE LA TIENE QUE INTEGRAR**, que indica responsable, tarea, rama y commit.

## Ramas

- `main`: versión entregada (una etiqueta por avance: `v0.1-avance1`, `v0.2-avance2`…).
- `develop`: integración del equipo.
- `feature/…`, `fix/…`, `docs/…`, `test/…`, `chore/…`: una rama por tarea; al terminar se une a `develop` con `git merge --no-ff`.

Commits en español con el formato `tipo(módulo): descripción`, por ejemplo `feat(combate): motor de combate por turnos`.

## Mejoras previstas al final del período

- **API Manager (+2):** publicar la API detrás de Kong (plan gratuito) con límite de peticiones y clave por cliente.
- **Estilo RPG (+3):** aplicar NES.css. Como todos los colores salen de `src/css/global.css`, el cambio se concentra ahí y en las clases de botones y tarjetas.
