/* ═══════════════════════════════════════════════════════════════════
 * ESTA PARTE LA TIENE QUE INTEGRAR: Genesis Medina
 * Tarea A2-01 · Rama: feature/a2-base · Fecha límite: miércoles 11 de noviembre
 * Commit: "feat(base): rutas de la aplicación con páginas en construcción"
 * ═══════════════════════════════════════════════════════════════════ */
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import RutaProtegida from './components/RutaProtegida.jsx';
import Acceso from './pages/Acceso.jsx';
import CrearPersonaje from './pages/CrearPersonaje.jsx';
import Exploracion from './pages/Exploracion.jsx';
import Combate from './pages/Combate.jsx';
import Equipo from './pages/Equipo.jsx';
import Inventario from './pages/Inventario.jsx';
import Tienda from './pages/Tienda.jsx';
import Historial from './pages/Historial.jsx';
import NoEncontrada from './pages/NoEncontrada.jsx';

// Mapa de pantallas del juego. Las pantallas internas exigen sesión y personaje (RutaProtegida)
// y comparten la barra superior y el menú (Layout).
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Acceso />} />
      <Route path="/crear-personaje" element={<RutaProtegida requierePersonaje={false}><CrearPersonaje /></RutaProtegida>} />
      <Route element={<RutaProtegida><Layout /></RutaProtegida>}>
        <Route path="/exploracion" element={<Exploracion />} />
        <Route path="/combate" element={<Combate />} />
        <Route path="/equipo" element={<Equipo />} />
        <Route path="/inventario" element={<Inventario />} />
        <Route path="/tienda" element={<Tienda />} />
        <Route path="/historial" element={<Historial />} />
      </Route>
      <Route path="*" element={<NoEncontrada />} />
    </Routes>
  );
}
