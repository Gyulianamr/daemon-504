/* ═══════════════════════════════════════════════════════════════════
 * ESQUELETO (lo sube Genesis Medina en la tarea A2-01)
 * Lo reemplaza: Jenifer Padilla en la tarea A2-05
 * ═══════════════════════════════════════════════════════════════════ */
import { Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <main>
      <Outlet />
    </main>
  );
}
