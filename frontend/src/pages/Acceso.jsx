import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Mensaje from '../components/Mensaje.jsx';
import { useSesion } from '../js/sesion/SesionContext.jsx';
import '../css/acceso.css';

export default function Acceso() {
  const { usuario, personaje, cargando, iniciarSesion, registrarse } = useSesion();
  const navegar = useNavigate();
  const [pestana, setPestana] = useState('iniciar');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [errorCuenta, setErrorCuenta] = useState('');
  const [cuentaPrueba, setCuentaPrueba] = useState(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    let activa = true;

    async function cargarCuentaPrueba() {
      try {
        const respuesta = await fetch('/data/partida-demo.json');
        if (!respuesta.ok) {
          throw new Error('No se pudo cargar la cuenta de prueba.');
        }

        const datos = await respuesta.json();
        if (activa) {
          setCuentaPrueba(datos.usuario);
        }
      } catch (errorCarga) {
        if (activa) {
          setErrorCuenta(errorCarga.message);
        }
      }
    }

    cargarCuentaPrueba();
    return () => {
      activa = false;
    };
  }, []);

  useEffect(() => {
    if (!cargando && usuario) {
      navegar(personaje ? '/exploracion' : '/crear-personaje', { replace: true });
    }
  }, [cargando, navegar, personaje, usuario]);

  function alCambiarPestana(nuevaPestana) {
    setPestana(nuevaPestana);
    setError('');
  }

  async function alEnviar(evento) {
    evento.preventDefault();
    setError('');

    if (!correo.includes('@') || contrasena.length < 8) {
      setError('Introduce un correo válido y una contraseña de al menos 8 caracteres.');
      return;
    }

    setEnviando(true);
    try {
      if (pestana === 'iniciar') {
        await iniciarSesion(correo, contrasena);
      } else {
        await registrarse(correo, contrasena);
      }
    } catch (errorServicio) {
      setError(errorServicio.message);
    } finally {
      setEnviando(false);
    }
  }

  if (cargando || usuario) {
    return null;
  }

  return (
    <main className="contenedor-centrado">
      <section className="acceso tarjeta">
        <h1>Daemon 504</h1>
        <div className="acceso__pestanas" role="tablist" aria-label="Acceso">
          <button
            type="button"
            className={`acceso__pestana ${pestana === 'iniciar' ? 'acceso__pestana--activa' : ''}`}
            role="tab"
            aria-selected={pestana === 'iniciar'}
            onClick={() => alCambiarPestana('iniciar')}
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            className={`acceso__pestana ${pestana === 'registrar' ? 'acceso__pestana--activa' : ''}`}
            role="tab"
            aria-selected={pestana === 'registrar'}
            onClick={() => alCambiarPestana('registrar')}
          >
            Registrarse
          </button>
        </div>

        {error && <Mensaje tipo="error">{error}</Mensaje>}
        <form className="acceso__formulario" onSubmit={alEnviar}>
          <div className="campo">
            <label htmlFor="correo">Correo</label>
            <input
              id="correo"
              type="text"
              inputMode="email"
              autoComplete="email"
              value={correo}
              onChange={(evento) => setCorreo(evento.target.value)}
              aria-invalid={Boolean(error) && !correo.includes('@')}
            />
          </div>
          <div className="campo">
            <label htmlFor="contrasena">Contraseña</label>
            <input
              id="contrasena"
              type="password"
              autoComplete={pestana === 'iniciar' ? 'current-password' : 'new-password'}
              value={contrasena}
              onChange={(evento) => setContrasena(evento.target.value)}
              aria-invalid={Boolean(error) && contrasena.length < 8}
            />
          </div>
          <button className="boton boton--principal boton--ancho" type="submit" disabled={enviando}>
            {enviando ? 'Enviando…' : pestana === 'iniciar' ? 'Iniciar sesión' : 'Crear cuenta'}
          </button>
        </form>

        <aside className="acceso__cuenta">
          <h2>Cuenta de prueba</h2>
          {errorCuenta && <Mensaje tipo="error">{errorCuenta}</Mensaje>}
          {cuentaPrueba ? (
            <p>
              Correo: <strong>{cuentaPrueba.correo}</strong>
              <br />
              Contraseña: <strong>{cuentaPrueba.contrasena}</strong>
            </p>
          ) : !errorCuenta ? (
            <p className="texto-suave">Cargando cuenta de prueba…</p>
          ) : null}
        </aside>
      </section>
    </main>
  );
}
