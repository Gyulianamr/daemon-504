/* ═══════════════════════════════════════════════════════════════════
 * ESTA PARTE LA TIENE QUE INTEGRAR: Genesis Medina
 * Tarea A2-08 · Rama: feature/a2-personaje · Fecha límite: sábado 14 de noviembre
 * Commit: "feat(historial): pantalla de historial con filtro y páginas"
 * ═══════════════════════════════════════════════════════════════════ */
import { useEffect, useState } from 'react';
import { listarHistorial, TIPOS } from '../js/servicios/historial.js';
import Boton from '../components/Boton.jsx';
import Mensaje from '../components/Mensaje.jsx';
import Cargando from '../components/Cargando.jsx';
import '../css/historial.css';

const fecha = (iso) => new Date(iso).toLocaleString('es-HN', { dateStyle: 'short', timeStyle: 'short' });

// Eventos de la partida, del más reciente al más antiguo, con filtro por tipo y 10 por página.
export default function Historial() {
  const [tipo, setTipo] = useState('');
  const [pagina, setPagina] = useState(1);
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    listarHistorial({ tipo, pagina }).then(setDatos).catch(setError);
  }, [tipo, pagina]);

  function cambiarTipo(nuevoTipo) {
    setTipo(nuevoTipo);
    setPagina(1); // al filtrar se vuelve a la primera página
  }

  if (error) return <Mensaje tipo="error">{error.message}</Mensaje>;
  if (!datos) return <Cargando />;

  return (
    <div className="pila">
      <div className="encabezado-pagina">
        <h1>Historial</h1>
        <div className="campo historial__filtro">
          <label htmlFor="tipo">Filtrar por tipo</label>
          <select id="tipo" value={tipo} onChange={(e) => cambiarTipo(e.target.value)}>
            <option value="">Todos</option>
            {TIPOS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>
      {datos.eventos.length === 0 && <p className="texto-suave">No hay eventos registrados.</p>}
      <ul className="historial__lista">
        {datos.eventos.map((e) => (
          <li key={e.id} className="historial__evento">
            <span className="historial__tipo">{e.tipo}</span>
            <span className="texto-suave">{fecha(e.fecha)}</span>
            <span>{e.texto}</span>
          </li>
        ))}
      </ul>
      <div className="historial__paginacion">
        <Boton pequeno variante="secundario" disabled={pagina === 1} onClick={() => setPagina(pagina - 1)}>
          Anterior
        </Boton>
        <span className="texto-suave">Página {datos.pagina} de {datos.totalPaginas}</span>
        <Boton pequeno variante="secundario" disabled={pagina >= datos.totalPaginas} onClick={() => setPagina(pagina + 1)}>
          Siguiente
        </Boton>
      </div>
    </div>
  );
}
