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
