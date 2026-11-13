/* ═══════════════════════════════════════════════════════════════════
 * ESTA PARTE LA INTEGRA: Jenifer Padilla
 * Tarea A2-05 · Rama: feature/a2-mundo · Fecha límite: viernes 13 de noviembre
 * Commit: "feat(layout): menú de navegación entre pantallas"
 * ═══════════════════════════════════════════════════════════════════ */

import { NavLink } from 'react-router-dom';

const ENLACES = [
  { ruta: '/exploracion', texto: 'Explorar' },
  { ruta: '/equipo', texto: 'Equipo' },
  { ruta: '/inventario', texto: 'Inventario' },
  { ruta: '/tienda', texto: 'Tienda' },
  { ruta: '/historial', texto: 'Historial' },
];

const claseEnlace = ({ isActive }) => (isActive ? 'menu__enlace menu__enlace--activo' : 'menu__enlace');

export default function Menu() {
  return (
    <nav className="menu" aria-label="Navegación principal">
      <ul className="menu__lista">
        {ENLACES.map((enlace) => (
          <li key={enlace.ruta} className="menu__item">
            <NavLink to={enlace.ruta} className={claseEnlace}>
              {enlace.texto}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
