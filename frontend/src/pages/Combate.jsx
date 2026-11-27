import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import AccionesCaptura from '../components/AccionesCaptura.jsx';
import Boton from '../components/Boton.jsx';
import Cargando from '../components/Cargando.jsx';
import Mensaje from '../components/Mensaje.jsx';
import Tarjeta from '../components/Tarjeta.jsx';
import TarjetaCriatura from '../components/TarjetaCriatura.jsx';
import { useSesion } from '../js/sesion/SesionContext.jsx';
import { atacar, obtenerEncuentro, huir, usarCuraball } from '../js/servicios/combate.js';
import { capturar } from '../js/servicios/captura.js';
import '../css/combate.css';

const TEXTOS_FINAL = {
  victoria: '¡Victoria!',
  derrota: 'Derrota',
  captura: '¡Captura exitosa!',
  huida: 'Escapaste',
};

export default function Combate() {
  const { refrescar } = useSesion();
  const [encuentro, setEncuentro] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [final, setFinal] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);
  const envioRef = useRef(false);
  const montadoRef = useRef(false);
  const refrescoFinalRef = useRef(false);

  useEffect(() => {
    let activo = true;
    montadoRef.current = true;

    async function cargarEncuentro() {
      try {
        const resultado = await obtenerEncuentro();
        if (activo) setEncuentro(resultado);
      } catch (errorCarga) {
        if (!activo) return;
        if (errorCarga.status === 404) {
          setEncuentro(null);
        } else {
          setError(errorCarga.message);
        }
      } finally {
        if (activo) setCargando(false);
      }
    }

    cargarEncuentro();

    return () => {
      activo = false;
      montadoRef.current = false;
    };
  }, []);

  async function ejecutarAccion(accion, esferaId) {
    if (envioRef.current || !encuentro || final) return;

    envioRef.current = true;
    setEnviando(true);
    setError(null);

    try {
      let respuesta;
      switch (accion) {
        case 'atacar':
          respuesta = await atacar(encuentro.id, encuentro.turno);
          break;
        case 'curar':
          respuesta = await usarCuraball(encuentro.id,encuentro.turno);
          break;
        case 'huir':
          respuesta = await huir(encuentro.id,encuentro.turno);
          break;
        case 'capturar':
          respuesta = await capturar(encuentro.id,encuentro.turno, esferaId);
          break;
        default:
          throw new Error('Acción de combate no válida.');
      }

      if (!montadoRef.current) return;

      setMensajes((anteriores) => [...anteriores, ...respuesta.mensajes]);

      if (respuesta.final) {
        setEncuentro(null);
        setFinal(respuesta.final);
        if (!refrescoFinalRef.current) {
          refrescoFinalRef.current = true;
          try {
            await refrescar();
          } catch (errorRefresco) {
            if (montadoRef.current) setError(errorRefresco.message);
          }
        }
      } else {
        // El servicio devuelve el encuentro sin las vistas que usa la pantalla;
        // pedimos el encuentro completo para redibujar las tarjetas.
        const actualizado = await obtenerEncuentro();
        if (!montadoRef.current) return;
        setEncuentro(actualizado);
      }
    } catch (errorAccion) {
      if (!montadoRef.current) return;

      if (errorAccion.status === 404) {
        setEncuentro(null);
        setError(null);
      } else {
        setError(errorAccion.message);
        if (errorAccion.status === 409) {
          try {
            const actualizado = await obtenerEncuentro();
            if (montadoRef.current) setEncuentro(actualizado);
          } catch (errorSincronizacion) {
            if (!montadoRef.current) return;
            if (errorSincronizacion.status === 404) {
              setEncuentro(null);
              setError(null);
            } else {
              setError(errorSincronizacion.message);
            }
          }
        }
      }
    } finally {
      envioRef.current = false;
      if (montadoRef.current) setEnviando(false);
    }
  }

  function alAtacar() {
    ejecutarAccion('atacar');
  }

  function alUsarCuraball() {
    ejecutarAccion('curar');
  }

  function alHuir() {
    ejecutarAccion('huir');
  }

  function alCapturar(esferaId) {
    ejecutarAccion('capturar', esferaId);
  }

  function alCerrar() {
    setError(null);
  }

  if (cargando) return <Cargando pantalla />;

  if (!encuentro && !final) {
    if (error) {
      return (
        <div className="pila">
          <Mensaje tipo="error">{error}</Mensaje>
        </div>
      );
    }

    return (
      <div className="combate__sin-combate">
        <Tarjeta titulo="Sin combate">
          <p>No tienes un combate activo.</p>
          <Link className="boton boton--principal" to="/exploracion">
            Volver a explorar
          </Link>
        </Tarjeta>
      </div>
    );
  }

  const mensajesVisibles = mensajes.slice(-8);

  return (
    <div className="pila">
      <Mensaje tipo="error" alCerrar={alCerrar}>
        {error}
      </Mensaje>

      <div className="encabezado-pagina">
        <h1>Combate</h1>
        {encuentro && (
          <span className="texto-suave">Turno {encuentro.turno}</span>
        )}
      </div>

      {encuentro && (
        <>
          <div className="combate__rivales">
            <section className="combate__lado">
              <h2 className="combate__etiqueta">Rival</h2>
              <TarjetaCriatura criatura={encuentro.rival} />
            </section>
            <section className="combate__lado">
              <h2 className="combate__etiqueta">Criatura activa</h2>
              <TarjetaCriatura criatura={encuentro.activa} activa />
            </section>
          </div>

          {!final && (
            <>
              <div className="combate__recursos">
                <span>Curaballs disponibles</span>
                <strong>{encuentro.curaballs}</strong>
              </div>

              <div className="combate__acciones">
                <Boton
                  className="combate__accion"
                  ancho
                  disabled={enviando}
                  onClick={alAtacar}
                >
                  Atacar
                </Boton>
                <Boton
                  className="combate__accion"
                  variante="secundario"
                  ancho
                  disabled={enviando || encuentro.curaballs <= 0}
                  onClick={alUsarCuraball}
                >
                  Usar curaball
                </Boton>
                {!encuentro.esGuardian ? (
                  <Boton
                    className="combate__accion"
                    variante="secundario"
                    ancho
                    disabled={enviando}
                    onClick={alHuir}
                  >
                    Huir
                  </Boton>
                ) : (
                  <p className="combate__nota">
                    No puedes huir de un combate contra un guardián.
                  </p>
                )}
              </div>

              {!encuentro.esGuardian && (
                <section className="combate__captura">
                  <h2 className="combate__etiqueta">Capturar</h2>
                  <AccionesCaptura
                    esferas={encuentro.esferas}
                    alCapturar={alCapturar}
                    deshabilitado={enviando}
                  />
                </section>
              )}
            </>
          )}
        </>
      )}

      {mensajesVisibles.length > 0 && (
        <section className="combate__registro">
          <h2 className="combate__etiqueta">Registro del combate</h2>
          <ol className="combate__lista">
            {mensajesVisibles.map((mensaje, indice) => (
              <li
                className="combate__mensaje"
                key={mensajes.length - mensajesVisibles.length + indice}
              >
                {mensaje}
              </li>
            ))}
          </ol>
        </section>
      )}

      {final && (
        <section className={`combate__resultado combate__resultado--${final}`}>
          <h2>{TEXTOS_FINAL[final] || 'Combate finalizado'}</h2>
          <Link className="boton boton--principal" to="/exploracion">
            Volver a explorar
          </Link>
        </section>
      )}
    </div>
  );
}
