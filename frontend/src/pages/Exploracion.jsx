import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { obtenerZonaActual, moverA } from '../js/servicios/mundo.js';
import { desafiarGuardian } from '../js/servicios/combate.js';
import { useCargar } from '../js/utils/useCargar.js';
import { useSesion } from '../js/sesion/SesionContext.jsx';
import Boton from '../components/Boton.jsx';
import Cargando from '../components/Cargando.jsx';
import Destinos from '../components/Destinos.jsx';
import Mensaje from '../components/Mensaje.jsx';
import PanelExploracion from '../components/PanelExploracion.jsx';
import Tarjeta from '../components/Tarjeta.jsx';
import '../css/exploracion.css';

export default function Exploracion() {
  const navegar = useNavigate();
  const { refrescar } = useSesion();
  const { datos, cargando, error, recargar } = useCargar(obtenerZonaActual);
  const [ocupado, setOcupado] = useState(false);
  const [aviso, setAviso] = useState('');

  
  if (cargando && !datos) return <Cargando />;
  if (error && !datos) return <Mensaje tipo="error">{error.message}</Mensaje>;

  const { zona, destinos, combatePendiente } = datos;
  const bloqueado = ocupado || combatePendiente;

  
  async function actualizar() {
    await recargar();
    await refrescar();
  }

  async function ejecutar(accion) {
    setOcupado(true);
    setAviso('');
    try {
      await accion();
    } catch (err) {
      setAviso(err.message);
    } finally {
      setOcupado(false);
    }
  }

  const viajar = (destinoId) =>
    ejecutar(async () => {
      await moverA(destinoId);
      await actualizar();
    });

  const desafiar = () =>
    ejecutar(async () => {
      await desafiarGuardian();
      await refrescar();
      navegar('/combate');
    });

  const alExplorar = () => {
    setAviso('');
    actualizar().catch((err) => setAviso(err.message));
  };

  const guardian = zona.guardian;

  return (
    <div className="pila">
      <div className="encabezado-pagina">
        <h1>Exploración</h1>
        <span className="texto-suave">{zona.nombre}</span>
      </div>

      <Mensaje tipo="error">{aviso || (error && error.message)}</Mensaje>

      {combatePendiente && (
        <Mensaje tipo="aviso">
          <div className="fila">
            <span>Tienes un combate pendiente. Termínalo antes de explorar o viajar.</span>
            <Boton variante="principal" pequeno onClick={() => navegar('/combate')}>
              Ir al combate
            </Boton>
          </div>
        </Mensaje>
      )}

      <div className="exploracion">
        <div className="exploracion__principal">
          <Tarjeta titulo={zona.nombre} subtitulo={`Niveles ${zona.nivelMin}–${zona.nivelMax}`}>
            <div className="pila">
              <p>{zona.descripcion}</p>
              {zona.tieneTienda && (
                <div className="fila">
                  <Boton variante="secundario" onClick={() => navegar('/tienda')}>
                    Ir a la tienda
                  </Boton>
                </div>
              )}
            </div>
          </Tarjeta>

          <PanelExploracion
            deshabilitado={bloqueado}
            alExplorar={alExplorar}
            alError={(err) => setAviso(err.message)}
          />
        </div>

        <div className="exploracion__lateral">
          {guardian && (
            <Tarjeta
              titulo="Guardián"
              subtitulo={`${guardian.nombre} · nivel ${guardian.nivel}`}
              destacada={!guardian.derrotado}
            >
              <div className="pila">
                <p className="texto-suave">Sello: {guardian.sello}</p>
                {guardian.derrotado ? (
                  <p className="exploracion__vencido">Vencido</p>
                ) : (
                  <Boton variante="principal" ancho disabled={bloqueado} onClick={desafiar}>
                    Desafiar
                  </Boton>
                )}
              </div>
            </Tarjeta>
          )}

          <Tarjeta titulo="Destinos">
            <Destinos destinos={destinos} alMover={viajar} ocupado={bloqueado} />
          </Tarjeta>
        </div>
      </div>
    </div>
  );
}
