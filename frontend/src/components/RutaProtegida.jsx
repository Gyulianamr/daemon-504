import { Navigate } from 'react-router-dom';
import Cargando from './Cargando.jsx';
import { useSesion } from '../js/sesion/SesionContext.jsx';

export default function RutaProtegida({ requierePersonaje = true, children }) {
  const { usuario, personaje, cargando } = useSesion();

  if (cargando) {
    return <Cargando pantalla />;
  }

  if (!usuario) {
    return <Navigate to="/" replace />;
  }

  if (requierePersonaje && !personaje) {
    return <Navigate to="/crear-personaje" replace />;
  }

  return children;
}
