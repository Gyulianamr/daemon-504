
/* ═══════════════════════════════════════════════════════════════════
 * ESTA PARTE LA TIENE QUE INTEGRAR: Jatniel Oliva
 * Tarea A4-06 · Rama: feature/a4-equipo · Fecha límite: miércoles 25 de noviembre
 * Commit: "feat(equipo): poner apodo y liberar criaturas"
 * ═══════════════════════════════════════════════════════════════════ */
import { useState } from 'react';
import { listarEquipo, hacerActiva, moverAReserva, moverAlEquipo, cambiarApodo, liberar } from '../js/servicios/equipo.js';
import { useCargar } from '../js/utils/useCargar.js';
import TarjetaCriatura from '../components/TarjetaCriatura.jsx';
import Boton from '../components/Boton.jsx';
import Mensaje from '../components/Mensaje.jsx';
import Cargando from '../components/Cargando.jsx';
import '../css/equipo.css';

// Equipo activo (máximo 6) y reserva. La criatura ★ es la primera en combatir.
// Cada criatura se puede mover, renombrar con un apodo o liberar; todo lo valida el servidor.
export default function Equipo() {
  const { datos, cargando, error, recargar } = useCargar(listarEquipo);
  const [ocupado, setOcupado] = useState(false);
  const [aviso, setAviso] = useState('');
  const [apodo, setApodo] = useState(null); // { id, texto } mientras se escribe un apodo
  const [porLiberar, setPorLiberar] = useState(null); // id de la criatura que espera confirmación

  if (cargando && !datos) return <Cargando />;
  if (error) return <Mensaje tipo="error">{error.message}</Mensaje>;

  async function cambiar(servicio, id, ...extra) {
    setOcupado(true);
    setAviso('');
    try {
      await servicio(id, ...extra);
      setApodo(null);
      setPorLiberar(null);
      await recargar();
    } catch (err) {
      setAviso(err.message);
    } finally {
      setOcupado(false);
    }
  }

  function guardarApodo(evento) {
    evento.preventDefault(); // evita que el formulario recargue la página
    cambiar(cambiarApodo, apodo.id, apodo.texto);
  }

  // Botones de apodo y liberar, iguales para el equipo y la reserva.
  function opciones(c) {
    if (apodo?.id === c.id) {
      return (
        <form className="equipo__apodo" onSubmit={guardarApodo}>
          <input aria-label={`Apodo de ${c.especie}`} maxLength={15} placeholder={c.especie} value={apodo.texto} onChange={(e) => setApodo({ id: c.id, texto: e.target.value })} />
          <Boton pequeno type="submit" disabled={ocupado}>Guardar</Boton>
          <Boton pequeno variante="secundario" onClick={() => setApodo(null)}>Cancelar</Boton>
        </form>
      );
    }
    if (porLiberar === c.id) {
      return (
        <div className="equipo__confirmar">
          <span>¿Liberar a {c.nombre}? No se puede deshacer.</span>
          <Boton pequeno variante="peligro" onClick={() => cambiar(liberar, c.id)} disabled={ocupado}>Sí, liberar</Boton>
          <Boton pequeno variante="secundario" onClick={() => setPorLiberar(null)}>No</Boton>
        </div>
      );
    }
    return (
      <>
        <Boton pequeno variante="secundario" onClick={() => setApodo({ id: c.id, texto: c.apodo ?? '' })} disabled={ocupado}>Apodo</Boton>
        <Boton pequeno variante="peligro" onClick={() => setPorLiberar(c.id)} disabled={ocupado}>Liberar</Boton>
      </>
    );
  }

  return (
    <div className="pila">
      <div className="encabezado-pagina">
        <h1>Equipo</h1>
        <span className="texto-suave">{datos.activo.length}/{datos.maximo} criaturas activas</span>
      </div>
      <Mensaje tipo="error" alCerrar={() => setAviso('')}>{aviso}</Mensaje>

      <div className="rejilla rejilla--3">
        {datos.activo.map((c) => (
          <TarjetaCriatura key={c.id} criatura={c} activa={c.posicion === 1}>
            {c.posicion !== 1 && <Boton pequeno onClick={() => cambiar(hacerActiva, c.id)} disabled={ocupado}>Hacer activa</Boton>}
            <Boton pequeno variante="secundario" onClick={() => cambiar(moverAReserva, c.id)} disabled={ocupado}>A reserva</Boton>
            {opciones(c)}
          </TarjetaCriatura>
        ))}
        {Array.from({ length: datos.maximo - datos.activo.length }, (_, i) => (
          <div key={i} className="equipo__libre">Espacio libre</div>
        ))}
      </div>

      <h2 className="equipo__subtitulo">Reserva</h2>
      {datos.reserva.length === 0 && <p className="texto-suave">No tienes criaturas en reserva.</p>}
      <div className="rejilla rejilla--3">
        {datos.reserva.map((c) => (
          <TarjetaCriatura key={c.id} criatura={c}>
            <Boton pequeno onClick={() => cambiar(moverAlEquipo, c.id)} disabled={ocupado || datos.activo.length >= datos.maximo}>Pasar al equipo</Boton>
            {opciones(c)}
          </TarjetaCriatura>
        ))}
      </div>
    </div>
  );
}
