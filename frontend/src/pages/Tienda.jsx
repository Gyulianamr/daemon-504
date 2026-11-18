import { useState } from 'react';
import { obtenerTienda, comprar, curarEquipo } from '../js/servicios/tienda.js';
import { useSesion } from '../js/sesion/SesionContext.jsx';
import { useCargar } from '../js/utils/useCargar.js';
import Tarjeta from '../components/Tarjeta.jsx';
import Boton from '../components/Boton.jsx';
import Mensaje from '../components/Mensaje.jsx';
import Cargando from '../components/Cargando.jsx';
import '../css/tienda.css';

const CANTIDADES = [1, 2, 3, 5, 10];

// Tienda y santuario. Solo funcionan en localidades; en zonas salvajes se indica que hay que volver a una.
export default function Tienda() {
  const { refrescar } = useSesion();
  const { datos, cargando, error, recargar } = useCargar(obtenerTienda);
  const [cantidades, setCantidades] = useState({});
  const [aviso, setAviso] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const [curando, setCurando] = useState(false);

  // Ejecuta comprar o curar, muestra el resultado y actualiza la pantalla y la barra superior.
  async function ejecutar(accion, curar = false) {
    setOcupado(true);
    if (curar) setCurando(true);
    setAviso(null);
    try {
      setAviso({ tipo: 'exito', texto: await accion() });
      await Promise.all([recargar(), refrescar()]);
    } catch (err) {
      setAviso({ tipo: 'error', texto: err.message });
    } finally {
      setOcupado(false);
      setCurando(false);
    }
  }

  const cambiarCantidad = (objetoId, valor) => setCantidades({ ...cantidades, [objetoId]: Number(valor) });

  if (cargando && !datos) return <Cargando />;
  if (error) return <Mensaje tipo="error">{error.message}</Mensaje>;

  if (!datos.esLocalidad) {
    return (
      <Tarjeta titulo="Tienda y santuario">
        <p>
          Estás en {datos.zona}. La tienda y el santuario solo están en las localidades (Valle del Encanto, Lago
          Sombrío y Ciudad Umbral).
        </p>
      </Tarjeta>
    );
  }

  return (
    <div className="pila">
      <div className="encabezado-pagina">
        <h1>Tienda · {datos.zona}</h1>
        <strong className="tienda__bytes">{datos.bytes} bytes</strong>
      </div>
      <Mensaje tipo={aviso?.tipo} alCerrar={() => setAviso(null)}>
        {aviso?.texto}
      </Mensaje>
      <div className="tienda">
        <Tarjeta titulo="Productos">
          <ul className="tienda__lista">
            {datos.productos.map((p) => {
              const cantidad = cantidades[p.id] || 1;
              const alcanza = datos.bytes >= p.precio * cantidad;
              return (
                <li key={p.id} className="tienda__objeto">
                  <div>
                    <strong>{p.nombre}</strong>
                    <p className="texto-suave">
                      {p.descripcion} · Tienes {p.tienes}
                    </p>
                  </div>
                  <span className="tienda__precio">{p.precio} bytes</span>
                  <select
                    className="tienda__cantidad"
                    aria-label={`Cantidad de ${p.nombre}`}
                    value={cantidad}
                    onChange={(e) => cambiarCantidad(p.id, e.target.value)}
                  >
                    {CANTIDADES.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                  <Boton pequeno disabled={ocupado || !alcanza} onClick={() => ejecutar(() => comprar(p.id, cantidad))}>
                    Comprar
                  </Boton>
                </li>
              );
            })}
          </ul>
        </Tarjeta>
        <Tarjeta titulo="Santuario" subtitulo="Curación gratuita">
          <p>Recupera toda la vida de tus criaturas, incluso las debilitadas.</p>
          <Boton onClick={() => ejecutar(curarEquipo, true)} cargando={curando} disabled={ocupado}>
            Curar equipo
          </Boton>
        </Tarjeta>
      </div>
    </div>
  );
}
