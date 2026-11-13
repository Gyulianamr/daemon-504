/* ═══════════════════════════════════════════════════════════════════
 * ESQUELETO (lo sube Genesis Medina en la tarea A2-01)
 * Lo reemplaza: Jenifer Padilla en la tarea A2-12
 * ═══════════════════════════════════════════════════════════════════ */
import Boton from '../components/Boton.jsx';
import { useSesion } from '../js/sesion/SesionContext.jsx';

export default function Exploracion() {
  const { cerrarSesion } = useSesion();

  return (
    <>
      <p>En construcción: exploración</p>
      <Boton onClick={cerrarSesion}>Cerrar sesión</Boton>
    </>
  );
}
