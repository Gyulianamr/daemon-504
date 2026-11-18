import { Link } from 'react-router-dom';

// Se muestra cuando la ruta no existe.
export default function NoEncontrada() {
  return (
    <main className="contenedor-centrado">
      <section className="tarjeta">
        <h2 className="tarjeta__titulo">Página no encontrada</h2>
        <p>Esta ruta no existe en el mundo de DAEMON 504.</p>
        <Link to="/" className="boton boton--principal">Volver al inicio</Link>
      </section>
    </main>
  );
}
