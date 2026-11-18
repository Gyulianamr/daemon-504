import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import Mensaje from '../../components/Mensaje.jsx';
import {
  cerrarSesion as cerrarSesionServicio,
  iniciarSesion as iniciarSesionServicio,
  obtenerSesion,
  registrarse as registrarseServicio,
} from '../servicios/auth.js';

const SesionContext = createContext(null);

export function SesionProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [personaje, setPersonaje] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState('');

  const actualizarSesion = useCallback((sesion) => {
    setUsuario(sesion.usuario);
    setPersonaje(sesion.personaje);
  }, []);

  const refrescar = useCallback(async () => {
    const sesion = await obtenerSesion();
    actualizarSesion(sesion);
    setErrorCarga('');
    return sesion;
  }, [actualizarSesion]);

  const iniciarSesion = useCallback(async (correo, contrasena) => {
    const sesion = await iniciarSesionServicio(correo, contrasena);
    actualizarSesion(sesion);
    return sesion;
  }, [actualizarSesion]);

  const registrarse = useCallback(async (correo, contrasena) => {
    const sesion = await registrarseServicio(correo, contrasena);
    actualizarSesion(sesion);
    return sesion;
  }, [actualizarSesion]);

  const cerrarSesion = useCallback(async () => {
    await cerrarSesionServicio();
    setUsuario(null);
    setPersonaje(null);
  }, []);

  useEffect(() => {
    let activo = true;

    refrescar()
      .catch((error) => {
        if (activo) {
          setErrorCarga(error.message);
        }
      })
      .finally(() => {
        if (activo) {
          setCargando(false);
        }
      });

    return () => {
      activo = false;
    };
  }, [refrescar]);

  const valor = {
    usuario,
    personaje,
    cargando,
    iniciarSesion,
    registrarse,
    cerrarSesion,
    refrescar,
  };

  return (
    <SesionContext.Provider value={valor}>
      {errorCarga && <Mensaje tipo="error">{errorCarga}</Mensaje>}
      {children}
    </SesionContext.Provider>
  );
}

export const useSesion = () => useContext(SesionContext);
