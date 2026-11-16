
/* ═══════════════════════════════════════════════════════════════════
 * ESTA PARTE LA TIENE QUE INTEGRAR: Jatniel Oliva
 * Tarea A2-14 · Rama: feature/a2-pantallas-equipo · Fecha límite: lunes 16 de noviembre
 * Commit: "feat(equipo): pantalla de equipo y reserva"
 * ═══════════════════════════════════════════════════════════════════ */

import { useState } from 'react';
import {
  listarEquipo,
  hacerActiva,
  moverAReserva,
  moverAlEquipo,
} from '../js/servicios/equipo.js';

import { useCargar } from '../js/utils/useCargar.js';
import TarjetaCriatura from '../components/TarjetaCriatura.jsx';
import Boton from '../components/Boton.jsx';
import Mensaje from '../components/Mensaje.jsx';
import Cargando from '../components/Cargando.jsx';
import '../css/equipo.css';

// Muestra las criaturas activas y las que están en reserva.
export default function Equipo() {
  const { datos, cargando, error, recargar } = useCargar(listarEquipo);

  const [ocupado, setOcupado] = useState(false);
  const [aviso, setAviso] = useState('');

  // Mientras se cargan los datos, mostramos el componente de carga.
  if (cargando && !datos) return <Cargando />;

  // Si ocurre un error al consultar el equipo, lo mostramos.
  if (error) return <Mensaje tipo="error">{error.message}</Mensaje>;

  // Ejecuta una acción sobre una criatura y actualiza la pantalla.
  async function cambiar(servicio, id) {
    setOcupado(true);
    setAviso('');

    try {
      await servicio(id);
      await recargar();
    } catch (err) {
      setAviso(err.message);
    } finally {
      setOcupado(false);
    }
  }

  return (
    <div className="pila">
      <div className="encabezado-pagina">
        <h1>Equipo</h1>

        <span className="texto-suave">
          {datos.activo.length}/{datos.maximo} criaturas activas
        </span>
      </div>

      <Mensaje
        tipo="error"
        alCerrar={() => setAviso('')}
      >
        {aviso}
      </Mensaje>

      {/* Criaturas que forman parte del equipo activo */}
      <div className="rejilla rejilla--3">
        {datos.activo.map((criatura) => (
          <TarjetaCriatura
            key={criatura.id}
            criatura={criatura}
            activa={criatura.posicion === 1}
          >
            {criatura.posicion !== 1 && (
              <Boton
                pequeno
                onClick={() => cambiar(hacerActiva, criatura.id)}
                disabled={ocupado}
              >
                Hacer activa
              </Boton>
            )}

            <Boton
              pequeno
              variante="secundario"
              onClick={() => cambiar(moverAReserva, criatura.id)}
              disabled={ocupado}
            >
              A reserva
            </Boton>
          </TarjetaCriatura>
        ))}

        {/* Espacios disponibles hasta completar las seis posiciones */}
        {Array.from(
          { length: datos.maximo - datos.activo.length },
          (_, i) => (
            <div key={i} className="equipo__libre">
              Espacio libre
            </div>
          )
        )}
      </div>

      {/* Criaturas que actualmente están en reserva */}
      <h2 className="equipo__subtitulo">Reserva</h2>

      {datos.reserva.length === 0 && (
        <p className="texto-suave">
          No tienes criaturas en reserva.
        </p>
      )}

      <div className="rejilla rejilla--3">
        {datos.reserva.map((criatura) => (
          <TarjetaCriatura
            key={criatura.id}
            criatura={criatura}
          >
            <Boton
              pequeno
              onClick={() => cambiar(moverAlEquipo, criatura.id)}
              disabled={ocupado || datos.activo.length >= datos.maximo}
            >
              Pasar al equipo
            </Boton>
          </TarjetaCriatura>
        ))}
      </div>
    </div>
  );
}
