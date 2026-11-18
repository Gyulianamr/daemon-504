import { conEstado, fallar, resumenPersonaje } from '../partida.js';

const LONGITUD_MINIMA_CONTRASENA = 8;

function validarCredenciales(correo, contrasena) {
  if (!correo.includes('@') || contrasena.length < LONGITUD_MINIMA_CONTRASENA) {
    fallar(400, 'Introduce un correo válido y una contraseña de al menos 8 caracteres.');
  }
}

function obtenerCorreoNormalizado(correo) {
  return correo.trim().toLowerCase();
}

function crearRespuestaSesion(datos, estado) {
  const usuario = estado.usuarios.find((usuarioActual) => usuarioActual.id === estado.sesion);

  if (!usuario) {
    return { usuario: null, personaje: null };
  }

  const partida = estado.partidas[usuario.id];

  return {
    usuario: { id: usuario.id, correo: usuario.correo },
    personaje: partida ? resumenPersonaje(datos, partida) : null,
  };
}

export function obtenerSesion() {
  return conEstado(({ datos, estado }) => {
    if (!estado.sesion) {
      return { usuario: null, personaje: null };
    }

    return crearRespuestaSesion(datos, estado);
  });
}

export async function iniciarSesion(correo, contrasena) {
  validarCredenciales(correo, contrasena);
  const correoNormalizado = obtenerCorreoNormalizado(correo);

  return conEstado(({ datos, estado }) => {
    const usuario = estado.usuarios.find((usuarioActual) =>
      usuarioActual.correo.toLowerCase() === correoNormalizado &&
      usuarioActual.contrasena === contrasena
    );

    if (!usuario) {
      fallar(401, 'El correo o la contraseña son incorrectos.');
    }

    estado.sesion = usuario.id;
    return crearRespuestaSesion(datos, estado);
  });
}

export async function registrarse(correo, contrasena) {
  validarCredenciales(correo, contrasena);
  const correoNormalizado = obtenerCorreoNormalizado(correo);

  return conEstado(({ datos, estado }) => {
    const usuarioExistente = estado.usuarios.find((usuarioActual) =>
      usuarioActual.correo.toLowerCase() === correoNormalizado
    );

    if (usuarioExistente) {
      fallar(409, 'Ya existe una cuenta con ese correo.');
    }

    const usuario = {
      id: `u-${Date.now()}-${estado.usuarios.length}`,
      correo: correoNormalizado,
      contrasena,
    };

    estado.usuarios.push(usuario);
    estado.sesion = usuario.id;
    return crearRespuestaSesion(datos, estado);
  });
}

export async function cerrarSesion() {
  return conEstado(({ estado }) => {
    estado.sesion = null;
  });
}