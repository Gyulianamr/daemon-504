/* ═══════════════════════════════════════════════════════════════════
 * ESTA PARTE LA INTEGRA: Jenifer Padilla
 * Tarea A2-05 · Rama: feature/a2-mundo · Fecha límite: viernes 13 de noviembre
 * Commit: "feat(mundo): lista de destinos conectados"
 * ═══════════════════════════════════════════════════════════════════ */

import Boton from './Boton.jsx';
import '../css/layout.css';

export default function Destinos({ destinos, alMover, ocupado = false }) {
  return (
    <ul className="destinos">
      {destinos.map((destino) => (
        <li
          key={destino.id}
          className={destino.bloqueada ? 'destinos__item destinos__item--bloqueado' : 'destinos__item'}
        >
          <div>
            <p className="destinos__nombre">{destino.nombre}</p>
            <p className="texto-suave">
              Niveles {destino.nivelMin}–{destino.nivelMax}
            </p>
            {destino.bloqueada && <p className="destinos__requisito">Requiere: {destino.requisito}</p>}
          </div>
          <Boton
            variante="secundario"
            pequeno
            disabled={destino.bloqueada || ocupado}
            onClick={() => alMover(destino.id)}
          >
            {destino.bloqueada ? 'Bloqueado' : 'Ir'}
          </Boton>
        </li>
      ))}
    </ul>
  );
}
