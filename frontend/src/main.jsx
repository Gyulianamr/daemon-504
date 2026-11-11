/* ═══════════════════════════════════════════════════════════════════
 * ESTA PARTE LA TIENE QUE INTEGRAR: Genesis Medina
 * Tarea A2-01 · Rama: feature/a2-base · Fecha límite: miércoles 11 de noviembre
 * Commit: "feat(base): rutas de la aplicación con páginas en construcción"
 * ═══════════════════════════════════════════════════════════════════ */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { SesionProvider } from './js/sesion/SesionContext.jsx';
import App from './App.jsx';
import './css/global.css';
import './css/componentes.css';

// Punto de entrada: activa las rutas (BrowserRouter) y comparte la sesión con todas las páginas.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <SesionProvider>
        <App />
      </SesionProvider>
    </BrowserRouter>
  </StrictMode>,
);
