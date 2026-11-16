// Panel con el boton Explorar, el resultado y los ultimos resultados.

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { explorar } from '../js/servicios/exploracion.js';
import Boton from './Boton.jsx';
import Tarjeta from './Tarjeta.jsx';
import '../css/panel-exploracion.css';

const MAXIMO_HISTORIAL = 10;

export default function PanelExploracion({ deshabilitado, alExplorar, alError }) {
  const navegar = useNavigate();
  const [resultado, setResultado] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [cargando, setCargando] = useState(false);

  async function alPulsarExplorar() {
    setCargando(true);
    try {
      const nuevo = await explorar();
      setResultado(nuevo);
      setHistorial([nuevo.texto, ...historial].slice(0, MAXIMO_HISTORIAL));
      alExplorar(nuevo);
    } catch (err) {
      alError(err);
    } finally {
      setCargando(false);
    }
  }

  return (
    <Tarjeta titulo="Explorar">
      <div className="pila">
        <Boton
          variante="principal"
          ancho
          cargando={cargando}
          disabled={deshabilitado}
          onClick={alPulsarExplorar}
        >
          Explorar
        </Boton>

        {resultado && (
          <div className={`panel-exploracion__resultado panel-exploracion__resultado--${resultado.tipo}`}>
            <p className="panel-exploracion__texto">{resultado.texto}</p>
            {resultado.tipo === 'criatura' && (
              <Boton variante="secundario" pequeno onClick={() => navegar('/combate')}>
                Ir al combate
              </Boton>
            )}
          </div>
        )}

        <h3 className="panel-exploracion__titulo">Últimos resultados</h3>
        <ul className="panel-exploracion__historial">
          {historial.length === 0 && (
            <li className="panel-exploracion__item texto-suave">Todavía no has explorado.</li>
          )}
          {historial.map((texto, indice) => (
            <li key={indice} className="panel-exploracion__item">{texto}</li>
          ))}
        </ul>
      </div>
    </Tarjeta>
  );
}