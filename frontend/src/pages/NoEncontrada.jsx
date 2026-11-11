/* ═══════════════════════════════════════════════════════════════════
 * ESTA PARTE LA TIENE QUE INTEGRAR: Genesis Medina
 * Tarea A2-01 · Rama: feature/a2-base · Fecha límite: miércoles 11 de noviembre
 * Commit: "feat(base): rutas de la aplicación con páginas en construcción"
 * ═══════════════════════════════════════════════════════════════════ */
import { Link } from 'react-router-dom';

// Se muestra cuando la ruta no existe.
export default function NoEncontrada() {
  return (
    <main className="contenedor-centrado">
      <section className="tarjeta">
        <h2 className="tarjeta__titulo">Página no encontrada</h2>
        <p>Esta ruta no existe en el mundo de DAEMON 504.</p>
        <Link to="/" className="boton boton--principal">Volver al inicio</Link>
      </section>
    </main>
  );
}
