/* ═══════════════════════════════════════════════════════════════════
 * ESTA PARTE LA TIENE QUE INTEGRAR: Jenifer Padilla
 * Tarea A4-03 · Rama: feature/a4-mundo · Fecha límite: jueves 26 de noviembre
 * Commit: "feat(mundo): panel Camino y tarjeta Siguiente objetivo"
 * ═══════════════════════════════════════════════════════════════════ */

import Tarjeta from './Tarjeta.jsx';
import '../css/camino.css';

const ETIQUETA = { actual: 'Estás aquí', desbloqueada: 'Desbloqueada', bloqueada: 'Bloqueada' };

export default function PanelCamino({ progreso }) {
  const { sellos, zonaActual, zonas } = progreso;

  return (
    <Tarjeta
      titulo="Camino"
      subtitulo={`Estás en ${zonaActual.nombre} · Tienes ${sellos.obtenidos} de ${sellos.total} sellos`}
    >
      <ul className="camino">
        {zonas.map((zona) => (
          <li key={zona.id} className={`camino__item camino__item--${zona.estado}`}>
            <div className="camino__fila">
              <span className="camino__nombre">{zona.nombre}</span>
              <span className={`camino__estado camino__estado--${zona.estado}`}>{ETIQUETA[zona.estado]}</span>
            </div>
            {zona.bloqueada && (
              <p className="texto-suave">
                Necesitas el {zona.requisito}
                {zona.guardian &&
                  `: lo entrega el guardián ${zona.guardian.nombre} (nivel ${zona.guardian.nivel}) en ${zona.guardian.zonaNombre}`}
                . Desbloquea {zona.nombre}.
              </p>
            )}
          </li>
        ))}
      </ul>
    </Tarjeta>
  );
}