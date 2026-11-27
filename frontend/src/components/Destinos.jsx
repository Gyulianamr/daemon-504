import Boton from './Boton.jsx';
import '../css/layout.css';
import '../css/camino.css';

export default function Destinos({ destinos, zonas = [], alMover, ocupado = false }) {
  return (
    <ul className="destinos">
      {destinos.map((destino) => {
        const guardian = zonas.find((zona) => zona.id === destino.id)?.guardian;
        return (
          <li
            key={destino.id}
            className={destino.bloqueada ? 'destinos__item destinos__item--bloqueado' : 'destinos__item'}
          >
            <div>
              <p className="destinos__nombre">{destino.nombre}</p>
              <p className="texto-suave">
                Niveles {destino.nivelMin}–{destino.nivelMax}
              </p>
              {destino.requisito && (
                <p
                  className={
                    destino.bloqueada
                      ? 'destinos__requisito'
                      : 'destinos__requisito destinos__requisito--tienes'
                  }
                >
                  Requiere: {destino.requisito} · {destino.bloqueada ? 'Te falta' : 'Tienes'}
                </p>
              )}
              {destino.bloqueada && guardian && (
                <p className="texto-suave">
                  Lo entrega {guardian.nombre} (nivel {guardian.nivel}) en {guardian.zonaNombre}
                </p>
              )}
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
        );
      })}
    </ul>
  );
}