import { useState } from 'react';

import {
  listarInventario,
  usarObjeto,
} from '../js/servicios/inventario.js';

import { listarEquipo } from '../js/servicios/equipo.js';
import { useCargar } from '../js/utils/useCargar.js';

import Tarjeta from '../components/Tarjeta.jsx';
import Boton from '../components/Boton.jsx';
import Mensaje from '../components/Mensaje.jsx';
import Cargando from '../components/Cargando.jsx';

import '../css/inventario.css';

// Carga los objetos del inventario y las criaturas activas.
const cargarTodo = async () => ({
  objetos: await listarInventario(),
  equipo: (await listarEquipo()).activo,
});

// Pantalla para consultar y utilizar los objetos disponibles.
export default function Inventario() {
  const { datos, cargando, error, recargar } = useCargar(cargarTodo);

  const [criaturaId, setCriaturaId] = useState('');
  const [aviso, setAviso] = useState(null);
  const [ocupado, setOcupado] = useState(false);

  // Muestra el indicador mientras se cargan los datos.
  if (cargando && !datos) return <Cargando />;

  // Muestra los errores al consultar el inventario.
  if (error) return <Mensaje tipo="error">{error.message}</Mensaje>;

  // Utiliza un objeto sobre la criatura seleccionada.
  async function usar(objetoId) {
    if (!criaturaId) {
      setAviso({
        tipo: 'aviso',
        texto: 'Elige primero una criatura.',
      });
      return;
    }

    setOcupado(true);
    setAviso(null);

    try {
      const resultado = await usarObjeto(
        objetoId,
        Number(criaturaId),
      );

      setAviso({
        tipo: 'exito',
        texto: resultado,
      });

      // Actualiza las cantidades y la vida de las criaturas.
      await recargar();
    } catch (err) {
      setAviso({
        tipo: 'error',
        texto: err.message,
      });
    } finally {
      setOcupado(false);
    }
  }

  return (
    <div className="pila">
      <h1>Inventario</h1>

      <Mensaje
        tipo={aviso?.tipo}
        alCerrar={() => setAviso(null)}
      >
        {aviso?.texto}
      </Mensaje>

      <div className="inventario">
        {/* Lista de objetos disponibles */}
        <div className="rejilla rejilla--2">
          {datos.objetos.length === 0 && (
            <p className="texto-suave">
              Tu inventario está vacío.
            </p>
          )}

          {datos.objetos.map((objeto) => (
            <Tarjeta key={objeto.id}>
              <div className="inventario__fila">
                <div>
                  <h3 className="inventario__nombre">
                    {objeto.nombre}
                  </h3>

                  <p className="texto-suave">
                    {objeto.descripcion}
                  </p>
                </div>

                <span className="inventario__cantidad">
                  ×{objeto.cantidad}
                </span>
              </div>

              {objeto.tipo === 'curacion' && (
                <Boton
                  pequeno
                  onClick={() => usar(objeto.id)}
                  disabled={ocupado || !criaturaId}
                >
                  Usar
                </Boton>
              )}
            </Tarjeta>
          ))}
        </div>

        {/* Selección de la criatura que recibirá el objeto */}
        <Tarjeta titulo="Usar en">
          <div className="campo">
            <label htmlFor="criatura">
              Criatura del equipo
            </label>

            <select
              id="criatura"
              value={criaturaId}
              onChange={(e) => setCriaturaId(e.target.value)}
            >
              <option value="">Elige…</option>

              {datos.equipo.map((criatura) => (
                <option
                  key={criatura.id}
                  value={criatura.id}
                >
                  {criatura.nombre} · {criatura.vida}/{criatura.vidaMax} HP
                </option>
              ))}
            </select>
          </div>

          <p className="texto-suave">
            Las esferas de captura se usan durante un combate.
          </p>
        </Tarjeta>
      </div>
    </div>
  );
}
