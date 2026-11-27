/* ═══════════════════════════════════════════════════════════════════
 * ESTA PARTE LA TIENE QUE INTEGRAR: Jenifer Padilla
 * Tarea A4-03 · Rama: feature/a4-mundo · Fecha límite: jueves 26 de noviembre
 * Commit: "feat(mundo): panel Camino y tarjeta Siguiente objetivo"
 * ═══════════════════════════════════════════════════════════════════ */

import Tarjeta from './Tarjeta.jsx';
import '../css/camino.css';

export default function SiguienteObjetivo({ siguiente }) {
  if (!siguiente) {
    return (
      <Tarjeta titulo="Siguiente objetivo" destacada>
        <p>Has conseguido todos los sellos</p>
      </Tarjeta>
    );
  }

  return (
    <Tarjeta titulo="Siguiente objetivo" subtitulo={`Siguiente zona: ${siguiente.zona.nombre}`} destacada>
      <p>{siguiente.accion}</p>
      <p className="texto-suave">Te falta: {siguiente.selloFaltante}</p>
    </Tarjeta>
  );
}