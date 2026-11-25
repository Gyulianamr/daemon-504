<!-- ESTA PARTE LA TIENE QUE INTEGRAR: Genesis Medina · Tarea A4-01 · Rama: feature/a4-base · Commit: "test(auth): pruebas de acceso y del encabezado Bearer" -->
# backend/

API REST de DAEMON 504: **Node.js 20+ · Express 5 · PostgreSQL (Supabase)**.

## Cómo ejecutarla

```bash
cd backend
npm install
cp .env.example .env        # en Windows: copy .env.example .env
npm run db:preparar         # crea las tablas y carga los datos (¡borra lo que haya!)
npm run dev                 # http://localhost:3000/api/salud
```

## Acceso y sesión (autenticación propia)

| Endpoint | Qué hace |
|---|---|
| `POST /api/acceso/registro` | Crea la cuenta (contraseña cifrada con scrypt) y devuelve `{ usuario, token }` |
| `POST /api/acceso/iniciar-sesion` | Devuelve `{ usuario, token }` |
| `GET /api/acceso/sesion` | Con token: devuelve `{ usuario }` |
| `POST /api/acceso/cerrar-sesion` | Borra la sesión del servidor (204) |

Todas las demás rutas del jugador exigen `Authorization: Bearer <token>`. El token vence a los 7 días.
El encabezado `X-Usuario-Id` ya no se acepta.

## Usuarios de prueba

`npm run db:preparar` crea dos cuentas:

| Correo | Contraseña | Estado |
|---|---|---|
| demo@daemon504.hn | demo1234 | Con partida |
| nuevo@daemon504.hn | nuevo1234 | Sin personaje |

En los archivos `pruebas/*.http` se inicia sesión primero y se usa `Authorization: Bearer {{token}}` (ver `pruebas/acceso.http`).
