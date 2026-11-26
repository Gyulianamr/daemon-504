import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { crearPersonaje, INICIALES } from '../js/servicios/personaje.js';
import { cargarDatos, buscarCriatura } from '../js/datos.js';
import { useSesion } from '../js/sesion/SesionContext.jsx';
import Boton from '../components/Boton.jsx';
import Mensaje from '../components/Mensaje.jsx';
import '../css/crear-personaje.css';

// Nombre del jugador + elección de una de las tres criaturas iniciales.
export default function CrearPersonaje() {
  const navegar = useNavigate();
  const { refrescar } = useSesion();
  const [iniciales, setIniciales] = useState([]);
  const [nombre, setNombre] = useState('');
  const [elegida, setElegida] = useState(null);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    cargarDatos()
      .then((datos) => setIniciales(INICIALES.map((id) => buscarCriatura(datos, id))))
      .catch(() => setError('No se pudieron cargar las criaturas iniciales.'));
  }, []);

  async function confirmar() {
    setError('');
    if (nombre.trim().length < 3) return setError('El nombre debe tener al menos 3 caracteres.');
    if (!elegida) return setError('Elige tu criatura inicial.');
    setEnviando(true);
    try {
      await crearPersonaje(nombre, elegida);
      await refrescar();
      navegar('/exploracion');
    } catch (err) {
      setError(err.message);
      setEnviando(false);
    }
  }

  return (
    <main className="crear">
      <div>
        <h1>Crea tu jugador</h1>
        <p className="texto-suave">Los sellos del Umbral se debilitan. Elige un nombre y tu primera criatura.</p>
      </div>
      <div className="campo crear__nombre">
        <label htmlFor="nombre">Nombre del jugador</label>
        <input id="nombre" maxLength={20} value={nombre} onChange={(e) => setNombre(e.target.value)} />
      </div>
      <div className="rejilla rejilla--3">
        {iniciales.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`crear__opcion${elegida === c.id ? ' elegida' : ''}`}
            onClick={() => setElegida(c.id)}
            aria-pressed={elegida === c.id}
          >
            <span className="crear__simbolo">{c.tipo.toUpperCase()}</span>
            <strong className="crear__opcion-nombre">{c.nombre}</strong>
            <span className="crear__opcion-tipo">{c.tipo} · {c.rol}</span>
            <span className="texto-suave">{c.descripcion}</span>
            <span className="crear__stats">HP {c.base.hp} · ATQ {c.base.ataque} · DEF {c.base.defensa}</span>
            <span className="crear__marca">{elegida === c.id ? 'Elegida' : 'Elegir'}</span>
          </button>
        ))}
      </div>
      <Mensaje tipo="error">{error}</Mensaje>
      <div className="crear__pie">
        <Boton onClick={confirmar} cargando={enviando}>Comenzar aventura</Boton>
      </div>
    </main>
  );
}
