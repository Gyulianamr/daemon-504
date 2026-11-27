import Boton from './Boton.jsx';
import '../css/layout.css';

// La API no envía "bloqueada": una zona está bloqueada cuando trae requisito (el sello que falta).
// zonas (opcional) = progreso.zonas de GET /api/progreso: de ahí salen el guardián y la zona del sello.
export default function Destinos({ destinos, zonas = [], alMover, ocupado = false }) {
  return (
    <ul className="destinos">
      {destinos.map((destino) => {
        const bloqueada = destino.requisito !== null;
        const guardian = zonas.find((zona) => zona.id === destino.id)?.guardian;
        return (
          <li
            key={destino.id}
            className={bloqueada ? 'destinos__item destinos__item--bloqueado' : 'destinos__item'}
          >
            <div>
              <p className="destinos__nombre">{destino.nombre}</p>
              <p className="texto-suave">
                Niveles {destino.nivelMin}–{destino.nivelMax}
              </p>
              {bloqueada && <p className="destinos__requisito">Te falta: {destino.requisito}</p>}
              {bloqueada && guardian && (
                <p className="texto-suave">
                  Lo entrega {guardian.nombre} (nivel {guardian.nivel}) en {guardian.zonaNombre}
                </p>
              )}
            </div>
            <Boton
              variante="secundario"
              pequeno
              disabled={bloqueada || ocupado}
              onClick={() => alMover(destino.id)}
            >
              {bloqueada ? 'Bloqueado' : 'Ir'}
            </Boton>
          </li>
        );
      })}
    </ul>
  );
}