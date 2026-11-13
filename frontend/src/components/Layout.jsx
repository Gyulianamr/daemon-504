/* ═══════════════════════════════════════════════════════════════════
 * ESTA PARTE LA INTEGRA: Jenifer Padilla
 * Tarea A2-05 · Rama: feature/a2-mundo · Fecha límite: viernes 13 de noviembre
 * Commit: "feat(layout): estructura común de las pantallas internas"
 * ═══════════════════════════════════════════════════════════════════ */

import { Outlet } from 'react-router-dom';
import BarraSuperior from './BarraSuperior.jsx';
import Menu from './Menu.jsx';
import '../css/layout.css';

export default function Layout() {
  return (
    <div className="layout">
      <BarraSuperior />
      <Menu />
      <main className="layout__contenido">
        <Outlet />
      </main>
      <footer className="layout__pie">
        <p className="texto-suave">DAEMON 504 · Guardianes del Umbral</p>
      </footer>
    </div>
  );
}
